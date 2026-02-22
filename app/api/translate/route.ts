import { kv } from "@vercel/kv";
import { translateItems } from "@/lib/translate";
import { FeedItem } from "@/lib/feeds";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [feedA, feedB] = await Promise.all([
    kv.get<FeedItem[]>("feed-a"),
    kv.get<FeedItem[]>("feed-b"),
  ]);

  if (!feedA || !feedB) {
    return NextResponse.json({ error: "No feed data, run cron first" }, { status: 400 });
  }

  const allItems = [...feedA, ...feedB];

  try {
    const translations = await translateItems(allItems);
    translations.forEach((t, i) => {
      if (t.titleZh) allItems[i] = { ...allItems[i], titleZh: t.titleZh, summaryZh: t.summaryZh };
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  const finalA = allItems.slice(0, feedA.length);
  const finalB = allItems.slice(feedA.length);
  const withZh = allItems.filter((i) => i.titleZh).length;

  await Promise.all([
    kv.set("feed-a", finalA),
    kv.set("feed-b", finalB),
  ]);

  return NextResponse.json({ ok: true, withZh });
}
