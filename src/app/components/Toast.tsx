'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export default function Toast({ 
  message, 
  isVisible, 
  onClose, 
  type = 'success',
  duration = 1500 
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose();
        }, 300); // 페이드아웃 애니메이션 시간과 일치
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isExiting) return null;

  const bgColor = type === 'success' ? 'bg-gray-800' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] ${isExiting ? 'animate-fade-out' : 'animate-slide-up'}`}>
      <div className={`${bgColor} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 min-w-[200px] justify-center backdrop-blur-sm bg-opacity-95`}>
        <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>
          {icon}
        </span>
        <span className="font-medium text-sm">{message}</span>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

