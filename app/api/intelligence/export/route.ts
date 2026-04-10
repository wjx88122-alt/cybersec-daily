import { NextRequest, NextResponse } from "next/server";
import { buildLiveIntelligenceSnapshot } from "@/lib/intelligence-sources";

export const dynamic = "force-dynamic";

function toMarkdown(snapshot: Awaited<ReturnType<typeof buildLiveIntelligenceSnapshot>>, cve?: string) {
  const vulnerability = cve
    ? snapshot.vulnerabilities.find((item) => item.cve === cve)
    : null;

  if (vulnerability) {
    return [
      `# ${vulnerability.cve}`,
      "",
      `- 标题：${vulnerability.title}`,
      `- 严重度：${vulnerability.severity}`,
      `- CVSS：${vulnerability.cvss}`,
      `- 在野利用：${vulnerability.inTheWild ? "是" : "否"}`,
      `- 利用态势：${vulnerability.exploitMaturity}`,
      "",
      "## 摘要",
      "",
      vulnerability.summary,
      "",
      "## 检测建议",
      "",
      ...vulnerability.detection.map((item) => `- ${item}`),
      "",
      "## 缓解建议",
      "",
      ...vulnerability.mitigation.map((item) => `- ${item}`),
      "",
    ].join("\n");
  }

  return [
    "# 情报中心实时快照",
    "",
    `- 更新时间：${snapshot.updatedAt}`,
    "",
    "## 实时漏洞专题",
    "",
    ...snapshot.vulnerabilities.flatMap((item) => [
      `### ${item.cve}`,
      `- 标题：${item.title}`,
      `- 严重度：${item.severity}`,
      `- CVSS：${item.cvss}`,
      `- 利用态势：${item.exploitMaturity}`,
      "",
    ]),
    "## 官方预警",
    "",
    ...snapshot.advisories.flatMap((item) => [
      `### ${item.title}`,
      `- 行业：${item.industries.join(" / ")}`,
      `- 紧急度：${item.urgency}`,
      "",
    ]),
  ].join("\n");
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  const cve = request.nextUrl.searchParams.get("cve") ?? undefined;
  const snapshot = await buildLiveIntelligenceSnapshot();

  if (cve && !snapshot.vulnerabilities.some((item) => item.cve === cve)) {
    return NextResponse.json({ error: "CVE not found" }, { status: 404 });
  }

  if (format === "markdown") {
    return new NextResponse(toMarkdown(snapshot, cve), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `inline; filename="${cve ?? "intelligence-snapshot"}.md"`,
      },
    });
  }

  const payload = cve
    ? snapshot.vulnerabilities.find((item) => item.cve === cve)
    : snapshot;

  return NextResponse.json(payload);
}
