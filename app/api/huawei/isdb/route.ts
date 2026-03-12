import { NextRequest, NextResponse } from "next/server";
import {
  buildHuaweiIsdb,
  buildHuaweiIsdbFilename,
  HUAWEI_ISDB_BUNDLES,
  HUAWEI_ISDB_PROVIDERS,
  resolveHuaweiIsdbProviderIds,
} from "@/lib/huawei-isdb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const bundleId = request.nextUrl.searchParams.get("bundle");
  const providerParam = request.nextUrl.searchParams.get("providers") ?? "";
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const providerIds = providerParam
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!bundleId && providerIds.length === 0) {
    return NextResponse.json({
      providers: HUAWEI_ISDB_PROVIDERS,
      bundles: HUAWEI_ISDB_BUNDLES,
      note: "华为防火墙导入使用按行 CIDR 的 .csv 地址库文件。",
    });
  }

  try {
    const resolvedProviderIds = resolveHuaweiIsdbProviderIds(providerIds, bundleId);
    const data = await buildHuaweiIsdb(resolvedProviderIds);
    const filename = buildHuaweiIsdbFilename({
      bundleId,
      providerIds: resolvedProviderIds,
    });

    if (format === "json") {
      return NextResponse.json({
        ...data,
        filename,
      });
    }

    const csvBody = `${data.cidrs.join("\n")}\n`;
    return new NextResponse(csvBody, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
        "X-Huawei-ISDB-Count": String(data.count),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "生成 ISDB 失败";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
