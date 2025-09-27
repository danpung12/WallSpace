import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript 빌드 오류 무시
  typescript: {
    ignoreBuildErrors: true, 
  },
  
  // 💡 ESLint 오류도 빌드 시 무시하도록 추가
  eslint: {
    // !! 경고 !!
    // ESLint 오류가 있더라도 프로덕션 빌드를 강제로 성공하게 만드는 
    // 매우 위험한 설정입니다.
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },

  // 개발 중에 나타나는 Next.js 로고(N) 비활성화
  devIndicators: {
    buildActivity: false
  },
};

export default nextConfig;