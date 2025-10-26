'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // URL hash 체크 제거 - Supabase가 자동으로 세션 처리함

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 비밀번호 검증
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // 비밀번호 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      console.log('✅ Password reset successful');

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1EC] p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">비밀번호 재설정</h1>
          <p className="mt-3 text-sm text-gray-600">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            <p className="font-bold">✅ 비밀번호가 재설정되었습니다!</p>
            <p className="mt-1">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* 새 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              새 비밀번호
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">lock</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || success}
                className="w-full h-14 pl-14 pr-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-[#D2B48C] focus:bg-white transition-all text-gray-900 focus:outline-none disabled:opacity-50"
                placeholder="새 비밀번호 (최소 6자)"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">lock</span>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || success}
                className="w-full h-14 pl-14 pr-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-[#D2B48C] focus:bg-white transition-all text-gray-900 focus:outline-none disabled:opacity-50"
                placeholder="비밀번호 다시 입력"
                required
              />
            </div>
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full h-14 bg-[#D2B48C] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '재설정 중...' : success ? '완료' : '비밀번호 재설정'}
          </button>
        </form>
      </div>
    </div>
  );
}

