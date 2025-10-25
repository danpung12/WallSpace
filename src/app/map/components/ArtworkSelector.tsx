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
      className={`absolute top-[168px] left-0 right-0 z-10 px-4 transition-all duration-300 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="mx-auto w-fit rounded-lg border border-theme-brown-light bg-white/70 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar">
          <button
            onClick={onAddArtwork}
            className="flex-shrink-0 text-center cursor-pointer"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-theme-brown-dark bg-theme-brown-medium">
              <span className="material-symbols-outlined text-theme-brown-darkest">
                add
              </span>
            </div>
            <p className="text-xs mt-1 text-theme-brown-darkest">작품 추가</p>
          </button>
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`flex-shrink-0 cursor-pointer rounded-xl border-2 px-2 pb-1 pt-2 text-center transition-all duration-300 ${
                selectedArtwork?.id === artwork.id
                  ? 'border-theme-brown-darkest bg-white/50 shadow-md'
                  : 'border-transparent'
              }`}
              onClick={() => onSelectArtwork(artwork)}
            >
              <Image
                alt={artwork.alt_text || artwork.title}
                className="h-20 w-20 rounded-lg object-cover"
                src={artwork.image_url}
                width={80}
                height={80}
              />
              <p className="mt-1 text-xs text-theme-brown-darkest">
                &ldquo;{artwork.title}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
