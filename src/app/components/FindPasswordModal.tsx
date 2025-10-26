'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FindPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindPasswordModal: React.FC<FindPasswordModalProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // 모달 열릴 때 초기화
      setEmail('');
      setError(null);
      setSuccess(false);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Supabase 비밀번호 재설정 이메일 발송
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
      console.log("✅ Password reset email sent to:", email);
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError('비밀번호 재설정 메일 발송에 실패했습니다. 이메일을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 bg-white text-gray-800 transform transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">비밀번호 찾기</h2>
          <p className="mt-3 text-sm text-gray-600">
            가입 시 사용한 아이디(이메일)를 입력하시면<br/>비밀번호 재설정 메일을 보내드립니다.
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
            <p className="font-bold">✅ 비밀번호 재설정 메일이 발송되었습니다!</p>
            <p className="mt-1">이메일을 확인하시고 링크를 클릭해주세요.</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handlePasswordReset}>
          <div>
            <label className="sr-only" htmlFor="reset-email">Email / ID</label>
            <div className="relative flex items-center bg-gray-100 rounded-xl border-2 border-transparent focus-within:border-[#A89587] focus-within:bg-white transition-all">
              <span className="material-symbols-outlined absolute left-4 text-gray-500 pointer-events-none">mail</span>
              <input 
                id="reset-email" 
                placeholder="아이디(이메일)" 
                type="email" 
                autoComplete="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || success}
                className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              className="w-full rounded-xl h-12 text-base bg-[#3E352F] text-white font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isLoading || success}
            >
              <span>{isLoading ? '발송 중...' : success ? '발송 완료' : '인증메일 발송'}</span>
            </button>
            <button 
              className="w-full rounded-xl h-12 text-base bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-colors" 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
            >
              로그인으로 돌아가기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindPasswordModal;
