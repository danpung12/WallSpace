// app/layout.tsx (최종 수정)

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
        
        {/* ✅ 깜빡임 방지용 스타일을 여기에 직접 추가 */}
        <style>{`
          body.js-loading [data-is-present] {
            opacity: 0;
          }
        `}</style>

      </head>

      <body
        className="js-loading bg-[var(--brand-cream)]"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        {children}
        <BottomNavGate />
      </body>
    </html>
  );
}