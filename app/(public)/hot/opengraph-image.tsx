import { ImageResponse } from "next/og";
import { loadHotItems, hotItemTitle } from "@/lib/hot-page-data";

export const runtime = "edge";
export const revalidate = 300;
export const alt = "Security Hot — 安全热榜 · 跨信源聚合热度排序";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * /hot 的动态 OG 分享图 (Next.js opengraph-image 约定)。
 * 1200×630 PNG，内容: Security Hot 标题 + 当前 TOP 热榜条目。
 * 与 AI HOT 的动态分享卡片对齐。
 */
export default async function OpengraphImage() {
  const items = await loadHotItems("24h", 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0b1220 0%, #14233d 55%, #0b1220 100%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#fff",
        }}
      >
        {/* 顶部 brand 行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg,#ef4444,#f59e0b)",
              fontSize: 24,
            }}
          >
            🔥
          </div>
          <span style={{ color: "#fbbf24" }}>SECURITY HOT</span>
          <span style={{ color: "#64748b", fontWeight: 500 }}>
            安全热榜 · 跨信源聚合热度排序
          </span>
        </div>

        {/* 主标题 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#fff",
            }}
          >
            今天安全圈最值得关注的事
          </span>
        </div>

        {/* TOP 热榜条目 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            gap: 14,
            flexGrow: 1,
          }}
        >
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                fontSize: 28,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 52,
                  height: 52,
                  borderRadius: 14,
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#fff",
                  background:
                    item.rank === 1
                      ? "#ef4444"
                      : item.rank === 2
                        ? "#f97316"
                        : item.rank === 3
                          ? "#f59e0b"
                          : "#475569",
                }}
              >
                {String(item.rank).padStart(2, "0")}
              </span>
              <span
                style={{
                  color: "#e2e8f0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 920,
                }}
              >
                {hotItemTitle(item).slice(0, 44)}
              </span>
            </div>
          ))}
        </div>

        {/* 底部 footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          <span>{items.length > 0 ? `当前 ${items.length}+ 条热榜` : "今日热榜"}</span>
          <span style={{ color: "#fbbf24", fontWeight: 700 }}>
            cybersec-daily.vercel.app/hot
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
