'use client';

import React, { useEffect, useState } from 'react';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  if (!isOpen) return null;
  if (!isBrowser) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* 아이콘 (문의하기 제출완료와 동일한 스타일) */}
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">
          {title}
        </h2>
        
        {/* 메시지 */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold transition-all transform hover:scale-105"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-xl bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold transition-all transform hover:scale-105"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
