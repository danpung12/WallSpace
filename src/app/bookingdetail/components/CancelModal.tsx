'use client';

import { useState, useEffect } from 'react';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelModal = ({ isOpen, onClose, onConfirm }: CancelModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // A short delay to allow the DOM to render with initial styles before animating
      timer = setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl p-6 w-full max-w-sm text-center transform transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-2 text-gray-800">예약 취소</h2>
        <p className="text-gray-600 mb-6">
          예약을 취소하시겠습니까?
          <br />
          취소된 예약은 복구할 수 없습니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={onConfirm}
            className="w-full h-12 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            취소 확정
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
