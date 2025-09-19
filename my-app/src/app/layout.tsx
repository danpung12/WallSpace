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
        {/* ✅ Material Symbols 아이콘 폰트만 남겨둡니다. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        
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

      {/* ✅ js-loading 클래스와 배경색 클래스만 남깁니다. (인라인 style 제거) */}
      <body className="js-loading bg-[var(--brand-cream)]">
        <TransitionProvider>{children}</TransitionProvider>
        <BottomNavGate />
      </body>
    </html>
  );
}