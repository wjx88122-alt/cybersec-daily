import https from "node:https";
import { NextRequest, NextResponse } from "next/server";

/**
 * 华为防火墙 RESTCONF 代理 API
 * 
 * 前端发请求到 /api/huawei，本 route 转发到华为防火墙 RESTCONF API。
 * 这样做的原因：
 * 1. 避免浏览器 CORS 限制
 * 2. 处理华为自签名证书
 * 3. 统一错误处理和日志
 */

interface HuaweiRequest {
  host: string;
  port: string;
  username: string;
  password: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;       // RESTCONF path, e.g. "/restconf/data/huawei-system:system"
  body?: unknown;
  verifySsl?: boolean;
}

type ProxyRequestOptions = {
  method: HuaweiRequest["method"];
  headers: Record<string, string>;
  body?: string;
  signal: AbortSignal;
};

// Validate required fields
function validate(req: HuaweiRequest): string | null {
  if (!req.host) return "缺少防火墙地址 (host)";
  if (!req.port) return "缺少端口 (port)";
  if (!req.username) return "缺少用户名";
  if (!req.password) return "缺少密码";
  if (!req.path) return "缺少 API 路径 (path)";
  if (!req.method) return "缺少请求方法 (method)";
  // Basic IP/hostname validation
  if (!/^[\w.\-:]+$/.test(req.host)) return "防火墙地址格式无效";
  if (!/^\d+$/.test(req.port) || +req.port < 1 || +req.port > 65535) return "端口范围无效";
  // Prevent path traversal
  if (!req.path.startsWith("/restconf/")) return "API 路径必须以 /restconf/ 开头";
  return null;
}

function fetchWithInsecureTls(
  url: string,
  options: ProxyRequestOptions,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: options.method,
        headers: options.headers,
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => {
          cleanup();
          const responseHeaders = new Headers();
          for (const [key, value] of Object.entries(res.headers)) {
            if (Array.isArray(value)) responseHeaders.set(key, value.join(", "));
            else if (typeof value === "string") responseHeaders.set(key, value);
          }
          resolve(
            new Response(Buffer.concat(chunks).toString("utf8"), {
              status: res.statusCode ?? 502,
              statusText: res.statusMessage ?? "Bad Gateway",
              headers: responseHeaders,
            }),
          );
        });
      },
    );

    const onAbort = () => req.destroy(new Error("AbortError"));
    const cleanup = () => options.signal.removeEventListener("abort", onAbort);

    req.on("error", (err) => {
      cleanup();
      reject(err);
    });

    if (options.signal.aborted) {
      onAbort();
      return;
    }

    options.signal.addEventListener("abort", onAbort, { once: true });

    if (options.body) req.write(options.body);
    req.end();
  });
}

async function proxyFetch(
  url: string,
  options: ProxyRequestOptions,
  verifySsl: boolean,
): Promise<Response> {
  if (verifySsl) {
    return fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      signal: options.signal,
    });
  }
  return fetchWithInsecureTls(url, options);
}

export async function POST(request: NextRequest) {
  try {
    const body: HuaweiRequest = await request.json();
    
    // Validate
    const err = validate(body);
    if (err) {
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { host, port, username, password, method, path, body: reqBody } = body;
    const url = `https://${host}:${port}${path}`;
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const headers: Record<string, string> = {
      "Authorization": `Basic ${auth}`,
      "Accept": "application/yang-data+json",
      "Content-Type": "application/yang-data+json",
    };

    const requestBody =
      reqBody && method !== "GET" ? JSON.stringify(reqBody) : undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let response: Response;
    try {
      response = await proxyFetch(
        url,
        {
          method,
          headers,
          body: requestBody,
          signal: controller.signal,
        },
        body.verifySsl !== false,
      );
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("abort")) {
        return NextResponse.json({ success: false, error: "连接超时 (15s)，请检查防火墙地址和端口" }, { status: 504 });
      }
      if (msg.includes("ECONNREFUSED")) {
        return NextResponse.json({ success: false, error: `连接被拒绝: ${host}:${port}，请确认防火墙 RESTCONF 服务已启用` }, { status: 502 });
      }
      if (lowerMsg.includes("cert") || lowerMsg.includes("certificate") || lowerMsg.includes("ssl")) {
        return NextResponse.json({ success: false, error: "SSL 证书验证失败，请关闭「验证 SSL 证书」选项（华为设备默认使用自签名证书）" }, { status: 502 });
      }
      return NextResponse.json({ success: false, error: `网络错误: ${msg}` }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }

    // Parse response
    const contentType = response.headers.get("content-type") || "";
    let data: unknown = null;
    
    if (contentType.includes("json") || contentType.includes("yang")) {
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    }, { status: response.ok ? 200 : response.status });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: `服务器内部错误: ${msg}` }, { status: 500 });
  }
}
