import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "初中信息技术练习系统",
  description: "模块化练习、随机考试、无尽模式",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
