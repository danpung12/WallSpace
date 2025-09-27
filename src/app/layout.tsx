import type { Metadata } from "next";
import "./globals.css";
import TransitionProvider from "./transition-provider";
import NavigationGate from "./components/NavigationGate";
import { BottomNavProvider } from "./context/BottomNavContext";
import { MapProvider } from "@/context/MapContext"; // ✨ 1. MapProvider를 임포트합니다.
import { UserModeProvider } from "./context/UserModeContext"; // 1. UserModeProvider 임포트
import Script from "next/script"; // ✨ 2. Next.js의 Script 컴포넌트를 임포트합니다.

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
        `}</style>
        
        {/* ✅ 깜빡임 방지용 스타일 */}
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
        {/* ✨ 3. MapProvider로 전체를 감싸서 지도 상태를 전역으로 관리합니다. */}
        <MapProvider>
          <UserModeProvider> {/* 2. UserModeProvider 추가 */}
            {/* BottomNavProvider는 MapProvider 안에 위치합니다. */}
            <BottomNavProvider>
              {children}
              <NavigationGate />
            </BottomNavProvider>
          </UserModeProvider>
        </MapProvider>

        {/* ✨ 4. 카카오맵 SDK 스크립트를 body 최하단에 추가하여 앱 전체에서 한 번만 로드되게 합니다. */}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
          strategy="beforeInteractive" // 페이지가 상호작용 가능해지기 전에 스크립트를 실행합니다.
        />
      </body>
    </html>
  );
}
