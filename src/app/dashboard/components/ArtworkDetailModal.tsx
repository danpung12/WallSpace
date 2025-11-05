'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

import type { Artwork } from '@/types/database';

interface ArtworkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: Artwork | null;
  onDelete?: (id: number | string) => void;
}

const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({ isOpen, onClose, artwork, onDelete }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setShowQRCode(false);
      setShowDetails(false);
      setImageLoaded(false);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        setShowQRCode(false);
        setShowDetails(false);
      }, 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    const artworkUrl = `${window.location.origin}/artwork/${artwork?.id}`;
    navigator.clipboard.writeText(artworkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const container = document.getElementById('qr-code-container');
    const svg = container?.querySelector('svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${artwork?.title || 'artwork'}_qrcode.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

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
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-7xl max-h-[95vh] mx-4 transform transition-all duration-500 ease-out ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-[#D2B48C]/20">
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-xl border-b-2 border-[#D2B48C]/20">
            <div className="px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="group p-2.5 bg-red-50 hover:bg-red-100 rounded-full transition-all duration-300 border-2 border-red-200 hover:border-red-300"
                    aria-label="삭제"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={handleCopyLink}
                  className="group px-5 py-2.5 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] hover:from-[#C19A6B] hover:to-[#B8996B] rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center gap-2 text-sm font-medium tracking-wide text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {copied ? '복사됨!' : '공유'}
                  </span>
                </button>
                
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="p-2.5 bg-[#F5F1EC] hover:bg-[#D2B48C]/20 rounded-full transition-all duration-300 border-2 border-[#D2B48C]/30 hover:border-[#D2B48C]"
                >
                  <svg className="w-5 h-5 text-[#8B6F47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 bg-[#F5F1EC] hover:bg-[#D2B48C]/20 rounded-full transition-all duration-300 border-2 border-[#D2B48C]/30"
                aria-label="닫기"
              >
                <svg className="w-6 h-6 text-[#3D2C1D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-24 p-8 lg:p-12 max-h-[95vh] overflow-y-auto custom-scrollbar bg-[#F5F1EC]">
            
            {/* Left: Image - 7 columns */}
            <div className="lg:col-span-7">
              <div className={`relative aspect-square bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-white transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <img
                  src={artwork.image_url || 'https://via.placeholder.com/800x600'}
                  alt={artwork.title}
                  className="w-full h-full object-contain p-12"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>

            {/* Right: Info - 5 columns */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-[#3D2C1D] leading-[1.05] tracking-tight">
                  {artwork.title}
                </h1>
                {artwork.category && (
                  <span className="inline-block px-5 py-2 text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-[#D2B48C]/20 to-[#C19A6B]/20 text-[#8B6F47] rounded-full border-2 border-[#D2B48C]/30">
                    {artwork.category}
                  </span>
                )}
              </div>

              {/* Description */}
              {artwork.description && (
                <div>
                  <h3 className="text-sm text-[#8B6F47] font-bold tracking-wider uppercase mb-4">작품 설명</h3>
                  <p className="text-[#3D2C1D] text-xl leading-relaxed whitespace-pre-wrap font-light">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* Details Toggle Button */}
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#F5F1EC] rounded-2xl border-2 border-[#D2B48C]/30 hover:border-[#D2B48C] transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <span className="text-lg font-bold text-[#3D2C1D] tracking-wide">작품 정보 보기</span>
                  <svg 
                    className={`w-6 h-6 text-[#8B6F47] transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expandable Details */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    showDetails ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 bg-white rounded-2xl border-2 border-[#D2B48C]/20 shadow-sm">
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      {artwork.dimensions && (
                        <div>
                          <p className="text-xs text-[#8B6F47] font-semibold tracking-[0.2em] uppercase mb-2">치수</p>
                          <p className="text-lg font-bold text-[#3D2C1D]">{artwork.dimensions}</p>
                        </div>
                      )}
                      
                      {artwork.created_at && (
                        <div>
                          <p className="text-xs text-[#8B6F47] font-semibold tracking-[0.2em] uppercase mb-2">등록일</p>
                          <p className="text-lg font-bold text-[#3D2C1D]">
                            {new Date(artwork.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}

                      {/* Price */}
                      {artwork.price !== null && artwork.price !== undefined && (
                        <div>
                          <p className="text-xs text-[#8B6F47] font-semibold tracking-[0.2em] uppercase mb-2">작품 가격</p>
                          <p className="text-lg font-bold text-[#3D2C1D]">
                            ₩{artwork.price.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {showQRCode && (
                <div className="p-6 bg-white rounded-3xl border-2 border-[#D2B48C]/30 shadow-lg animate-fadeIn">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-5 bg-gradient-to-br from-[#F5F1EC] to-white rounded-2xl shadow-inner" id="qr-code-container">
                      <QRCode
                        value={`${window.location.origin}/artwork/${artwork.id}`}
                        size={180}
                        level="H"
                      />
                    </div>
                    <p className="text-sm text-[#8B6F47] text-center">
                      QR 코드를 스캔하여 작품 페이지로 이동
                    </p>
                    <button
                      onClick={handleDownloadQR}
                      className="text-sm text-[#D2B48C] hover:text-[#8B6F47] font-semibold tracking-wide underline underline-offset-4 transition-colors"
                    >
                      이미지로 저장
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110]"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md mx-4 border-4 border-red-200 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 border-4 border-red-200">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#3D2C1D] mb-3 text-center">작품 삭제</h3>
            <p className="text-[#8B6F47] mb-8 text-center leading-relaxed">
              <span className="font-bold text-[#3D2C1D]">"{artwork.title}"</span>을(를) 삭제하시겠습니까?<br />
              <span className="text-sm">삭제된 작품은 복구할 수 없습니다.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-[#F5F1EC] hover:bg-[#D2B48C]/20 text-[#3D2C1D] font-semibold transition-all duration-300 border-2 border-[#D2B48C]/30"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(210, 180, 140, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(210, 180, 140, 0.7);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ArtworkDetailModal;
