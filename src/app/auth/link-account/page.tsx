"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LinkAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  const email = searchParams.get("email");
  const next = searchParams.get("next") || "/";
  
  const [isLoading, setIsLoading] = useState(false);

  // provider 이름을 한글로 변환
  const getProviderName = (provider: string | null) => {
    switch (provider) {
      case "google":
        return "구글";
      case "naver":
        return "네이버";
      case "kakao":
        return "카카오";
      default:
        return provider;
    }
  };

  // 연동하기 버튼 클릭
  const handleLink = async () => {
    setIsLoading(true);
    try {
      // 이미 로그인된 상태이므로, 단순히 다음 페이지로 이동
      // Supabase는 자동으로 같은 이메일의 계정을 연동합니다.
      router.push(next);
    } catch (error) {
      console.error("계정 연동 중 오류:", error);
      alert("계정 연동 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 취소 버튼 클릭 (로그아웃 후 로그인 페이지로)
  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1EC] dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-6">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-[#D2B48C]/20 to-[#D2B48C]/10 rounded-full">
            <svg className="w-16 h-16 text-[#D2B48C]" fill="currentColor" viewBox="0 0 256 256">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
            </svg>
          </div>
        </div>

        {/* 제목 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100">
            계정 연동 확인
          </h1>
          <p className="text-sm text-[#887563] dark:text-gray-400">
            이미 가입된 계정이 있습니다
          </p>
        </div>

        {/* 메시지 */}
        <div className="bg-[#F5F3EC] dark:bg-gray-700 rounded-xl p-4 space-y-2">
          <p className="text-sm text-[#2C2C2C] dark:text-gray-100">
            <span className="font-bold">{email}</span> 이메일로 이미 가입된 계정이 있습니다.
          </p>
          <p className="text-sm text-[#2C2C2C] dark:text-gray-100">
            <span className="font-bold text-[#D2B48C]">{getProviderName(provider)}</span> 계정을 기존 계정과 연동하시겠습니까?
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleLink}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#D2B48C] to-[#B8996B] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "처리 중..." : "연동하기"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-[#2C2C2C] dark:text-gray-100 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-center text-[#887563] dark:text-gray-400">
          연동하면 하나의 계정으로 여러 소셜 로그인을 사용할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1EC] dark:bg-gray-900">
        <div className="text-[#887563] dark:text-gray-400">로딩 중...</div>
      </div>
    }>
      <LinkAccountContent />
    </Suspense>
  );
}

