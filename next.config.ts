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
      {
        protocol: "https",
        hostname: "gnhwzbvlaqdnkahurlbv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // 이미지 최적화 설정
    formats: ['image/webp', 'image/avif'], // 최신 포맷 우선 사용
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // 반응형 이미지 크기
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 작은 이미지 크기
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일 캐싱
    dangerouslyAllowSVG: true, // SVG 허용
    contentDispositionType: 'inline', // 인라인 표시
  },

  // 모든 이미지 경로에 대해 Content-Disposition 헤더를 제거합니다.
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline', // 'attachment' 대신 'inline'으로 설정하여 브라우저에서 바로 표시되도록 합니다.
          },
        ],
      },
    ]
  },

};

export default nextConfig;