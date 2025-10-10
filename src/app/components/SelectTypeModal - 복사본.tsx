'use client';

import React, { useState, useEffect } from 'react';

interface SelectTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist: () => void;
  onSelectGuest: () => void;
}

const SelectTypeModal: React.FC<SelectTypeModalProps> = ({ isOpen, onClose, onSelectArtist, onSelectGuest }) => {
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg md:max-w-3xl p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl border border-gray-200 bg-white text-gray-800 transform transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">가입 유형 선택</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">어떤 목적으로 WallSpace를 이용하시나요?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Artist/Owner Card */}
          <div
            onClick={onSelectArtist}
            className="group cursor-pointer flex flex-col items-center justify-center p-6 sm:p-8 bg-gray-100 hover:bg-gray-200 rounded-2xl border border-gray-200 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <div className="text-center text-gray-800">
              <div className="mb-4 inline-block bg-gray-200 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300 ease-in-out">
                <span className="material-symbols-outlined leading-none !text-5xl sm:!text-6xl text-gray-700">palette</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">예술가 / 사장님</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">공간을 등록하고 작품을 알려보세요.</p>
            </div>
          </div>

          {/* Guest Card */}
          <div
            onClick={onSelectGuest}
            className="group cursor-pointer flex flex-col items-center justify-center p-6 sm:p-8 bg-gray-100 hover:bg-gray-200 rounded-2xl border border-gray-200 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <div className="text-center text-gray-800">
              <div className="mb-4 inline-block bg-gray-200 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300 ease-in-out">
                <span className="material-symbols-outlined leading-none !text-5xl sm:!text-6xl text-gray-700">person</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">손님</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">예술 작품을 둘러보고 카페를 즐겨보세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTypeModal;
