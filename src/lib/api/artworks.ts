// src/lib/api/artworks.ts
import { createClient } from '@/lib/supabase/client';
import type { Artwork, ArtworkInsert, ArtworkUpdate } from '@/types/database';

/**
 * 모든 작품 가져오기 (공개된 작품)
 */
export async function getArtworks(): Promise<Artwork[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }

  return data || [];
}

/**
 * 현재 로그인한 사용자의 작품 목록 가져오기
 */
export async function getUserArtworks(): Promise<Artwork[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }

  return data || [];
}

/**
 * 작품 ID로 단일 작품 가져오기
 */
export async function getArtworkById(id: string): Promise<Artwork | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }

  return data;
}

/**
 * 이미지 파일을 Supabase Storage에 업로드
 */
export async function uploadArtworkImage(file: File, artistId: string): Promise<string> {
  const supabase = createClient();

  // 파일명을 고유하게 만들기 (타임스탬프 + 원본 파일명)
  const fileExt = file.name.split('.').pop();
  const fileName = `${artistId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('artworks')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Public URL 가져오기
  const { data: { publicUrl } } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * 새 작품 추가
 */
export async function createArtwork(artwork: {
  title: string;
  dimensions: string;
  price: number;
  description: string;
  file: File;
}): Promise<Artwork> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 1. 이미지 업로드
  const imageUrl = await uploadArtworkImage(artwork.file, user.id);

  // 2. 작품 데이터 삽입
  const artworkData: ArtworkInsert = {
    artist_id: user.id,
    title: artwork.title,
    dimensions: artwork.dimensions,
    price: artwork.price,
    description: artwork.description,
    image_url: imageUrl,
    alt_text: artwork.title,
  };

  const { data, error } = await supabase
    .from('artworks')
    .insert(artworkData)
    .select()
    .single();

  if (error) {
    console.error('Error creating artwork:', error);
    throw error;
  }

  return data;
}

/**
 * 작품 수정
 */
export async function updateArtwork(
  id: string,
  artwork: {
    title: string;
    dimensions: string;
    price: number;
    description: string;
    file?: File | null;
  }
): Promise<Artwork> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  let imageUrl: string | undefined;

  // 새 이미지가 있으면 업로드
  if (artwork.file) {
    imageUrl = await uploadArtworkImage(artwork.file, user.id);
  }

  // 작품 데이터 업데이트
  const updateData: ArtworkUpdate = {
    title: artwork.title,
    dimensions: artwork.dimensions,
    price: artwork.price,
    description: artwork.description,
    ...(imageUrl && { image_url: imageUrl, alt_text: artwork.title }),
  };

  const { data, error } = await supabase
    .from('artworks')
    .update(updateData)
    .eq('id', id)
    .eq('artist_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating artwork:', error);
    throw error;
  }

  return data;
}

/**
 * 작품 삭제
 */
export async function deleteArtwork(id: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 1. 먼저 작품 정보 가져오기 (이미지 URL 확인용)
  const { data: artwork } = await supabase
    .from('artworks')
    .select('image_url')
    .eq('id', id)
    .eq('artist_id', user.id)
    .single();

  // 2. Storage에서 이미지 삭제 (선택적)
  if (artwork?.image_url) {
    const pathMatch = artwork.image_url.match(/artworks\/(.+)/);
    if (pathMatch) {
      await supabase.storage
        .from('artworks')
        .remove([pathMatch[1]]);
    }
  }

  // 3. 작품 데이터 삭제
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)
    .eq('artist_id', user.id);

  if (error) {
    console.error('Error deleting artwork:', error);
    throw error;
  }
}
