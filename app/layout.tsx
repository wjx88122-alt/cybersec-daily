import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家兴的网络安全日报",
  description: "每日最新网络安全资讯聚合，涵盖漏洞预警、安全事件、深度分析",
};

/**
 * 防 FOUC：在 React hydrate 前同步读取 localStorage.theme 并在 <html> 上设置 .dark。
 * 三态 theme = dark | system | light（默认 system）。
 * 必须内联 + 阻塞执行，否则首帧会闪烁。
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
