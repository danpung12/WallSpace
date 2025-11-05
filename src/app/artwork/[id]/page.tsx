'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { getArtworkById } from '@/lib/api/artworks';
import { createClient } from '@/lib/supabase/client';
import type { Artwork, Profile } from '@/types/database';

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [artist, setArtist] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 하단바 숨기기
  useEffect(() => {
    document.body.style.paddingBottom = '0';
    const bottomNav = document.querySelector('footer');
    if (bottomNav) {
      (bottomNav as HTMLElement).style.display = 'none';
    }
    return () => {
      document.body.style.paddingBottom = '';
      if (bottomNav) {
        (bottomNav as HTMLElement).style.display = '';
      }
    };
  }, []);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = params.id as string;
        if (!id) {
          setError('작품을 찾을 수 없습니다.');
          return;
        }

        const artworkData = await getArtworkById(id);
        
        if (!artworkData) {
          setError('작품을 찾을 수 없습니다.');
          return;
        }

        setArtwork(artworkData);

        if (artworkData.artist_id) {
          const supabase = createClient();
          const { data: artistData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', artworkData.artist_id)
            .single();

          if (artistData) {
            setArtist(artistData);
          }
        }
      } catch (err: any) {
        console.error('Error fetching artwork:', err);
        setError('작품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [params.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const container = document.getElementById('artwork-qr-container');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#D2B48C]/30"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-[#D2B48C] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-[#8B6F47] font-medium tracking-wide">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#3D2C1D] mb-3">
            {error || '작품을 찾을 수 없습니다'}
          </h2>
          <p className="text-[#8B6F47] mb-8">
            요청하신 작품이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="px-8 py-3 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] hover:from-[#C19A6B] hover:to-[#B8996B] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* QR Modal */}
      {showQRCode && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowQRCode(false)}
        >
          <div 
            className="bg-white p-10 rounded-3xl max-w-sm mx-4 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#3D2C1D] mb-2">QR 코드</h3>
                <p className="text-sm text-[#8B6F47]">스캔하여 작품 페이지로 이동</p>
              </div>
              <div className="p-6 bg-[#FAF8F5] rounded-2xl" id="artwork-qr-container">
                <QRCode
                  value={window.location.href}
                  size={200}
                  level="H"
                  fgColor="#3D2C1D"
                />
              </div>
              <button
                onClick={handleDownloadQR}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] hover:from-[#C19A6B] hover:to-[#B8996B] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg"
              >
                이미지로 다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top: Image - 50vh */}
      <div className="h-[50vh] bg-gradient-to-b from-[#FAF8F5] to-[#F5F1EC] relative overflow-hidden">
        <div className={`w-full h-full transition-all duration-1000 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
          {artwork.image_url ? (
            <Image
              src={artwork.image_url}
              alt={artwork.alt_text || artwork.title}
              fill
              className="object-cover"
              priority
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F5]">
              <div className="text-center">
                <svg className="w-16 h-16 text-[#D2B48C] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-[#8B6F47] font-medium">이미지 없음</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Gradient Overlay for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white/50"></div>
      </div>

      {/* Bottom: Info - White Background */}
      <div className="flex-1 bg-white relative overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-10 space-y-5">
          
          {/* Category Tag - Small at Top */}
          {artwork.category && (
            <div className="animate-slideUp -mb-2">
              <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase bg-[#FAF8F5] text-[#8B6F47] rounded-full border border-[#D2B48C]/30">
                {artwork.category}
              </span>
            </div>
          )}

          {/* Title - Big & Bold */}
          <div className="animate-slideUp" style={{ animationDelay: '0.05s' }}>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#3D2C1D] leading-[1.15] tracking-tight">
              {artwork.title}
            </h1>
          </div>

          {/* Artist - Compact */}
          {artist && (
            <div className="flex items-center gap-3 -mt-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              {artist.avatar_url ? (
                <Image
                  src={artist.avatar_url}
                  alt={artist.nickname || artist.name || '작가'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D2B48C] to-[#B8996B] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(artist.nickname || artist.name || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8B6F47] font-medium">작가</span>
                <span className="text-base font-semibold text-[#3D2C1D]">
                  {artist.nickname || artist.name || '익명'}
                </span>
              </div>
            </div>
          )}

          {/* Description Card */}
          {artwork.description && (
            <div className="bg-[#FAF8F5] rounded-2xl p-5 animate-slideUp" style={{ animationDelay: '0.15s' }}>
              <h3 className="text-xs text-[#8B6F47] font-bold tracking-[0.15em] uppercase mb-3">작품 설명</h3>
              <p className="text-[#3D2C1D] text-base leading-[1.65] whitespace-pre-wrap">
                {artwork.description}
              </p>
            </div>
          )}

          {/* Details Toggle Card */}
          <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between p-5 bg-[#FAF8F5] hover:bg-[#F5F1EC] rounded-2xl transition-all duration-300">
                <span className="text-sm font-semibold text-[#3D2C1D]">작품 정보</span>
                <svg 
                  className={`w-5 h-5 text-[#8B6F47] transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expandable Details */}
            <div 
              className={`overflow-hidden transition-all duration-500 ease-out ${
                showDetails ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-5 bg-[#FAF8F5] rounded-2xl space-y-4">
                {artwork.dimensions && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8B6F47] font-medium uppercase tracking-wider">치수</span>
                    <span className="text-sm font-semibold text-[#3D2C1D]">{artwork.dimensions}</span>
                  </div>
                )}
                
                {artwork.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8B6F47] font-medium uppercase tracking-wider">등록일</span>
                    <span className="text-sm font-semibold text-[#3D2C1D]">
                      {new Date(artwork.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {artwork.price !== null && artwork.price !== undefined && (
                  <div className="pt-3 border-t border-[#D2B48C]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8B6F47] font-medium uppercase tracking-wider">작품 가격</span>
                      <span className="text-xl font-bold text-[#3D2C1D]">
                        ₩{artwork.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2 animate-slideUp" style={{ animationDelay: '0.25s' }}>
            <button
              onClick={handleCopyLink}
              className="px-5 py-3.5 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] hover:from-[#C19A6B] hover:to-[#B8996B] rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              <span className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {copied ? '복사됨!' : '링크 공유'}
              </span>
            </button>

            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="px-5 py-3.5 bg-white hover:bg-[#FAF8F5] border-2 border-[#D2B48C] hover:border-[#C19A6B] rounded-xl transition-all duration-300 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2 text-sm font-semibold text-[#3D2C1D]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR 코드
              </span>
            </button>
          </div>

          {/* Bottom Spacing */}
          <div className="h-6"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}
