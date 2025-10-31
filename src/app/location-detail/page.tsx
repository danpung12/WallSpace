'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Header from '../components/Header';
import { createClient } from '@/lib/supabase/client';
import Script from 'next/script';

interface Space {
  id: string;
  name: string;
  description?: string;
  price_per_day?: number;
  price?: number;
  width: number;
  height: number;
  depth?: number;
  is_available?: boolean;
  isReserved?: boolean;
  manually_closed?: boolean;
  max_artworks?: number;
  current_reservations?: number;
  image_url?: string;
  imageUrl?: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  address_detail?: string;
  description: string;
  images: string[];
  spaces: Space[];
  tags: string[];
  category?: {
    id: string;
    name: string;
  };
  options: {
    parking: boolean;
    pets: boolean;
    twenty_four_hours: boolean;
  };
  phone: string;
  snsUrls: {
    instagram?: string;
    website?: string;
    kakao?: string;
  };
  sns: Array<{ platform: string; url: string }>;
}

function LocationDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('id');
  
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'spaces' | 'details'>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [spaceEditValues, setSpaceEditValues] = useState<any>({});
  const [uploadingSpaceImage, setUploadingSpaceImage] = useState<string | null>(null);
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [selectedSpaceReservations, setSelectedSpaceReservations] = useState<any[]>([]);
  const [selectedSpaceName, setSelectedSpaceName] = useState<string>('');
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedReservationDetail, setSelectedReservationDetail] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [spaceReservationCounts, setSpaceReservationCounts] = useState<Record<string, number>>({});
  const [showSpaceFullModal, setShowSpaceFullModal] = useState(false);

  useEffect(() => {
    if (locationId) {
      fetchLocationDetail();
      fetchCategories();
    }
  }, [locationId]);

  // 각 공간의 실시간 예약 수 계산 (confirmed 상태만 카운트)
  useEffect(() => {
    const calculateReservationCounts = async () => {
      if (!location?.spaces || location.spaces.length === 0) return;
      
      // ✅ 로딩 시작 - 빈 객체로 초기화 (로딩 상태 표시용)
      setSpaceReservationCounts({});
      const startTime = performance.now();
      console.log(`⏱️ [공간관리] Loading reservation counts for ${location.spaces.length} spaces...`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        // 🚀 location_id로 한 번에 모든 예약 조회 (API 1번만!)
        const fetchStart = performance.now();
        const response = await fetch(`/api/reservations?location_id=${locationId}`);
        const fetchEnd = performance.now();
        console.log(`⏱️ [공간관리] API fetch: ${(fetchEnd - fetchStart).toFixed(0)}ms`);
        if (!response.ok) {
          console.error('Failed to fetch reservations');
          // 실패 시 모든 공간을 0으로 초기화
          const counts: Record<string, number> = {};
          location.spaces.forEach(space => {
            counts[space.id] = 0;
          });
          setSpaceReservationCounts(counts);
          return;
        }
        
        const allReservations = await response.json();
        console.log(`📦 Fetched ${allReservations.length} total reservations for location`);
        
        // 공간별로 예약 수 계산
        const counts: Record<string, number> = {};
        location.spaces.forEach((space) => {
          // 이 공간의 confirmed & 유효한 예약만 필터링
          const validCount = (allReservations || []).filter((r: any) => {
            // 공간 ID 체크
            if (r.space_id !== space.id) return false;
            
            // pending은 카운트 안 함 (여러 개 가능)
            if (r.status !== 'confirmed') return false;
            
            // 예약 기간 체크
            const endDate = new Date(r.end_date);
            endDate.setHours(23, 59, 59, 999);
            return endDate >= today;
          }).length;
          
          counts[space.id] = validCount;
          console.log(`📊 Space ${space.name}: ${validCount} confirmed reservations`);
        });
        
        console.log('📊 Real-time reservation counts (confirmed only):', counts);
        setSpaceReservationCounts(counts);
        
        const endTime = performance.now();
        console.log(`⏱️ [공간관리] ✅ Total time: ${(endTime - startTime).toFixed(0)}ms`);
        
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
        // 에러 시 모든 공간을 0으로 초기화
        const counts: Record<string, number> = {};
        location.spaces.forEach(space => {
          counts[space.id] = 0;
        });
        setSpaceReservationCounts(counts);
      }
    };
    
    if (location && !isLoading && locationId) {
      calculateReservationCounts();
    }
  }, [locationId, isLoading]); // locationId가 변경되거나 로딩이 끝날 때 실행

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchLocationDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/locations?id=${locationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setLocation(data[0]);
          setEditValues(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSpaceReservations = async (spaceId: string, spaceName: string) => {
    try {
      setLoadingReservations(true);
      setSelectedSpaceName(spaceName);
      
      // 🚀 location_id로 한 번에 조회 후 특정 space만 필터링 (속도 개선 + 에러 방지)
      const response = await fetch(`/api/reservations?location_id=${locationId}`);
      
      if (response.ok) {
        const allData = await response.json();
        console.log('📦 Raw reservations data (all):', allData?.length || 0);
        
        // 이 space의 예약만 필터링
        const spaceData = (allData || []).filter((r: any) => r.space_id === spaceId);
        console.log('📦 Reservations for this space:', spaceData.length);
        console.log('📦 Full data:', spaceData);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 필터링: 취소된 것 제외 + 예약 기간이 지난 것 제외 (pending도 표시)
        const filteredReservations = spaceData.filter((r: any) => {
          console.log('🔍 Checking reservation:', {
            id: r.id.substring(0, 8),
            status: r.status,
            start_date: r.start_date,
            end_date: r.end_date,
            artist: r.artist?.name || r.artist?.nickname
          });
          
          // 취소된 예약 제외
          if (r.status === 'cancelled') {
            console.log('❌ Filtered out (cancelled):', r.id.substring(0, 8));
            return false;
          }
          
          // 예약 종료일이 오늘 이전이면 제외
          const endDate = new Date(r.end_date);
          endDate.setHours(23, 59, 59, 999);
          if (endDate < today) {
            console.log('❌ Filtered out (expired - end date before today):', {
              id: r.id.substring(0, 8),
              end_date: r.end_date,
              today: today.toISOString()
            });
            return false;
          }
          
          // pending(대기중)도 표시, confirmed(확정)도 표시
          console.log('✅ Including reservation:', r.id.substring(0, 8), `(${r.status})`);
          return true;
        });
        
        console.log('📊 Filtered reservations:', {
          total: spaceData.length,
          filtered: filteredReservations.length,
          cancelled: spaceData.filter((r: any) => r.status === 'cancelled').length,
          expired: spaceData.filter((r: any) => {
            const endDate = new Date(r.end_date);
            endDate.setHours(23, 59, 59, 999);
            return endDate < today;
          }).length
        });
        setSelectedSpaceReservations(filteredReservations);
        setShowReservationsModal(true);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch reservations:', errorData);
        alert('예약 정보를 불러오는데 실패했습니다: ' + (errorData.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      alert('예약 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleToggleSpaceAvailability = async (spaceId: string, currentlyClosed: boolean) => {
    try {
      // currentlyClosed가 true면 해제, false면 마감
      const newStatus = !currentlyClosed;
      
      // ✅ 마감 해제 시도 시 공간이 꽉 찼는지 확인
      if (currentlyClosed && newStatus === false) {
        // 해제하려고 할 때
        const space = location?.spaces.find(s => s.id === spaceId);
        const currentReservations = spaceReservationCounts[spaceId] ?? 0;
        const maxArtworks = space?.max_artworks || 1;
        
        if (currentReservations >= maxArtworks) {
          // 공간이 꽉 찬 상태면 안내창 표시
          console.log('⚠️ Cannot unlock: Space is full', { currentReservations, maxArtworks });
          setShowSpaceFullModal(true);
          return;
        }
      }
      
      const response = await fetch(`/api/spaces/${spaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manually_closed: newStatus }),
      });

      if (response.ok) {
        setLocation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            spaces: prev.spaces.map(space =>
              space.id === spaceId
                ? { ...space, manually_closed: newStatus }
                : space
            )
          };
        });
        alert(newStatus ? '공간을 마감했습니다.' : '마감을 해제했습니다.');
      } else {
        const errorData = await response.json();
        console.error('Failed to update space:', errorData);
        throw new Error(errorData.error || 'Failed to update space status');
      }
    } catch (error) {
      console.error('Failed to toggle space availability:', error);
      alert('공간 상태 변경에 실패했습니다.');
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('locations')
        .update({
          name: editValues.name,
          description: editValues.description,
          phone: editValues.phone,
          address: editValues.address,
          address_detail: editValues.address_detail,
          category_id: editValues.category_id,
        })
        .eq('id', locationId);

      if (error) throw error;

      // 카테고리 정보 업데이트
      const selectedCategory = categories.find(c => c.id === editValues.category_id);
      
      setLocation(prev => prev ? {
        ...prev,
        name: editValues.name,
        description: editValues.description,
        phone: editValues.phone,
        address: editValues.address,
        address_detail: editValues.address_detail,
        category: selectedCategory || prev.category,
      } : null);
      
      setIsEditing(null);
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to update:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleSaveSpace = async () => {
    if (!editingSpaceId) return;
    
    try {
      const supabase = createClient();
      
      const updateData: any = {
        max_artworks: parseInt(spaceEditValues.max_artworks),
        width: parseFloat(spaceEditValues.width),
        height: parseFloat(spaceEditValues.height),
        price_per_day: parseInt(spaceEditValues.price),
      };

      if (spaceEditValues.image_url) {
        updateData.image_url = spaceEditValues.image_url;
      }

      const { error } = await supabase
        .from('spaces')
        .update(updateData)
        .eq('id', editingSpaceId);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // 로컬 상태 업데이트
      setLocation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          spaces: prev.spaces.map(space =>
            space.id === editingSpaceId
              ? { 
                  ...space, 
                  max_artworks: parseInt(spaceEditValues.max_artworks),
                  width: parseFloat(spaceEditValues.width),
                  height: parseFloat(spaceEditValues.height),
                  price: parseInt(spaceEditValues.price),
                  price_per_day: parseInt(spaceEditValues.price),
                  image_url: spaceEditValues.image_url || space.image_url,
                  imageUrl: spaceEditValues.image_url || space.imageUrl,
                }
              : space
          )
        };
      });
      
      setEditingSpaceId(null);
      setSpaceEditValues({});
      alert('저장되었습니다.');
    } catch (error) {
      console.error('Failed to update space:', error);
      alert('공간 저장에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };

  const handleSpaceImageUpload = async (spaceId: string, file: File) => {
    try {
      setUploadingSpaceImage(spaceId);
      const supabase = createClient();

      // 파일명 생성
      const fileExt = file.name.split('.').pop();
      const fileName = `${spaceId}_${Date.now()}.${fileExt}`;
      const filePath = `spaces/${fileName}`;

      // 이미지 업로드
      const { error: uploadError } = await supabase.storage
        .from('locations')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('locations')
        .getPublicUrl(filePath);

      // 수정 모드인 경우 editValues에 저장
      if (editingSpaceId === spaceId) {
        setSpaceEditValues({ ...spaceEditValues, image_url: publicUrl });
      } else {
        // 즉시 DB 업데이트
        const { error: updateError } = await supabase
          .from('spaces')
          .update({ image_url: publicUrl })
          .eq('id', spaceId);

        if (updateError) throw updateError;

        // 로컬 상태 업데이트
        setLocation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            spaces: prev.spaces.map(space =>
              space.id === spaceId
                ? { ...space, image_url: publicUrl, imageUrl: publicUrl }
                : space
            )
          };
        });
      }

      setUploadingSpaceImage(null);
    } catch (error) {
      console.error('Failed to upload space image:', error);
      alert('이미지 업로드에 실패했습니다.');
      setUploadingSpaceImage(null);
    }
  };

  const handleOpenAddressSearch = () => {
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          const fullAddress = data.address;
          const extraAddress = data.bname ? ` (${data.bname})` : '';
          setEditValues({
            ...editValues,
            address: fullAddress + extraAddress,
          });
        }
      }).open();
    } else {
      alert('주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleSaveTags = async () => {
    try {
      const supabase = createClient();
      
      // 기존 태그 삭제
      await supabase
        .from('location_tags')
        .delete()
        .eq('location_id', locationId);

      // 새 태그 삽입
      if (editValues.tags && editValues.tags.length > 0) {
        for (const tagName of editValues.tags) {
          // 태그가 존재하는지 확인
          let { data: tag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          // 태그가 없으면 생성
          if (!tag) {
            const { data: newTag } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select()
              .single();
            tag = newTag;
          }

          // location_tags에 추가
          if (tag) {
            await supabase
              .from('location_tags')
              .insert({ location_id: locationId, tag_id: tag.id });
          }
        }
      }

      setLocation(prev => prev ? { ...prev, tags: editValues.tags } : null);
      setIsEditing(null);
      alert('태그가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to update tags:', error);
      alert('태그 저장에 실패했습니다.');
    }
  };

  const handleSaveOptions = async () => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('location_options')
        .upsert({
          location_id: locationId,
          parking: editValues.options.parking,
          pets: editValues.options.pets,
          twenty_four_hours: editValues.options.twenty_four_hours,
        });

      if (error) throw error;

      setLocation(prev => prev ? { ...prev, options: editValues.options } : null);
      setIsEditing(null);
      alert('옵션이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to update options:', error);
      alert('옵션 저장에 실패했습니다.');
    }
  };

  const handleDeleteLocation = async () => {
    if (!location) return;

    try {
      const response = await fetch(`/api/locations?id=${location.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete location');

      alert('가게가 삭제되었습니다.');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete location:', error);
      alert('가게 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F5F1EC] dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D2B48C] border-t-transparent mb-4"></div>
            <div className="text-lg text-gray-600 dark:text-gray-300">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F5F1EC] dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto mb-4 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <div className="text-lg text-gray-600 dark:text-gray-300">가게를 찾을 수 없습니다.</div>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F5F1EC] dark:from-gray-900 dark:to-gray-800">
        <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[#8C7853] hover:text-[#3D2C1D] dark:text-gray-300 dark:hover:text-gray-100 transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">뒤로가기</span>
        </button>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 이미지 갤러리 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
              {location.images && location.images.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="w-full aspect-[16/9]"
                >
                  {location.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${image}")` }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-20 h-20 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-500 dark:text-gray-400">이미지 없음</span>
                  </div>
                </div>
              )}
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {[
                    { 
                      id: 'info', 
                      label: '기본 정보', 
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    },
                    { 
                      id: 'spaces', 
                      label: '공간 관리', 
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    },
                    { 
                      id: 'details', 
                      label: '상세 설정', 
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-4 py-4 text-sm font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'text-[#D2B48C] border-b-2 border-[#D2B48C] bg-[#FDF9F5] dark:bg-gray-700'
                          : 'text-gray-600 dark:text-gray-400 hover:text-[#8C7853] dark:hover:text-gray-300'
                      }`}
                    >
                      <span className="mr-2 inline-flex">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* 기본 정보 탭 */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {isEditing === 'basicInfo' ? (
                      /* 수정 모드 */
                      <>
                        {/* 가게 이름 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            가게 이름 *
                          </label>
                          <input
                            type="text"
                            value={editValues.name || ''}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            placeholder="가게 이름을 입력하세요"
                          />
                        </div>

                        {/* 주소 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            주소 *
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={editValues.address || ''}
                              readOnly
                              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                              placeholder="주소 검색 버튼을 클릭하세요"
                            />
                            <button
                              onClick={handleOpenAddressSearch}
                              className="px-6 py-3 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors font-semibold whitespace-nowrap"
                            >
                              주소 검색
                            </button>
                          </div>
                          <input
                            type="text"
                            value={editValues.address_detail || ''}
                            onChange={(e) => setEditValues({ ...editValues, address_detail: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            placeholder="상세주소를 입력하세요 (예: 3층 301호)"
                          />
                        </div>

                        {/* 전화번호 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            전화번호
                          </label>
                          <input
                            type="tel"
                            value={editValues.phone || ''}
                            onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            placeholder="전화번호를 입력하세요"
                          />
                        </div>

                        {/* 설명 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            가게 설명
                          </label>
                          <textarea
                            value={editValues.description || ''}
                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            placeholder="가게 설명을 입력하세요"
                          />
                        </div>

                        {/* 카테고리 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            카테고리 *
                          </label>
                          <select
                            value={editValues.category_id || ''}
                            onChange={(e) => setEditValues({ ...editValues, category_id: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                          >
                            <option value="">카테고리 선택</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 저장/취소 버튼 */}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleSaveBasicInfo}
                            className="flex-1 py-3 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(null);
                              setEditValues({
                                name: location.name,
                                description: location.description,
                                phone: location.phone,
                                address: location.address,
                                address_detail: location.address_detail,
                                category_id: location.category?.id,
                              });
                            }}
                            className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all"
                          >
                            취소
                          </button>
                        </div>
                      </>
                    ) : (
                      /* 읽기 모드 */
                      <>
                        {/* 가게 이름 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            가게 이름
                          </label>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{location.name}</span>
                          </div>
                        </div>

                        {/* 주소 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            주소
                          </label>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-start">
                              <svg className="w-6 h-6 mr-3 text-[#D2B48C] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <p className="text-gray-900 dark:text-gray-100">{location.address}</p>
                                {location.address_detail && (
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{location.address_detail}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 전화번호 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            전화번호
                          </label>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                              <svg className="w-6 h-6 mr-3 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="text-gray-900 dark:text-gray-100">{location.phone || '전화번호 없음'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 설명 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            가게 설명
                          </label>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {location.description || '설명이 없습니다.'}
                            </p>
                          </div>
                        </div>

                        {/* 카테고리 */}
                        {location.category && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              카테고리
                            </label>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <span className="inline-block px-4 py-2 bg-[#D2B48C] text-white rounded-full text-sm font-medium">
                                {location.category.name}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 수정 버튼 - 맨 아래로 이동 */}
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => {
                              setEditValues({
                                name: location.name,
                                description: location.description,
                                phone: location.phone,
                                address: location.address,
                                address_detail: location.address_detail,
                                category_id: location.category?.id,
                              });
                              setIsEditing('basicInfo');
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors font-semibold"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            정보 수정
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 공간 관리 탭 */}
                {activeTab === 'spaces' && (
                  <div className="space-y-4">
                    {location.spaces && location.spaces.length > 0 ? (
                      location.spaces.map((space) => {
                        // ✅ 실시간 예약 수 기반으로 마감 여부 판단
                        const isCountLoading = !(space.id in spaceReservationCounts);
                        const currentReservations = spaceReservationCounts[space.id] ?? 0;
                        const maxArtworks = space.max_artworks || 1;
                        // 로딩 중일 때는 수동 마감만 체크, 로딩 완료 후에 예약 상태 기반 마감 판단
                        const isFull = !isCountLoading && (currentReservations >= maxArtworks);
                        const isClosed = space.manually_closed || isFull || (space.is_available === false);
                        const isEditing = editingSpaceId === space.id;
                        
                        return (
                          <div
                            key={space.id}
                            className={`border-2 rounded-xl overflow-hidden transition-all ${
                              isClosed
                                ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-75'
                                : 'bg-white dark:bg-gray-800 border-[#D2B48C] shadow-md hover:shadow-lg'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* 이미지 */}
                              <div className="relative w-full h-48 md:w-48 md:h-auto flex-shrink-0 bg-gray-200 dark:bg-gray-600">
                                {uploadingSpaceImage === space.id ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D2B48C] border-t-transparent"></div>
                                  </div>
                                ) : (space.image_url || space.imageUrl) ? (
                                  <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url("${space.image_url || space.imageUrl}")` }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                {/* 이미지 업로드 버튼 */}
                                <label className="absolute inset-0 cursor-pointer bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center group">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleSpaceImageUpload(space.id, file);
                                      }
                                    }}
                                  />
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                </label>
                              </div>

                              {/* 오른쪽 내용 */}
                              <div className="flex-1 p-4 md:p-5">
                                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                                  <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                      <h3 className="text-lg sm:text-xl font-bold text-[#3D2C1D] dark:text-gray-100">
                                        {space.name}
                                      </h3>
                                      {isClosed && (
                                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                                          마감
                                        </span>
                                      )}
                                    </div>
                                    {space.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {space.description}
                                      </p>
                                    )}
                                  </div>
                                  {!isEditing && (
                                    <button
                                      onClick={() => {
                                        setEditingSpaceId(space.id);
                                        setSpaceEditValues({
                                          max_artworks: space.max_artworks || 1,
                                          width: space.width,
                                          height: space.height,
                                          price: space.price_per_day || space.price || 0,
                                          image_url: space.image_url || space.imageUrl || '',
                                        });
                                      }}
                                      className="flex items-center gap-1 px-3 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors text-sm font-semibold whitespace-nowrap"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      수정
                                    </button>
                                  )}
                                </div>

                            {isEditing ? (
                              /* 수정 모드 */
                              <div className="space-y-4 border-t pt-4">
                                {/* 크기 입력 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                      가로 (m) *
                                    </label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={spaceEditValues.width || ''}
                                      onChange={(e) => setSpaceEditValues({ ...spaceEditValues, width: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                      세로 (m) *
                                    </label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      value={spaceEditValues.height || ''}
                                      onChange={(e) => setSpaceEditValues({ ...spaceEditValues, height: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                    />
                                  </div>
                                </div>

                                {/* 가격 입력 */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    가격 (원/일) *
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={spaceEditValues.price || ''}
                                    onChange={(e) => setSpaceEditValues({ ...spaceEditValues, price: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                  />
                                </div>

                                {/* 최대 인원 입력 */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    최대 예약 가능 인원 *
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={spaceEditValues.max_artworks || 1}
                                    onChange={(e) => setSpaceEditValues({ ...spaceEditValues, max_artworks: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveSpace}
                                    className="flex-1 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors font-semibold"
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingSpaceId(null);
                                      setSpaceEditValues({});
                                    }}
                                    className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* 읽기 모드 */
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                  <div className="flex items-center gap-2 sm:gap-3 text-sm">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#D2B48C] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                    <div>
                                      <div className="font-semibold text-gray-700 dark:text-gray-300">크기</div>
                                      <div className="text-gray-600 dark:text-gray-400">
                                        {space.width}m × {space.height}m
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3 text-sm">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#D2B48C] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                      <div className="font-semibold text-gray-700 dark:text-gray-300">가격</div>
                                      <div className="text-[#D2B48C] font-bold">
                                        {(space.price_per_day || space.price || 0).toLocaleString()}원/일
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3 text-sm">
                                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#D2B48C] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div>
                                      <div className="font-semibold text-gray-700 dark:text-gray-300">예약 현황</div>
                                      <div className="text-gray-600 dark:text-gray-400">
                                        {isCountLoading ? (
                                          <span className="flex items-center gap-1">
                                            <div className="w-3 h-3 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-xs">로딩 중...</span>
                                          </span>
                                        ) : (
                                          <>
                                            <span className={`font-bold ${currentReservations >= maxArtworks ? 'text-red-500' : 'text-[#D2B48C]'}`}>
                                              {currentReservations}
                                            </span>
                                            <span className="text-gray-500 mx-1">/</span>
                                            <span className="font-bold">{maxArtworks}</span>
                                            <span className="text-gray-500 ml-1">명</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleViewSpaceReservations(space.id, space.name)}
                                    disabled={loadingReservations}
                                    className="flex-1 sm:flex-initial px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm bg-[#D2B48C] hover:bg-[#C19A6B] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    {loadingReservations ? '로딩 중...' : '예약현황'}
                                  </button>
                                  <button
                                    onClick={() => handleToggleSpaceAvailability(space.id, space.manually_closed || false)}
                                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                                      space.manually_closed
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                                  >
                                    {space.manually_closed ? (
                                      <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                        </svg>
                                        마감 해제
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        마감하기
                                      </>
                                    )}
                                  </button>
                                </div>
                              </>
                            )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">등록된 공간이 없습니다.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 상세 설정 탭 */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* 태그 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        태그
                      </label>
                      {isEditing === 'tags' ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editValues.tags?.map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-[#EAE3D9] dark:bg-gray-700 text-[#3D2C1D] dark:text-gray-300 rounded-full text-sm flex items-center gap-2"
                              >
                                #{tag}
                                <button
                                  onClick={() => {
                                    const newTags = editValues.tags.filter((_: string, i: number) => i !== index);
                                    setEditValues({ ...editValues, tags: newTags });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="태그를 입력하고 Enter를 누르세요"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.currentTarget;
                                const value = input.value.trim();
                                if (value && !editValues.tags?.includes(value)) {
                                  setEditValues({
                                    ...editValues,
                                    tags: [...(editValues.tags || []), value]
                                  });
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveTags}
                              className="px-4 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(null);
                                setEditValues({ ...editValues, tags: location.tags });
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {location.tags && location.tags.length > 0 ? (
                              location.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-[#EAE3D9] dark:bg-gray-700 text-[#3D2C1D] dark:text-gray-300 rounded-full text-sm"
                                >
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">태그가 없습니다</span>
                            )}
                          </div>
                          <button
                            onClick={() => setIsEditing('tags')}
                            className="absolute top-4 right-4 flex items-center gap-1 text-[#8C7853] hover:text-[#3D2C1D] dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            수정
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 편의시설 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        편의시설
                      </label>
                      {isEditing === 'options' ? (
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={editValues.options?.parking || false}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  options: { ...editValues.options, parking: e.target.checked }
                                })
                              }
                              className="w-5 h-5 text-[#D2B48C] rounded focus:ring-[#D2B48C]"
                            />
                            <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">주차 가능</span>
                          </label>
                          <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={editValues.options?.pets || false}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  options: { ...editValues.options, pets: e.target.checked }
                                })
                              }
                              className="w-5 h-5 text-[#D2B48C] rounded focus:ring-[#D2B48C]"
                            />
                            <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">반려동물 동반 가능</span>
                          </label>
                          <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={editValues.options?.twenty_four_hours || false}
                              onChange={(e) =>
                                setEditValues({
                                  ...editValues,
                                  options: { ...editValues.options, twenty_four_hours: e.target.checked }
                                })
                              }
                              className="w-5 h-5 text-[#D2B48C] rounded focus:ring-[#D2B48C]"
                            />
                            <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">24시간 운영</span>
                          </label>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={handleSaveOptions}
                              className="px-4 py-2 bg-[#D2B48C] text-white rounded-lg hover:bg-[#C19A6B] transition-colors"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(null);
                                setEditValues({ ...editValues, options: location.options });
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="space-y-2">
                            {location.options?.parking && (
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300">주차 가능</span>
                              </div>
                            )}
                            {location.options?.pets && (
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300">반려동물 동반 가능</span>
                              </div>
                            )}
                            {location.options?.twenty_four_hours && (
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300">24시간 운영</span>
                              </div>
                            )}
                            {!location.options?.parking && !location.options?.pets && !location.options?.twenty_four_hours && (
                              <span className="text-gray-500 dark:text-gray-400">선택된 옵션이 없습니다</span>
                            )}
                          </div>
                          <button
                            onClick={() => setIsEditing('options')}
                            className="absolute top-4 right-4 flex items-center gap-1 text-[#8C7853] hover:text-[#3D2C1D] dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            수정
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SNS 링크 */}
                    {location.snsUrls && Object.keys(location.snsUrls).length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          SNS
                        </label>
                          <div className="grid grid-cols-1 gap-3">
                          {location.snsUrls.instagram && (
                            <a
                              href={location.snsUrls.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              <span className="font-medium">Instagram</span>
                            </a>
                          )}
                          {location.snsUrls.website && (
                            <a
                              href={location.snsUrls.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                              <span className="font-medium">Website</span>
                            </a>
                          )}
                          {location.snsUrls.kakao && (
                            <a
                              href={location.snsUrls.kakao}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 00-.656-.678l-1.928 1.866V9.282a.472.472 0 00-.944 0v2.557a.471.471 0 00.063.236c.007.01.02.01.029.023l.018.023 1.928 1.866a.667.667 0 00.236.134.47.47 0 00.42-.098.472.472 0 00-.636-.962zm-2.622.001a.472.472 0 00.472-.472v-2.117a.472.472 0 00-.472-.472h-1.56a.472.472 0 000 .945h1.088v1.644a.472.472 0 00.472.472zm-2.583 0a.472.472 0 00.472-.472v-2.117a.472.472 0 00-.472-.472h-1.56a.472.472 0 000 .945h1.088v1.644a.472.472 0 00.472.472zm-2.26-1.614v.358a.472.472 0 01-.944 0V8.472a.472.472 0 01.472-.472h1.45a.472.472 0 010 .944h-.978v.782h.978a.472.472 0 010 .944h-.978v.777z"/>
                              </svg>
                              <span className="font-medium">Kakao</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 빠른 액션 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* 상태 카드 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">가게 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">전체 공간</span>
                    <span className="text-xl font-bold text-[#D2B48C]">{location.spaces?.length || 0}개</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">예약 가능</span>
                    <span className="text-xl font-bold text-green-500">
                      {location.spaces?.filter(s => !s.manually_closed && !s.isReserved).length || 0}개
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">마감</span>
                    <span className="text-xl font-bold text-red-500">
                      {location.spaces?.filter(s => s.manually_closed || s.isReserved).length || 0}개
                    </span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-3">
                <button
                  onClick={() => router.push(`/dashboard/add-store?mode=edit&id=${location.id}`)}
                  className="w-full py-3 bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  전체 수정
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  가게 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 예약현황 모달 */}
      {showReservationsModal && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowReservationsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">예약 현황</h3>
                  <p className="text-white/90 text-sm">{selectedSpaceName}</p>
                </div>
                <button
                  onClick={() => setShowReservationsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* 예약 요약 */}
              <div className="mt-4 flex gap-4 text-sm flex-wrap">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="opacity-90">전체: </span>
                  <span className="font-bold">{selectedSpaceReservations.length}건</span>
                </div>
                <div className="bg-green-500/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="opacity-90">확정: </span>
                  <span className="font-bold">
                    {selectedSpaceReservations.filter(r => r.status === 'confirmed').length}건
                  </span>
                </div>
                <div className="bg-yellow-500/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="opacity-90">대기중: </span>
                  <span className="font-bold">
                    {selectedSpaceReservations.filter(r => r.status === 'pending').length}건
                  </span>
                </div>
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D2B48C #F5F5F5'
            }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: #F5F5F5;
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb {
                  background-color: #D2B48C;
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background-color: #C19A6B;
                }
              `}</style>

              {selectedSpaceReservations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">예약이 없습니다</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">이 공간에 대한 예약이 아직 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSpaceReservations.map((reservation) => {
                    const statusStyles = {
                      confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '확정' },
                      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: '대기중' },
                      completed: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: '완료' },
                    };
                    const status = statusStyles[reservation.status as keyof typeof statusStyles] || statusStyles.pending;

                    const handleClick = () => {
                      console.log('🖱️ Clicked reservation:', {
                        id: reservation.id,
                        status: reservation.status,
                        artist: reservation.artist?.name
                      });
                      
                      if (reservation.status === 'pending') {
                        // 대기중이면 상세 페이지로 이동
                        console.log('➡️ Navigating to approval page with ID:', reservation.id);
                        router.push(`/manager-booking-approval?id=${encodeURIComponent(reservation.id)}`);
                      } else {
                        // 그 외에는 상세 모달 표시
                        console.log('📄 Opening detail modal');
                        setSelectedReservationDetail(reservation);
                        setShowDetailModal(true);
                      }
                    };

                    return (
                      <div
                        key={reservation.id}
                        onClick={handleClick}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all bg-white dark:bg-gray-800 cursor-pointer hover:border-[#D2B48C]"
                      >
                        <div className="flex items-start gap-3">
                          {/* 작가 프로필 */}
                          <div
                            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2B48C] to-[#C19A6B] flex items-center justify-center text-white font-bold flex-shrink-0"
                            style={reservation.artist?.avatar_url ? {
                              backgroundImage: `url("${reservation.artist.avatar_url}")`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            } : {}}
                          >
                            {!reservation.artist?.avatar_url && (reservation.artist?.nickname || reservation.artist?.name || 'U').substring(0, 1).toUpperCase()}
                          </div>

                          {/* 간단 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                {reservation.artist?.nickname || reservation.artist?.name || '작가 정보 없음'}
                              </p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${status.bg} ${status.text} flex-shrink-0 ml-2`}>
                                {status.label}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              📅 {new Date(reservation.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~ {new Date(reservation.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </p>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              예약 ID: {reservation.id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 예약 상세 모달 */}
      {showDetailModal && selectedReservationDetail && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#D2B48C] to-[#C19A6B] p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">예약 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-sm opacity-90">
                <p>예약 ID: {selectedReservationDetail.id.substring(0, 8).toUpperCase()}</p>
                <p className="mt-1">
                  상태: {
                    selectedReservationDetail.status === 'confirmed' ? '확정'
                    : selectedReservationDetail.status === 'pending' ? '대기중'
                    : '완료'
                  }
                </p>
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D2B48C #F5F5F5'
            }}>
              <div className="space-y-6">
                {/* 작가 정보 */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b-2 border-[#D2B48C]">
                    작가 정보
                  </h4>
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D2B48C] to-[#C19A6B] flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                      style={selectedReservationDetail.artist?.avatar_url ? {
                        backgroundImage: `url("${selectedReservationDetail.artist.avatar_url}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {}}
                    >
                      {!selectedReservationDetail.artist?.avatar_url && (selectedReservationDetail.artist?.nickname || selectedReservationDetail.artist?.name || 'U').substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {selectedReservationDetail.artist?.nickname || selectedReservationDetail.artist?.name || '작가 정보 없음'}
                      </p>
                      {selectedReservationDetail.artist?.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📞 {selectedReservationDetail.artist.phone}
                        </p>
                      )}
                      {selectedReservationDetail.artist?.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ✉️ {selectedReservationDetail.artist.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 작품 정보 */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b-2 border-[#D2B48C]">
                    작품 정보
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex gap-4">
                      <div
                        className="w-32 h-32 rounded-lg bg-cover bg-center flex-shrink-0 border-2 border-gray-200 dark:border-gray-600"
                        style={{
                          backgroundImage: `url("${selectedReservationDetail.artwork?.image_url || 'https://via.placeholder.com/200'}")`
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                          &ldquo;{selectedReservationDetail.artwork?.title || '작품 정보 없음'}&rdquo;
                        </p>
                        {selectedReservationDetail.artwork?.dimensions && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            📏 크기: {selectedReservationDetail.artwork.dimensions}
                          </p>
                        )}
                        {selectedReservationDetail.artwork?.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {selectedReservationDetail.artwork.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 예약 기간 */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b-2 border-[#D2B48C]">
                    예약 기간
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-[#D2B48C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(selectedReservationDetail.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {' ~ '}
                        {new Date(selectedReservationDetail.end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
                      총 {Math.ceil((new Date(selectedReservationDetail.end_date).getTime() - new Date(selectedReservationDetail.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1}일
                    </p>
                  </div>
                </div>

                {/* 결제 정보 */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b-2 border-[#D2B48C]">
                    결제 정보
                  </h4>
                  <div className="bg-gradient-to-r from-[#D2B48C]/10 to-[#C19A6B]/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">총 결제 금액</span>
                      <span className="text-2xl font-bold text-[#D2B48C]">
                        {(selectedReservationDetail.total_price || 0).toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-3 bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공간 꽉 참 안내창 (문의하기 제출완료와 같은 디자인) */}
      {showSpaceFullModal && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSpaceFullModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-gray-100 mb-2">
              마감 해제 불가
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              현재 예약이 꽉 찬 상태입니다.<br />
              예약을 취소하거나 종료된 후에<br />
              마감을 해제할 수 있습니다.
            </p>
            <button
              onClick={() => setShowSpaceFullModal(false)}
              className="w-full px-6 py-3 rounded-xl bg-[#D2B48C] hover:bg-[#C19A6B] text-white font-semibold transition-all transform hover:scale-105"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md mx-4 shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <svg className="w-20 h-20 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                가게 삭제
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                &ldquo;{location.name}&rdquo;을(를) 삭제하시겠습니까?
                <br />
                <span className="text-red-500 font-semibold">삭제된 가게는 복구할 수 없습니다.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold transition-all transform hover:scale-105"
              >
                취소
              </button>
              <button
                onClick={handleDeleteLocation}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all transform hover:scale-105"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function LocationDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F5F1EC] dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D2B48C] border-t-transparent mb-4"></div>
            <div className="text-lg text-gray-600 dark:text-gray-300">로딩 중...</div>
          </div>
        </div>
      </div>
    }>
      <LocationDetailContent />
    </Suspense>
  );
}
