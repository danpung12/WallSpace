'use client';

import Image from 'next/image';
import { Artwork } from '@/types/database';
import Link from 'next/link';

export default function ArtworkSelector({
  artworks,
  selectedArtwork,
  onSelectArtwork,
  isVisible,
  onAddArtwork,
}: {
  artworks: Artwork[];
  selectedArtwork: Artwork | null;
  onSelectArtwork: (artwork: Artwork) => void;
  isVisible: boolean;
  onAddArtwork: () => void;
}) {
  return (
    <div
      className={`absolute top-[120px] lg:top-[220px] left-0 right-0 z-10 px-4 transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-8 pointer-events-none'
      }`}
    >
      <div className="mx-auto w-fit rounded-2xl bg-white/90 px-4 py-3 lg:px-5 lg:py-4 shadow-xl backdrop-blur-md border border-gray-200/50">
        <div className="flex items-center space-x-3 lg:space-x-4 overflow-x-auto no-scrollbar">
          <button
            onClick={onAddArtwork}
            className="group flex-shrink-0 text-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="relative flex h-20 w-20 lg:h-24 lg:w-24 items-center justify-center rounded-xl lg:rounded-2xl bg-[#D2B48C]/10 transition-all duration-300 group-hover:bg-[#D2B48C]/20 group-hover:shadow-md">
              <span className="material-symbols-outlined text-2xl lg:text-3xl text-[#D2B48C] transition-transform duration-300 group-hover:scale-110">
                add_circle
              </span>
            </div>
            <p className="text-[10px] lg:text-xs mt-1.5 lg:mt-2 font-semibold text-gray-700 group-hover:text-[#D2B48C] transition-colors">작품 추가</p>
          </button>
          {artworks.length === 0 && (
            <div className="flex-shrink-0 text-center px-4 lg:px-6 py-2">
              <p className="text-xs lg:text-sm font-medium text-gray-600">
                등록된 작품이 없습니다
              </p>
              <p className="text-[10px] lg:text-xs text-gray-400 mt-1">작품을 추가해주세요 ✨</p>
            </div>
          )}
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`group flex-shrink-0 cursor-pointer rounded-xl lg:rounded-2xl p-2 lg:p-2.5 text-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                selectedArtwork?.id === artwork.id
                  ? 'bg-[#D2B48C]/15 shadow-md'
                  : 'hover:bg-gray-50 hover:shadow-sm'
              }`}
              onClick={() => onSelectArtwork(artwork)}
            >
              <div className={`relative overflow-hidden rounded-lg lg:rounded-xl ${
                selectedArtwork?.id === artwork.id
                  ? 'ring-2 ring-inset ring-[#D2B48C]/60'
                  : ''
              }`}>
                <Image
                  alt={artwork.alt_text || artwork.title}
                  className="h-20 w-20 lg:h-24 lg:w-24 rounded-lg lg:rounded-xl object-cover transition-transform duration-300 group-hover:scale-110"
                  src={artwork.image_url}
                  width={96}
                  height={96}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {selectedArtwork?.id === artwork.id && (
                  <div className="absolute top-1 right-1 bg-[#D2B48C] rounded-full p-0.5 lg:p-1">
                    <svg className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className={`mt-1.5 lg:mt-2 text-[10px] lg:text-xs font-semibold line-clamp-1 transition-colors ${
                selectedArtwork?.id === artwork.id 
                  ? 'text-[#D2B48C]' 
                  : 'text-gray-700 group-hover:text-[#D2B48C]'
              }`}>
                &ldquo;{artwork.title}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
