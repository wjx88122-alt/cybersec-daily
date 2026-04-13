import { NextRequest, NextResponse } from "next/server";
import { generateRuleExport } from "@/lib/intelligence-ops";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format");
  const kind = request.nextUrl.searchParams.get("kind");
  const value = request.nextUrl.searchParams.get("value");
  const title = request.nextUrl.searchParams.get("title") ?? undefined;

  if (
    (format !== "sigma" && format !== "suricata" && format !== "splunk") ||
    (kind !== "ioc" && kind !== "vulnerability") ||
    !value
  ) {
    return NextResponse.json(
      { error: "format, kind, and value are required" },
      { status: 400 },
    );
  }

  const content = generateRuleExport({
    format,
    kind,
    value,
    title,
  });

  return new NextResponse(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `inline; filename="${kind}-${format}.txt"`,
    },
  });
}
