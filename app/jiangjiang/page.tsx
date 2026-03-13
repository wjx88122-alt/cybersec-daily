import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import {
  gallerySections,
  heroStats,
  memoryTimeline,
  noteLines,
  type JiangjiangMediaItem,
} from "./data";

export const metadata: Metadata = {
  title: "亲爱的酱酱 | 家兴的网络安全日报",
  description: "一页给酱酱留的小册子：收起最近的照片、视频和几段还会继续补充的记忆。",
};

const paperCardStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,252,247,0.96) 0%, rgba(255,247,238,0.92) 100%)",
  borderColor: "rgba(132, 94, 63, 0.12)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.78), 0 24px 60px rgba(129, 92, 58, 0.12)",
};

const softCardStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,249,242,0.8) 100%)",
  borderColor: "rgba(132, 94, 63, 0.1)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.76), 0 18px 40px rgba(129, 92, 58, 0.09)",
};

const sectionHeadingStyle: CSSProperties = {
  fontFamily: '"Iowan Old Style", "Songti SC", "Noto Serif SC", serif',
};

function MediaCard({ item }: { item: JiangjiangMediaItem }) {
  return (
    <article
      className="glass overflow-hidden rounded-[28px] border p-3 transition-transform duration-300 hover:-translate-y-1"
      style={softCardStyle}
    >
      <div className="overflow-hidden rounded-[22px] bg-[#f5ede4]">
        {item.type === "image" ? (
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width ?? 853}
            height={item.height ?? 1280}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <video
            controls
            playsInline
            preload="metadata"
            poster={item.posterSrc}
            aria-label={item.alt}
            className="aspect-[9/16] w-full bg-[#f5ede4] object-cover"
          >
            <source src={item.src} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="px-1 pb-1 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[#4f3524]">{item.title}</h3>
          <span className="rounded-full border border-[#d8b493]/35 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#9c6b46]">
            {item.meta}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#7b5f4c]">{item.description}</p>
      </div>
    </article>
  );
}

export default function JiangjiangPage() {
  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255,214,170,0.34), transparent 32%), radial-gradient(circle at top right, rgba(211,232,204,0.26), transparent 28%), linear-gradient(180deg, #fff7ef 0%, #f8f0e6 52%, #f3ede8 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-6rem] top-24 h-64 w-64 rounded-full blur-3xl"
          style={{ background: "rgba(255, 197, 143, 0.28)" }}
        />
        <div
          className="absolute right-[-5rem] top-48 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(191, 220, 182, 0.24)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(232, 193, 161, 0.2)" }}
        />
      </div>

      <div className="relative min-h-screen">
        <NavBar active="酱酱" tone="warm" />

        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <div
              className="glass relative overflow-hidden rounded-[32px] border p-6 sm:p-8"
              style={paperCardStyle}
            >
              <div
                className="absolute right-5 top-5 h-20 w-20 rounded-full blur-2xl"
                style={{ background: "rgba(255, 207, 157, 0.32)" }}
              />
              <div className="relative">
                <span className="inline-flex rounded-full border border-[#ddb18a]/40 bg-white/75 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#b7784f]">
                  亲爱的酱酱
                </span>
                <h1
                  className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-[#4a3121] sm:text-5xl"
                  style={sectionHeadingStyle}
                >
                  把最近的小片段，先给你留成一页温暖的小册子。
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#765945] sm:text-base">
                  先把微信里收到的照片和视频轻轻放在这里，不急着把所有故事都讲完。散步的小背影、窗边抱着玩具的时候、夜里站着等球的样子，都很适合被认真收好。
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {heroStats.map((stat) => (
                    <span
                      key={stat.label}
                      className="rounded-full border border-[#d7b191]/35 bg-white/72 px-3 py-1.5 text-sm text-[#5f4230]"
                    >
                      {stat.label} · {stat.value}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#gallery"
                    className="rounded-full bg-[#b9784d] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_28px_rgba(185,120,77,0.24)] transition-transform hover:-translate-y-0.5"
                  >
                    看看相册
                  </a>
                  <a
                    href="#notes"
                    className="rounded-full border border-[#d7b191]/45 bg-white/70 px-4 py-2 text-sm font-medium text-[#6a4b36] transition-transform hover:-translate-y-0.5"
                  >
                    想对酱酱说的话
                  </a>
                </div>

                <div
                  className="mt-8 rounded-[24px] border px-4 py-4"
                  style={{
                    borderColor: "rgba(215, 177, 145, 0.35)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,244,232,0.78) 100%)",
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b7784f]">
                    留在时间线里的那句话
                  </p>
                  <p
                    className="mt-3 text-2xl font-semibold text-[#513726]"
                    style={sectionHeadingStyle}
                  >
                    “这是刚回来那天吧”
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#7b5f4c]">
                    这页先按分享日期整理，细节慢慢补。先留住感觉，再慢慢把记忆写完整。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-[1.08fr_0.92fr] lg:grid-cols-1 xl:grid-cols-[1.08fr_0.92fr]">
              <div
                className="glass self-start overflow-hidden rounded-[32px] border p-3"
                style={paperCardStyle}
              >
                <div className="overflow-hidden rounded-[26px]">
                  <Image
                    src="/jiangjiang/park-walk-01.jpg"
                    alt="穿着小衣服的酱酱在公园里散步"
                    width={853}
                    height={1280}
                    priority
                    className="h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </div>
                <div className="px-2 pb-2 pt-4">
                  <p className="text-sm font-semibold text-[#4f3524]">小背影先开场</p>
                  <p className="mt-2 text-sm leading-6 text-[#7b5f4c]">
                    看着酱酱往前走，整页的节奏也会慢下来一点。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className="glass overflow-hidden rounded-[28px] border p-3 rotate-[-2deg]"
                  style={softCardStyle}
                >
                  <div className="overflow-hidden rounded-[22px]">
                    <Image
                      src="/jiangjiang/park-walk-02.jpg"
                      alt="酱酱站在树下回头张望"
                      width={853}
                      height={1280}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 22vw"
                    />
                  </div>
                </div>
                <div
                  className="glass rounded-[28px] border p-5"
                  style={softCardStyle}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b7784f]">
                    小小备注
                  </p>
                  <p
                    className="mt-3 text-xl font-semibold leading-8 text-[#4f3524]"
                    style={sectionHeadingStyle}
                  >
                    这页不是为了写得很满，而是为了让每次想起酱酱时，都有地方可回来看一眼。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="gallery" className="scroll-mt-24 pt-8 sm:pt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] text-[#b7784f]">媒体相册</p>
                <h2
                  className="mt-2 text-3xl font-semibold text-[#4a3121]"
                  style={sectionHeadingStyle}
                >
                  把收到的影像，按心情轻轻分成几页。
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-[#7b5f4c]">
                先不按很硬的时间轴去摆，只把“出门的时候”“靠近的时候”和“安静下来的时候”各自留一块位置。
              </p>
            </div>

            <div className="space-y-6">
              {gallerySections.map((section) => (
                <section
                  key={section.id}
                  className="glass rounded-[32px] border p-5 sm:p-6"
                  style={paperCardStyle}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b7784f]">
                        {section.eyebrow}
                      </p>
                      <h3
                        className="mt-2 text-2xl font-semibold text-[#4f3524]"
                        style={sectionHeadingStyle}
                      >
                        {section.title}
                      </h3>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-[#7b5f4c]">
                      {section.description}
                    </p>
                  </div>

                  <div className="mt-5 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {section.items.map((item) => (
                      <MediaCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="grid gap-6 pt-8 sm:grid-cols-[1.05fr_0.95fr] sm:pt-10">
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-[#b7784f]">小小时间线</p>
              <h2
                className="mt-2 text-3xl font-semibold text-[#4a3121]"
                style={sectionHeadingStyle}
              >
                先把最近几次分享记下来，以后再慢慢往里填。
              </h2>

              <div className="mt-6 space-y-4">
                {memoryTimeline.map((item) => (
                  <article
                    key={item.date}
                    className="glass rounded-[28px] border p-5"
                    style={paperCardStyle}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <span className="h-3 w-3 rounded-full bg-[#c8844a]" />
                        <span className="mt-2 h-full min-h-12 w-px bg-[#dfc1a6]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold tracking-[0.12em] text-[#b7784f]">
                          {item.date}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[#4f3524]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[#7b5f4c]">
                          {item.description}
                        </p>
                        {item.note && (
                          <p className="mt-3 rounded-2xl bg-white/65 px-3 py-2 text-sm text-[#8b6b54]">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <section id="notes" className="scroll-mt-24">
              <p className="text-sm font-medium tracking-[0.16em] text-[#b7784f]">想对酱酱说的话</p>
              <div
                className="glass mt-4 rounded-[32px] border p-6 sm:p-7"
                style={{
                  ...paperCardStyle,
                  background:
                    "linear-gradient(180deg, rgba(255,251,246,0.96) 0%, rgba(255,247,240,0.92) 100%), repeating-linear-gradient(180deg, transparent 0, transparent 38px, rgba(215,177,145,0.22) 38px, rgba(215,177,145,0.22) 39px)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      className="text-3xl font-semibold text-[#4a3121]"
                      style={sectionHeadingStyle}
                    >
                      给你留一角柔软的地方。
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#7b5f4c]">
                      先写几句不着急的话。以后想起新的片段，再继续往后补。
                    </p>
                  </div>
                  <span className="rounded-full border border-[#ddb18a]/40 bg-white/70 px-3 py-1 text-xs font-medium text-[#b7784f]">
                    会继续更新
                  </span>
                </div>

                <div className="mt-8 space-y-5 pr-2">
                  {noteLines.map((line) => (
                    <p key={line} className="text-base leading-9 text-[#5f4230]">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
