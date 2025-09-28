'use client';

import React, { useState, useEffect } from 'react';

interface FindPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindPasswordModal: React.FC<FindPasswordModalProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  const handlePasswordReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 비밀번호 재설정 로직
    console.log("Password reset email sent.");
    onClose(); // 성공 시 모달 닫기 (또는 성공 메시지 표시)
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
                className="w-full h-14 pl-14 pr-4 text-base bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button className="w-full rounded-xl h-12 text-base bg-[#3E352F] text-white font-bold hover:bg-opacity-90 transition-colors" type="submit">
              <span>인증메일 발송</span>
            </button>
            <button className="w-full rounded-xl h-12 text-base bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-colors" type="button" onClick={onClose}>
              로그인으로 돌아가기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindPasswordModal;
