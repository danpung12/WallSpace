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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm font-[Pretendard] text-[#3A2E27] dark:text-gray-100 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        <p className="mb-8 text-base text-[#705D51] dark:text-gray-400 text-center">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg font-bold bg-[#EAE3D9] dark:bg-gray-700 text-[#3A2E27] dark:text-gray-100 hover:brightness-95 transition-all duration-300"
          >
            아니오
          </button>
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 rounded-lg font-bold text-white bg-[#D2B48C] dark:bg-[#B8996B] hover:brightness-95 transition-all duration-300"
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
