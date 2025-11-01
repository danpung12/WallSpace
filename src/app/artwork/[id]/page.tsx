'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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

        // 작품 정보 가져오기
        const artworkData = await getArtworkById(id);
        
        if (!artworkData) {
          setError('작품을 찾을 수 없습니다.');
          return;
        }

        setArtwork(artworkData);

        // 작가 정보 가져오기
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1EC] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D2B48C] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">작품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-[#F5F1EC] dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">
            {error || '작품을 찾을 수 없습니다'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            요청하신 작품이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-[#D2B48C] hover:bg-[#C19A6B] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1EC] dark:bg-gray-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-[#2C2C2C] dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#2C2C2C] dark:text-gray-100">작품 상세</h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 작품 이미지 */}
          <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {artwork.image_url ? (
              <Image
                src={artwork.image_url}
                alt={artwork.alt_text || artwork.title}
                fill
                className="object-contain p-4"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 dark:text-gray-500">이미지 없음</p>
                </div>
              </div>
            )}
          </div>

          {/* 작품 정보 */}
          <div className="space-y-6">
            {/* 작품명 */}
            <div>
              <h2 className="text-4xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">
                {artwork.title}
              </h2>
              {artwork.category && (
                <span className="inline-block bg-[#D2B48C]/20 text-[#8B6F47] dark:bg-[#D2B48C]/10 dark:text-[#D2B48C] px-3 py-1 rounded-full text-sm font-medium">
                  {artwork.category}
                </span>
              )}
            </div>

            {/* 작가 정보 */}
            {artist && (
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                {artist.avatar_url ? (
                  <Image
                    src={artist.avatar_url}
                    alt={artist.nickname || artist.name || '작가'}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#D2B48C] to-[#B8996B] flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {(artist.nickname || artist.name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">작가</p>
                  <p className="text-lg font-bold text-[#2C2C2C] dark:text-gray-100">
                    {artist.nickname || artist.name || '익명'}
                  </p>
                </div>
              </div>
            )}

            {/* 작품 상세 정보 */}
            <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              {/* 치수 */}
              {artwork.dimensions && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#D2B48C]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#8B6F47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">치수</p>
                    <p className="text-lg text-[#2C2C2C] dark:text-gray-100">{artwork.dimensions}</p>
                  </div>
                </div>
              )}

              {/* 가격 */}
              {artwork.price !== null && artwork.price !== undefined && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#D2B48C]/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#8B6F47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">작품 가격</p>
                    <p className="text-2xl font-bold text-[#D2B48C]">
                      ₩{artwork.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* 설명 */}
              {artwork.description && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">작품 설명</p>
                  <p className="text-[#2C2C2C] dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* 등록일 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  등록일: {new Date(artwork.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* 공유 버튼 */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('작품 링크가 복사되었습니다!');
              }}
              className="w-full bg-[#D2B48C] hover:bg-[#C19A6B] text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              작품 링크 공유하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


