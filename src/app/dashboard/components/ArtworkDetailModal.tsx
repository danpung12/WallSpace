'use client';

import React, { useState, useEffect } from 'react';

import type { Artwork } from '@/types/database';

interface ArtworkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: Artwork | null;
  onDelete?: (id: number | string) => void;
}

const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({ isOpen, onClose, artwork, onDelete }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setShowDetails(false);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        setShowDetails(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (artwork && onDelete) {
      await onDelete(artwork.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!shouldRender || !artwork) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl bg-white text-gray-800 flex flex-col transform transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close and Delete Buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {onDelete && (
            <button 
              onClick={handleDeleteClick} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/90 hover:bg-red-600 shadow-lg text-white transition-all"
              aria-label="삭제"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          )}
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg text-gray-700 hover:text-gray-900 transition-all"
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {/* Artwork Image */}
          <div className="relative w-full aspect-[4/3] bg-gray-100 py-2 px-4 lg:py-4 lg:px-8">
            <img 
              src={artwork.image_url || 'https://via.placeholder.com/800x600'} 
              alt={artwork.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Artwork Information */}
          <div className="p-4 lg:p-8 space-y-6">
            {/* Title and Artist */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 font-serif">
                {artwork.title}
              </h2>
            </div>

            {/* Description */}
            {artwork.description && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </div>
            )}

            {/* Details Toggle Button */}
            <div className="pt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-[#8C7853] hover:text-[#3D2C1D] font-semibold transition-colors group"
              >
                <span>상세 정보 보기</span>
                <span className={`material-symbols-outlined transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
            </div>

            {/* Expandable Details */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pt-4 space-y-4 border-t border-gray-200">
                {/* Dimensions */}
                {artwork.dimensions && (
                  <div className="flex items-start gap-4">
                    <div className="w-24 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      크기
                    </div>
                    <div className="flex-1 text-gray-900 font-medium">
                      {artwork.dimensions}
                    </div>
                  </div>
                )}

                {/* Price */}
                {artwork.price !== undefined && artwork.price !== null && (
                  <div className="flex items-start gap-4">
                    <div className="w-24 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      금액
                    </div>
                    <div className="flex-1 text-gray-900 font-medium">
                      {artwork.price.toLocaleString('ko-KR')}원
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">작품 삭제</h3>
            <p className="text-gray-600 mb-6">
              &ldquo;{artwork.title}&rdquo;을(를) 삭제하시겠습니까?<br />
              삭제된 작품은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #aaa;
        }
      `}</style>
    </div>
  );
};

export default ArtworkDetailModal;

