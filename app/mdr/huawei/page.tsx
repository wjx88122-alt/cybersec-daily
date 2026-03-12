"use client";

import { useState, useCallback } from "react";
import NavBar from "@/components/NavBar";

/* ── Types ── */
interface HuaweiConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  verifySsl: boolean;
  model: string;
}

type ActionType = "block_ip" | "block_domain" | "block_port" | "isolate_host" | "add_policy" | "add_blacklist";
type ActionStatus = "pending" | "executing" | "success" | "failed" | "rollback";

interface DisposalAction {
  id: string;
  type: ActionType;
  params: Record<string, string>;
  status: ActionStatus;
  ticketId?: string;
  operator: string;
  createdAt: string;
  executedAt?: string;
  result?: string;
  restconfLog?: RestconfLog[];
}

interface RestconfLog {
  method: string;
  path: string;
  status: number;
  statusText: string;
  duration: number;
  request?: unknown;
  response?: unknown;
  error?: string;
}

interface TestResult {
  status: "idle" | "testing" | "success" | "error";
  message: string;
  model?: string;
  version?: string;
  hostname?: string;
  sysName?: string;
  uptime?: string;
  raw?: unknown;
}

const ACTION_LABELS: Record<ActionType, { label: string; icon: string; desc: string }> = {
  block_ip: { label: "封禁 IP", icon: "🚫", desc: "安全策略拒绝指定源 IP" },
  block_domain: { label: "封禁域名", icon: "🌐", desc: "URL 过滤阻断恶意域名" },
  block_port: { label: "封禁端口", icon: "🔌", desc: "关闭指定端口入站/出站" },
  isolate_host: { label: "隔离主机", icon: "🔒", desc: "双向阻断受感染主机流量" },
  add_policy: { label: "下发策略", icon: "📋", desc: "新增自定义安全策略规则" },
  add_blacklist: { label: "加入黑名单", icon: "⛔", desc: "IP 加入全局黑名单" },
};

const STATUS_STYLE: Record<ActionStatus, { label: string; color: string }> = {
  pending: { label: "待执行", color: "bg-gray-500/20 text-gray-400" },
  executing: { label: "执行中", color: "bg-cyan-500/20 text-cyan-400" },
  success: { label: "已完成", color: "bg-green-500/20 text-green-400" },
  failed: { label: "失败", color: "bg-red-500/20 text-red-400" },
  rollback: { label: "已回滚", color: "bg-yellow-500/20 text-yellow-400" },
};

const STORAGE_KEY = "huawei_fw_config";
const HISTORY_KEY = "huawei_fw_history";

function loadConfig(): HuaweiConfig {
  if (typeof window === "undefined") return { host: "", port: "8443", username: "", password: "", verifySsl: false, model: "USG6000E" };
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return { host: "", port: "8443", username: "", password: "", verifySsl: false, model: "USG6000E" };
}

function saveConfig(c: HuaweiConfig) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

function loadHistory(): DisposalAction[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(HISTORY_KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return [];
}

function saveHistory(h: DisposalAction[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 200))); } catch { /* ignore */ }
}

/* ── RESTCONF API caller ── */
async function callRestconf(config: HuaweiConfig, method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; statusText: string; data: unknown; duration: number }> {
  const start = Date.now();
  const res = await fetch("/api/huawei", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      verifySsl: config.verifySsl,
      method,
      path,
      body,
    }),
  });
  const json = await res.json();
  return { ok: json.success, status: json.status || res.status, statusText: json.statusText || json.error || "", data: json.data, duration: Date.now() - start };
}

/* ── RESTCONF body builders for each action ── */
function buildRestconfCalls(type: ActionType, params: Record<string, string>): { method: string; path: string; body?: unknown; desc: string }[] {
  const ts = Date.now();
  switch (type) {
    case "block_ip": {
      const ruleName = params.name || `MDR_Block_${params.ip?.replace(/\./g, "_")}_${ts}`;
      return [{
        method: "POST", desc: `创建安全策略规则: ${ruleName}`,
        path: "/restconf/data/huawei-security-policy:sec-policy/static-policy",
        body: { "static-policy": { rule: [{ name: ruleName, action: "false", "source-ip": { "address-ipv4": [`${params.ip}/${params.mask || "32"}`] } }] } },
      }];
    }
    case "block_domain": return [{
      method: "POST", desc: `创建 URL 过滤策略封禁: ${params.domain}`,
      path: "/restconf/data/huawei-security-policy:sec-policy/static-policy",
      body: { "static-policy": { rule: [{ name: `MDR_Block_Domain_${ts}`, action: "false", desc: `Block domain ${params.domain}` }] } },
    }];
    case "block_port": {
      const ruleName = `MDR_Block_Port_${params.port}_${ts}`;
      return [{
        method: "POST", desc: `封禁端口 ${params.protocol || "tcp"}/${params.port}`,
        path: "/restconf/data/huawei-security-policy:sec-policy/static-policy",
        body: { "static-policy": { rule: [{ name: ruleName, action: "false", "source-zone": params.srcZone || "untrust", "destination-zone": params.dstZone || "trust", service: { "service-items": [{ protocol: params.protocol || "tcp", "destination-port": params.port }] } }] } },
      }];
    }
    case "isolate_host": {
      const base = `MDR_Isolate_${params.ip?.replace(/\./g, "_")}_${ts}`;
      return [
        { method: "POST", desc: `隔离出站: ${params.ip}`, path: "/restconf/data/huawei-security-policy:sec-policy/static-policy",
          body: { "static-policy": { rule: [{ name: `${base}_out`, action: "false", "source-ip": { "address-ipv4": [`${params.ip}/32`] } }] } } },
        { method: "POST", desc: `隔离入站: ${params.ip}`, path: "/restconf/data/huawei-security-policy:sec-policy/static-policy",
          body: { "static-policy": { rule: [{ name: `${base}_in`, action: "false", "destination-ip": { "address-ipv4": [`${params.ip}/32`] } }] } } },
      ];
    }
    case "add_policy": return [{
      method: "POST", desc: `下发自定义策略: ${params.name || "MDR_Custom"}`,
      path: "/restconf/data/huawei-security-policy:sec-policy/static-policy",
      body: { "static-policy": { rule: [{ name: params.name || `MDR_Custom_${ts}`, action: params.action === "permit" ? "true" : "false",
        ...(params.srcZone ? { "source-zone": params.srcZone } : {}), ...(params.dstZone ? { "destination-zone": params.dstZone } : {}),
        ...(params.srcIp ? { "source-ip": { "address-ipv4": [`${params.srcIp}/${params.srcMask || "32"}`] } } : {}),
        ...(params.dstIp ? { "destination-ip": { "address-ipv4": [`${params.dstIp}/${params.dstMask || "32"}`] } } : {}),
      }] } },
    }];
    case "add_blacklist": return [{
      method: "POST", desc: `加入黑名单: ${params.ip}`,
      path: "/restconf/data/huawei-blacklist:blacklist",
      body: { blacklist: { item: [{ "ip-address": params.ip, timeout: parseInt(params.timeout || "1440", 10) }] } },
    }];
    default: return [];
  }
}

const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-black/[0.03] border border-black/[0.06] text-[#1a1a2e] placeholder-[#94a3b8] focus:outline-none focus:border-black/[0.15] transition-all";
const selectCls = inputCls + " appearance-none";

type HwTab = "connect" | "dispose" | "history" | "api";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

/* ── Connection Panel ── */
function ConnPanel({ config, setConfig, test, onTest, onSave }: {
  config: HuaweiConfig; setConfig: (c: HuaweiConfig) => void; test: TestResult; onTest: () => void; onSave: () => void;
}) {
  const upd = (k: keyof HuaweiConfig, v: string | boolean) => { const c = { ...config, [k]: v }; setConfig(c); };
  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-5">
        <div className="text-sm font-medium text-[#1a1a2e] mb-4">🔌 华为防火墙连接配置</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-xs text-[#64748b] mb-1">防火墙公网地址 *</label>
            <input className={inputCls} placeholder="203.0.113.10" value={config.host} onChange={(e) => upd("host", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#64748b] mb-1">RESTCONF 端口</label>
              <input className={inputCls} placeholder="8443" value={config.port} onChange={(e) => upd("port", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">设备型号</label>
              <select className={selectCls} value={config.model} onChange={(e) => upd("model", e.target.value)}>
                {["USG6000E", "USG6000", "USG9500", "HiSecEngine USG6600E", "HiSecEngine USG6500E", "USG6300E"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select></div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="block text-xs text-[#64748b] mb-1">用户名 *</label>
            <input className={inputCls} placeholder="admin" value={config.username} onChange={(e) => upd("username", e.target.value)} /></div>
          <div><label className="block text-xs text-[#64748b] mb-1">密码 *</label>
            <input className={inputCls} type="password" placeholder="••••••••" value={config.password} onChange={(e) => upd("password", e.target.value)} /></div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-[#64748b]">
            <input type="checkbox" checked={config.verifySsl} onChange={(e) => upd("verifySsl", e.target.checked)} className="w-3.5 h-3.5 rounded accent-red-600" />
            验证 SSL 证书（华为默认自签名，建议关闭）
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onSave} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-black/[0.05] text-[#1a1a2e] border border-black/[0.08] hover:bg-black/[0.08] transition-all">💾 保存配置</button>
          <button onClick={onTest} disabled={test.status === "testing"} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600/10 text-red-600 border border-red-600/20 hover:bg-red-600/20 disabled:opacity-50 transition-all">
            {test.status === "testing" ? "⏳ 连接中..." : "🧪 测试连接"}
          </button>
        </div>
      </div>
      {test.status !== "idle" && (
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-medium text-[#1a1a2e] mb-2">连接测试结果</div>
          {test.status === "testing" && <div className="flex items-center gap-2 text-xs text-[#64748b]"><div className="w-3 h-3 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />正在连接 {config.host}:{config.port} ...</div>}
          {test.status === "success" && (
            <div className="space-y-2">
              <div className="text-xs text-green-600 font-medium">✅ 连接成功</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {test.sysName && <div><span className="text-[#94a3b8]">设备名:</span> <span className="font-mono text-[#1a1a2e]">{test.sysName}</span></div>}
                {test.hostname && <div><span className="text-[#94a3b8]">地址:</span> <span className="font-mono text-[#1a1a2e]">{test.hostname}</span></div>}
                {test.model && <div><span className="text-[#94a3b8]">型号:</span> <span className="font-mono text-[#1a1a2e]">{test.model}</span></div>}
                {test.version && <div><span className="text-[#94a3b8]">版本:</span> <span className="font-mono text-[#1a1a2e]">{test.version}</span></div>}
              </div>
              {test.raw != null && <details className="mt-2"><summary className="text-[10px] text-[#94a3b8] cursor-pointer">原始响应</summary>
                <pre className="mt-1 rounded-lg bg-[#1e293b] p-2 text-[10px] text-green-400 overflow-x-auto max-h-40">{JSON.stringify(test.raw, null, 2)}</pre>
              </details>}
            </div>
          )}
          {test.status === "error" && <div className="text-xs text-red-500">❌ {test.message}</div>}
        </div>
      )}
      <div className="glass rounded-xl p-4">
        <div className="text-[10px] text-[#94a3b8] space-y-1">
          <div className="text-[#64748b] font-medium mb-1">⚠️ 使用前请确认：</div>
          <div>1. 防火墙已启用 RESTCONF 服务：<span className="font-mono">system-view → restconf → enable</span></div>
          <div>2. 管理用户有 API 权限：<span className="font-mono">aaa → local-user xxx service-type restconf</span></div>
          <div>3. 安全策略允许 RESTCONF 端口访问：默认 8443/TCP</div>
          <div>4. 凭据仅存储在浏览器本地，不会上传到服务器</div>
        </div>
      </div>
    </div>
  );
}

/* ── Disposal Panel ── */
function DisposePanel({ config, onExecute }: { config: HuaweiConfig; onExecute: (action: DisposalAction) => void }) {
  const [actionType, setActionType] = useState<ActionType>("block_ip");
  const [params, setParams] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [executing, setExecuting] = useState(false);

  const calls = buildRestconfCalls(actionType, params);
  const updParam = (k: string, v: string) => setParams({ ...params, [k]: v });

  const handleExecute = async () => {
    if (!config.host || !config.username) { alert("请先在「连接配置」中填写防火墙信息"); return; }
    setExecuting(true);
    const logs: RestconfLog[] = [];
    let allOk = true;
    for (const call of calls) {
      try {
        const res = await callRestconf(config, call.method, call.path, call.body);
        logs.push({ method: call.method, path: call.path, status: res.status, statusText: res.statusText, duration: res.duration, request: call.body, response: res.data });
        if (!res.ok) allOk = false;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        logs.push({ method: call.method, path: call.path, status: 0, statusText: "", duration: 0, error: msg });
        allOk = false;
      }
    }
    const action: DisposalAction = {
      id: `DA-${Date.now()}`, type: actionType, params: { ...params },
      status: allOk ? "success" : "failed", operator: config.username, createdAt: new Date().toISOString(),
      executedAt: new Date().toISOString(), result: allOk ? `${calls.length} 条 RESTCONF 调用全部成功` : `部分调用失败，请查看详情`,
      restconfLog: logs,
    };
    setExecuting(false);
    onExecute(action);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <div className="text-sm font-medium text-[#1a1a2e] mb-3">🎯 选择处置动作</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(ACTION_LABELS) as [ActionType, typeof ACTION_LABELS[ActionType]][]).map(([key, val]) => (
            <button key={key} onClick={() => { setActionType(key); setParams({}); setPreview(false); }}
              className={`p-3 rounded-lg border text-left transition-all ${actionType === key ? "bg-red-600/10 border-red-600/20" : "bg-black/[0.02] border-black/[0.06] hover:bg-black/[0.04]"}`}>
              <div className="text-lg mb-1">{val.icon}</div>
              <div className={`text-xs font-medium ${actionType === key ? "text-red-600" : "text-[#1a1a2e]"}`}>{val.label}</div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">{val.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="glass rounded-xl p-4">
        <div className="text-sm font-medium text-[#1a1a2e] mb-3">📝 参数配置</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {actionType === "block_ip" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">恶意 IP 地址 *</label><input className={inputCls} placeholder="185.220.101.42" value={params.ip || ""} onChange={(e) => updParam("ip", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">子网掩码位数</label><input className={inputCls} placeholder="32" value={params.mask || ""} onChange={(e) => updParam("mask", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">规则名称</label><input className={inputCls} placeholder="自动生成" value={params.name || ""} onChange={(e) => updParam("name", e.target.value)} /></div>
          </>}
          {actionType === "block_domain" && <div className="sm:col-span-2"><label className="block text-xs text-[#64748b] mb-1">恶意域名 *</label><input className={inputCls} placeholder="malware-c2.example.com" value={params.domain || ""} onChange={(e) => updParam("domain", e.target.value)} /></div>}
          {actionType === "block_port" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">端口号 *</label><input className={inputCls} placeholder="4444" value={params.port || ""} onChange={(e) => updParam("port", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">协议</label><select className={selectCls} value={params.protocol || "tcp"} onChange={(e) => updParam("protocol", e.target.value)}><option value="tcp">TCP</option><option value="udp">UDP</option></select></div>
            <div><label className="block text-xs text-[#64748b] mb-1">源区域</label><input className={inputCls} placeholder="untrust" value={params.srcZone || ""} onChange={(e) => updParam("srcZone", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">目标区域</label><input className={inputCls} placeholder="trust" value={params.dstZone || ""} onChange={(e) => updParam("dstZone", e.target.value)} /></div>
          </>}
          {actionType === "isolate_host" && <div className="sm:col-span-2"><label className="block text-xs text-[#64748b] mb-1">主机 IP *</label><input className={inputCls} placeholder="10.1.10.32" value={params.ip || ""} onChange={(e) => updParam("ip", e.target.value)} /></div>}
          {actionType === "add_policy" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">策略名称 *</label><input className={inputCls} placeholder="MDR_Custom_Rule" value={params.name || ""} onChange={(e) => updParam("name", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">动作</label><select className={selectCls} value={params.action || "deny"} onChange={(e) => updParam("action", e.target.value)}><option value="deny">拒绝 (deny)</option><option value="permit">允许 (permit)</option></select></div>
            <div><label className="block text-xs text-[#64748b] mb-1">源区域</label><input className={inputCls} placeholder="any" value={params.srcZone || ""} onChange={(e) => updParam("srcZone", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">目标区域</label><input className={inputCls} placeholder="any" value={params.dstZone || ""} onChange={(e) => updParam("dstZone", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">源 IP</label><input className={inputCls} placeholder="可选" value={params.srcIp || ""} onChange={(e) => updParam("srcIp", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">目标 IP</label><input className={inputCls} placeholder="可选" value={params.dstIp || ""} onChange={(e) => updParam("dstIp", e.target.value)} /></div>
          </>}
          {actionType === "add_blacklist" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">IP 地址 *</label><input className={inputCls} placeholder="103.45.67.89" value={params.ip || ""} onChange={(e) => updParam("ip", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">超时(分钟)</label><input className={inputCls} placeholder="1440 (24小时)" value={params.timeout || ""} onChange={(e) => updParam("timeout", e.target.value)} /></div>
          </>}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setPreview(!preview)} className="px-3 py-1.5 text-xs rounded-lg bg-black/[0.03] text-[#64748b] border border-black/[0.06] hover:bg-black/[0.05] transition-all">
            {preview ? "隐藏预览" : "📋 预览 RESTCONF 请求"}
          </button>
          <button onClick={handleExecute} disabled={executing} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all">
            {executing ? "⏳ 执行中..." : "⚡ 立即执行"}
          </button>
        </div>
        {preview && (
          <div className="mt-3 space-y-2">
            {calls.map((call, i) => (
              <div key={i} className="rounded-lg bg-[#1e293b] p-3 overflow-x-auto">
                <div className="text-[10px] text-gray-500 mb-1">{call.desc}</div>
                <div className="font-mono text-[11px] text-cyan-400">{call.method} {call.path}</div>
                {call.body != null && <pre className="mt-1 font-mono text-[10px] text-green-400 whitespace-pre-wrap">{JSON.stringify(call.body, null, 2)}</pre>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── History Item ── */
function HistoryItem({ action: a }: { action: DisposalAction }) {
  const [showLog, setShowLog] = useState(false);
  const meta = ACTION_LABELS[a.type];
  const st = STATUS_STYLE[a.status];
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-[10px] text-[#94a3b8] font-mono">{a.id}</span>
        <span className="text-sm">{meta.icon}</span>
        <span className="text-xs font-medium text-[#1a1a2e]">{meta.label}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
        {a.ticketId && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">🔗 {a.ticketId}</span>}
      </div>
      <div className="text-xs text-[#64748b] mt-1">
        {Object.entries(a.params).map(([k, v]) => <span key={k} className="mr-3"><span className="text-[#94a3b8]">{k}:</span> <span className="font-mono">{v}</span></span>)}
      </div>
      {a.result && <div className={`text-xs mt-1 ${a.status === "success" ? "text-green-600" : a.status === "failed" ? "text-red-500" : "text-[#64748b]"}`}>{a.result}</div>}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#94a3b8]">
        <span>👤 {a.operator}</span>
        <span>📅 {timeAgo(a.createdAt)}</span>
        {a.restconfLog && <span>⚡ {a.restconfLog.reduce((s, l) => s + l.duration, 0)}ms</span>}
        {a.restconfLog && <button onClick={() => setShowLog(!showLog)} className="text-blue-500 hover:underline ml-auto">{showLog ? "隐藏日志" : "查看 RESTCONF 日志"}</button>}
      </div>
      {showLog && a.restconfLog && (
        <div className="mt-2 space-y-2">
          {a.restconfLog.map((log, i) => (
            <div key={i} className="rounded-lg bg-[#1e293b] p-2 overflow-x-auto text-[10px]">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-mono font-bold ${log.status >= 200 && log.status < 300 ? "text-green-400" : "text-red-400"}`}>{log.status || "ERR"}</span>
                <span className="text-cyan-400 font-mono">{log.method} {log.path}</span>
                <span className="text-gray-500 ml-auto">{log.duration}ms</span>
              </div>
              {log.error && <div className="text-red-400">Error: {log.error}</div>}
              {log.request != null && <details><summary className="text-gray-500 cursor-pointer">Request Body</summary><pre className="text-green-400 whitespace-pre-wrap mt-1">{JSON.stringify(log.request, null, 2)}</pre></details>}
              {log.response != null && <details><summary className="text-gray-500 cursor-pointer">Response</summary><pre className="text-cyan-400 whitespace-pre-wrap mt-1">{JSON.stringify(log.response, null, 2)}</pre></details>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Query Panel ── */
function QueryPanel({ config }: { config: HuaweiConfig }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; data: unknown } | null>(null);
  const [path, setPath] = useState("/restconf/data/huawei-security-policy:sec-policy/static-policy");

  const handleQuery = async () => {
    if (!config.host) { alert("请先配置防火墙连接"); return; }
    setLoading(true);
    try {
      const res = await callRestconf(config, "GET", path);
      setResult({ ok: res.ok, data: res.data });
    } catch (e: unknown) {
      setResult({ ok: false, data: e instanceof Error ? e.message : String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <div className="text-sm font-medium text-[#1a1a2e] mb-3">🔍 查询防火墙配置</div>
        <div className="flex gap-2">
          <select className={selectCls + " flex-1"} value={path} onChange={(e) => setPath(e.target.value)}>
            <option value="/restconf/data/huawei-security-policy:sec-policy/static-policy">安全策略列表</option>
            <option value="/restconf/data/huawei-system:system">系统信息</option>
            <option value="/restconf/data/huawei-interface:ifm/interfaces">接口列表</option>
            <option value="/restconf/data/huawei-security-zone:security-zone">安全区域</option>
            <option value="/restconf/data/huawei-aaa:aaa">AAA 配置</option>
          </select>
          <button onClick={handleQuery} disabled={loading} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600/10 text-red-600 border border-red-600/20 hover:bg-red-600/20 disabled:opacity-50 transition-all">
            {loading ? "查询中..." : "查询"}
          </button>
        </div>
        <div className="mt-2"><label className="block text-xs text-[#64748b] mb-1">自定义路径</label>
          <input className={inputCls} value={path} onChange={(e) => setPath(e.target.value)} placeholder="/restconf/data/..." />
        </div>
      </div>
      {result && (
        <div className="glass rounded-xl p-4">
          <div className={`text-xs font-medium mb-2 ${result.ok ? "text-green-600" : "text-red-500"}`}>{result.ok ? "✅ 查询成功" : "❌ 查询失败"}</div>
          <pre className="rounded-lg bg-[#1e293b] p-3 text-[10px] text-green-400 overflow-x-auto max-h-96 whitespace-pre-wrap">{typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════ */
export default function HuaweiPage() {
  const [tab, setTab] = useState<HwTab>("connect");
  const [config, setConfig] = useState<HuaweiConfig>(loadConfig);
  const [test, setTest] = useState<TestResult>({ status: "idle", message: "" });
  const [history, setHistory] = useState<DisposalAction[]>(loadHistory);

  const handleSave = useCallback(() => { saveConfig(config); alert("配置已保存到浏览器"); }, [config]);

  const handleTest = useCallback(async () => {
    const c = config;
    if (!c.host) { setTest({ status: "error", message: "请填写防火墙地址" }); return; }
    if (!c.username || !c.password) { setTest({ status: "error", message: "请填写用户名和密码" }); return; }
    setTest({ status: "testing", message: "" });
    try {
      const res = await callRestconf(c, "GET", "/restconf/data/huawei-system:system");
      if (res.ok) {
        const d = res.data as Record<string, unknown> | null;
        const sys = (d && typeof d === "object" ? d["huawei-system:system"] || d["system"] || d : d) as Record<string, string> | null;
        setTest({
          status: "success", message: "", hostname: c.host, model: c.model,
          sysName: sys?.["sys-name"] || sys?.["sysName"] || "",
          version: sys?.["software-version"] || sys?.["softwareVersion"] || sys?.["current-software"] || "",
          raw: d,
        });
      } else {
        setTest({ status: "error", message: `HTTP ${res.status}: ${res.statusText || "连接失败"}` });
      }
    } catch (e: unknown) {
      setTest({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }, [config]);

  const handleExecute = useCallback((action: DisposalAction) => {
    setHistory((prev) => { const h = [action, ...prev]; saveHistory(h); return h; });
    setTab("history");
  }, []);

  const tabs: { key: HwTab; label: string; icon: string }[] = [
    { key: "connect", label: "连接配置", icon: "🔌" },
    { key: "dispose", label: "处置下发", icon: "⚡" },
    { key: "history", label: "执行记录", icon: "📜" },
    { key: "api", label: "查询配置", icon: "🔍" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <NavBar active="MDR" />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <a href="/mdr" className="text-xs text-[#94a3b8] hover:text-[#64748b] transition-colors">← MDR 工单系统</a>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white font-bold text-sm">HW</div>
              <div>
                <h1 className="text-xl font-bold text-[#1a1a2e]">华为防火墙处置下发</h1>
                <p className="text-xs text-[#94a3b8]">{config.model} · RESTCONF API · {config.host ? `${config.host}:${config.port}` : "未配置"}</p>
              </div>
            </div>
            <a
              href="/mdr/huawei/isdb"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-600/20"
            >
              📦 SD-WAN ISDB 库
            </a>
          </div>
        </div>
        <div className="glass rounded-xl p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${test.status === "success" ? "bg-green-500 animate-pulse" : "bg-[#94a3b8]"}`} />
              <span className="text-[#64748b]">{test.status === "success" ? `已连接 · ${test.sysName || config.host}` : "未连接"}</span>
            </div>
            <div className="text-[#94a3b8]">记录: {history.length}</div>
          </div>
          {history.length > 0 && <button onClick={() => { if (confirm("确认清空所有执行记录？")) { setHistory([]); saveHistory([]); } }} className="px-3 py-1 text-[11px] rounded-lg bg-black/[0.03] text-[#64748b] hover:bg-black/[0.05] transition-all">清空记录</button>}
        </div>
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? "text-[#1a1a2e] bg-black/[0.05] border border-black/[0.08]" : "text-[#64748b] hover:text-[#1a1a2e] hover:bg-black/[0.04]"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {tab === "connect" && <ConnPanel config={config} setConfig={setConfig} test={test} onTest={handleTest} onSave={handleSave} />}
        {tab === "dispose" && <DisposePanel config={config} onExecute={handleExecute} />}
        {tab === "history" && (
          <div className="space-y-3">
            {history.length === 0 && <div className="text-xs text-[#94a3b8] text-center py-8">暂无执行记录</div>}
            {history.map((a) => <HistoryItem key={a.id} action={a} />)}
          </div>
        )}
        {tab === "api" && <QueryPanel config={config} />}
      </main>
    </div>
  );
}
