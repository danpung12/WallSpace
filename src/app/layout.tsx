import type { Metadata, Viewport } from "next";
import "./globals.css";
import TransitionProvider from "./transition-provider";
import NavigationGate from "./components/NavigationGate";
import { Providers } from "./providers"; // Provider들을 하나의 클라이언트 컴포넌트로 통합
import Script from "next/script"; // ✨ 2. Next.js의 Script 컴포넌트를 임포트합니다.
import { DarkModeProvider } from "./context/DarkModeContext";

export const metadata: Metadata = {
  title: "WallSpace",
  description: "WallSpace",
  openGraph: {
    title: "WallSpace",
    description: "작가와 공간을 잇는 플랫폼",
    siteName: "WallSpace",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* DNS Prefetch & Preconnect for Performance */}
        <link rel="dns-prefetch" href="https://gnhwzbvlaqdnkahurlbv.supabase.co" />
        <link rel="preconnect" href="https://gnhwzbvlaqdnkahurlbv.supabase.co" crossOrigin="" />
        
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
        className="js-loading"
        style={{ fontFamily: "Pretendard, sans-serif" }}
      >
        <DarkModeProvider>
          <Providers>
            <TransitionProvider>{children}</TransitionProvider>
            <NavigationGate />
          </Providers>
        </DarkModeProvider>

        {/* ✨ 4. 카카오맵 SDK 스크립트를 body 최하단에 추가하여 앱 전체에서 한 번만 로드되게 합니다. */}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
          strategy="beforeInteractive" // 페이지가 상호작용 가능해지기 전에 스크립트를 실행합니다.
        />
      </body>
    </html>
  );
}
