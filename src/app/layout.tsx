import type { Metadata } from "next";
import "./globals.css";
import TransitionProvider from "./transition-provider";
import BottomNavGate from "./components/BottomNavGate"; // ⬅️ 여기로 변경

export const metadata: Metadata = {
  title: "Stitch Design",
  description: "WallSpace",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {/* 전역 페이지 전환 + 컨텐츠 영역 레이아웃 */}
        <TransitionProvider>{children}</TransitionProvider>

        {/* ✅ transform 영향 밖(형제)에 둠: 진짜 뷰포트 고정 */}
        <BottomNavGate />
      </body>
    </html>
  );
}
