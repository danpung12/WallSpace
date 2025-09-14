// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import TransitionProvider from "./transition-provider";
import BottomNavGate from "./components/BottomNavGate";

export const metadata: Metadata = {
  title: "Stitch Design",
  description: "WallSpace",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

        {/* Global page-scoped CSS variables & base rules */}
        <style>{`
          :root {
            --brand-brown: #A89587;
            --brand-cream: #F5F3F0;
            --brand-dark-brown: #3E352F;
          }
          body {
            min-height: max(884px, 100dvh);
          }
        `}</style>
      </head>

      <body
        className="bg-[var(--brand-cream)]"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        {/* 전역 페이지 전환 + 컨텐츠 영역 레이아웃 */}
        <TransitionProvider>{children}</TransitionProvider>

        {/* ✅ transform 영향 밖(형제)에 둠: 진짜 뷰포트 고정 */}
        <BottomNavGate />
      </body>
    </html>
  );
}
