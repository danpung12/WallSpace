'use client';

import Image from 'next/image';

// --- 타입 선언 ---
interface Artwork {
  id: number;
  title: string;
  artist: string;
  dimensions: string;
  price: number;
  imageUrl: string;
}

export default function ArtworkSelector({
  artworks,
  selectedArtwork,
  onSelectArtwork,
  onAddNew,
  isVisible,
}: {
  artworks: Artwork[];
  selectedArtwork: Artwork | null;
  onSelectArtwork: (artwork: Artwork) => void;
  onAddNew: () => void;
  isVisible: boolean;
}) {
  return (
    <div
      className={`absolute top-48 left-0 right-0 px-4 z-10 transition-all duration-300 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-theme-brown-light/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-theme-brown-medium">
        <h2 className="text-lg font-bold text-theme-brown-darkest mb-3">
          Choose your artwork
        </h2>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          <div
            className="flex-shrink-0 text-center cursor-pointer"
            onClick={onAddNew}
          >
            <div className="w-20 h-20 bg-theme-brown-medium rounded-lg flex items-center justify-center border-2 border-dashed border-theme-brown-dark">
              <span className="material-symbols-outlined text-theme-brown-darkest">
                add
              </span>
            </div>
            <p className="text-xs mt-1 text-theme-brown-darkest">Add new</p>
          </div>
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`flex-shrink-0 text-center cursor-pointer ${
                selectedArtwork?.id === artwork.id
                  ? 'ring-2 ring-theme-brown-darkest rounded-lg p-0.5'
                  : ''
              }`}
              onClick={() => onSelectArtwork(artwork)}
            >
              <Image
                alt={artwork.title}
                className="w-20 h-20 rounded-md object-cover"
                src={artwork.imageUrl}
                width={80}
                height={80}
              />
              <p className="text-xs mt-1 text-theme-brown-darkest">
                &ldquo;{artwork.title}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
