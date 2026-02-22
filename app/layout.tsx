import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家兴的网络安全日报",
  description: "每日最新网络安全资讯聚合，涵盖漏洞预警、安全事件、深度分析",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
