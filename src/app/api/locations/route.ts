// API Route: GET /api/locations
// 데이터베이스에서 모든 장소 데이터를 가져옵니다
// Query params: ?myLocations=true - 현재 사용자의 장소만 가져오기 (사장님용)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Location 데이터를 처리하는 헬퍼 함수
async function processLocations(supabase: any, basicLocations: any[]) {
  console.log('Fetched basic locations:', basicLocations?.length || 0);

  // locations가 없으면 빈 배열 반환
  if (!basicLocations || basicLocations.length === 0) {
    console.warn('No locations found in database');
    return NextResponse.json([]);
  }

  // 모든 관련 데이터를 한 번에 가져오기
  const locationIds = basicLocations.map(loc => loc.id);
  
  const [categoriesData, optionsData, imagesData, tagsData, snsData, spacesData, reservationsData] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('location_options').select('*').in('location_id', locationIds),
    supabase.from('location_images').select('*').in('location_id', locationIds).order('sort_order'),
    supabase.from('location_tags').select('location_id, tag:tags(name)').in('location_id', locationIds),
    supabase.from('location_sns').select('*').in('location_id', locationIds),
    supabase.from('spaces').select('*').in('location_id', locationIds),
    supabase.from('reservations').select('space_id, status').in('location_id', locationIds),
  ]);

  // 데이터를 location별로 그룹화
  const locationsData = basicLocations.map((location) => {
    const category = categoriesData.data?.find((c: any) => c.id === location.category_id);
    const options = optionsData.data?.find((o: any) => o.location_id === location.id);
    const images = imagesData.data?.filter((i: any) => i.location_id === location.id) || [];
    const tags = tagsData.data?.filter((t: any) => t.location_id === location.id) || [];
    const sns = snsData.data?.filter((s: any) => s.location_id === location.id) || [];
    const spaces = spacesData.data?.filter((sp: any) => sp.location_id === location.id) || [];

    return {
      ...location,
      category,
      options,
      images,
      tags,
      sns,
      spaces,
    };
  });

  console.log('Fetched locations with relations count:', locationsData?.length || 0);

  // ID 중복 체크
  const uniqueIds = new Set(locationsData.map((loc: any) => loc.id));
  console.log('Unique location IDs:', uniqueIds.size, 'Total:', locationsData.length);
  if (uniqueIds.size !== locationsData.length) {
    console.warn('⚠️ Duplicate location IDs found!');
  }

  // mock 데이터 형식으로 변환
  const formattedLocations = locationsData?.map((location: any) => {
    // 이미지 배열 생성 (location_images 테이블에서)
    const images = location.images
      ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => img.image_url) || [];

    // 태그 배열 생성
    const tags = location.tags?.map((t: any) => t.tag.name) || [];

    // SNS URL 배열 생성
    const snsUrls = location.sns?.map((s: any) => s.url) || [];

    // spaces 데이터 변환
    const spaces = location.spaces?.map((space: any) => {
      const maxArtworks = space.max_artworks || 1;
      
      // 이 space에 대한 현재 유효한 예약 수 계산 (confirmed 또는 pending 상태)
      const activeReservations = reservationsData.data?.filter((r: any) => 
        r.space_id === space.id && 
        (r.status === 'confirmed' || r.status === 'pending')
      ) || [];
      const currentReservations = activeReservations.length;
      
      const isFullyBooked = currentReservations >= maxArtworks;
      const isManuallyClosed = space.manually_closed || false;
      const isReserved = isFullyBooked || isManuallyClosed || (space.is_available === false);
      
      console.log(`Space ${space.name} (${space.id}):`, {
        maxArtworks,
        currentReservations,
        isFullyBooked,
        isManuallyClosed,
        is_available: space.is_available,
        isReserved
      });
      
      // images 배열이나 image_url 중 하나를 사용 (DB 스키마에 따라)
      const spaceImageUrl = space.image_url || 
                           (space.images && space.images.length > 0 ? space.images[0] : null) ||
                           'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop';
      
      return {
        id: space.id, // UUID 추가 (예약에 필수!)
        name: space.name,
        imageUrl: spaceImageUrl, // images 배열 또는 image_url 사용
        isReserved, // 예약 마감, 수동 마감, 또는 비활성화
        width: space.width || 0,
        height: space.height || 0,
        price: space.price_per_day || space.price || 0,
        price_per_day: space.price_per_day || space.price || 0,
        max_artworks: maxArtworks,
        current_reservations: currentReservations,
        manually_closed: isManuallyClosed,
        is_available: space.is_available !== false,
      };
    }) || [];
    
    console.log(`Location ${location.name}: Total spaces = ${spaces.length}, Available = ${spaces.filter((s: any) => !s.isReserved).length}`);

    return {
      id: location.id,
      name: location.name,
      category: location.category ? {
        id: location.category.id,
        name: location.category.name
      } : { name: '기타' },
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng),
      address: location.address || '',
      phone: location.phone || '',
      snsUrls,
      sns: location.sns || [],
      options: location.options || {
        parking: false,
        pets: false,
        twenty_four_hours: false,
      },
      tags,
      statusText: location.status_text || '예약 가능',
      statusColor: location.status_color || '#3B82F6',
      images,
      description: location.description || '',
      spaces,
      reviews: [], // 리뷰는 별도 API로 처리 가능
      totalSlots: location.total_slots || 0,
      reservedSlots: location.reserved_slots || 0,
      reservationStatus: 'available' as const, // 사용자별로 다르므로 추후 구현
    };
  }) || [];

  // 중복 제거 (혹시 모를 중복 방지)
  const uniqueLocations = Array.from(
    new Map(formattedLocations.map(loc => [loc.id, loc])).values()
  );

  console.log('Returning locations:', uniqueLocations.length);
  return NextResponse.json(uniqueLocations);
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const myLocationsOnly = searchParams.get('myLocations') === 'true';
    const locationId = searchParams.get('id');

    // 현재 로그인한 사용자 정보 가져오기
    let currentUserId = null;
    if (myLocationsOnly) {
      const { data: { user } } = await supabase.auth.getUser();
      currentUserId = user?.id;
      
      if (!currentUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 먼저 기본 locations만 가져오기
    let query = supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 특정 ID로 조회
    if (locationId) {
      query = query.eq('id', locationId);
    }
    
    // 사장님의 경우 자신의 가게만 필터링 (manager_id 컬럼이 있는 경우에만)
    if (myLocationsOnly && currentUserId) {
      // manager_id 컬럼 존재 여부를 확인하기 위해 먼저 조회
      query = query.eq('manager_id', currentUserId);
    }

    const { data: basicLocations, error: basicError } = await query;
    
    // manager_id 컬럼이 없어서 에러가 발생한 경우 (42703 = column not found)
    if (basicError && basicError.code === '42703') {
      console.warn('⚠️ manager_id column not found. Please run migration: 20241024200000_add_manager_to_locations.sql');
      console.warn('Falling back to fetching all locations...');
      
      // manager_id 없이 다시 조회
      const fallbackQuery = supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        console.error('Error fetching locations (fallback):', fallbackError);
        return NextResponse.json({ 
          error: 'Failed to fetch locations', 
          details: fallbackError.message 
        }, { status: 500 });
      }
      
      // fallback 데이터로 계속 진행
      return await processLocations(supabase, fallbackData || []);
    }

    if (basicError) {
      console.error('Error fetching basic locations:', basicError);
      return NextResponse.json({ 
        error: 'Failed to fetch locations', 
        details: basicError.message 
      }, { status: 500 });
    }

    // processLocations 함수를 사용하여 데이터 처리
    return await processLocations(supabase, basicLocations || []);
  } catch (error) {
    console.error('Error in locations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new location
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const {
      storeName,
      storeCategory,
      address,
      addressDetail,
      phone,
      description,
      lat,
      lng,
      snsUrls,
      options,
      tags,
      imageUrls, // Array of uploaded image URLs
      spaces, // Array of space objects
    } = body;

    // Validate required fields
    if (!storeName || !address || !lat || !lng) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'storeName, address, lat, lng are required'
      }, { status: 400 });
    }

    // Get category ID
    let categoryId = null;
    if (storeCategory) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', storeCategory)
        .single();
      categoryId = categoryData?.id;
    }

    // Insert location
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .insert({
        name: storeName,
        category_id: categoryId,
        lat,
        lng,
        address: addressDetail ? `${address} ${addressDetail}` : address,
        phone: phone || null,
        description: description || null,
        manager_id: user.id, // Set current user as manager
        status_text: '예약 가능',
        status_color: '#3B82F6',
        total_slots: spaces?.length || 0,
        reserved_slots: 0,
      })
      .select()
      .single();

    if (locationError) {
      console.error('Error creating location:', locationError);
      return NextResponse.json({ 
        error: 'Failed to create location',
        details: locationError.message
      }, { status: 500 });
    }

    const locationId = location.id;

    // Insert location options
    if (options) {
      await supabase
        .from('location_options')
        .insert({
          location_id: locationId,
          parking: options.parking || false,
          pets: options.pets || false,
          twenty_four_hours: options.twentyFourHours || false,
        });
    }

    // Insert location images
    if (imageUrls && imageUrls.length > 0) {
      const imageInserts = imageUrls.map((url: string, index: number) => ({
        location_id: locationId,
        image_url: url,
        sort_order: index,
      }));
      await supabase.from('location_images').insert(imageInserts);
    }

    // Insert tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Get or create tag
        let tagId;
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single();

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single();
          tagId = newTag?.id;
        }

        // Link tag to location
        if (tagId) {
          await supabase
            .from('location_tags')
            .insert({
              location_id: locationId,
              tag_id: tagId,
            });
        }
      }
    }

    // Insert SNS URLs
    if (snsUrls && snsUrls.length > 0) {
      const snsInserts = snsUrls
        .filter((url: string) => url && url.trim())
        .map((url: string) => ({
          location_id: locationId,
          url: url.trim(),
        }));
      if (snsInserts.length > 0) {
        await supabase.from('location_sns').insert(snsInserts);
      }
    }

    // Insert spaces
    if (spaces && spaces.length > 0) {
      const spaceInserts = spaces.map((space: any) => ({
        location_id: locationId,
        name: space.name,
        width: parseInt(space.width) || 0,
        height: parseInt(space.height) || 0,
        size: `${space.width} x ${space.height} cm`,
        price: parseInt(space.price) || 0,
        max_artworks: parseInt(space.maxArtworks) || 1,
        current_reservations: 0,
        image_url: space.imageUrl || null, // image_url 컬럼에 저장
        description: space.description || '',
        is_reserved: false,
      }));
      await supabase.from('spaces').insert(spaceInserts);
    }

    console.log('✅ Location created successfully:', locationId);

    return NextResponse.json({ 
      success: true,
      location: {
        id: locationId,
        name: storeName,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST locations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update an existing location
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const {
      id: locationId,
      storeName,
      storeCategory,
      address,
      addressDetail,
      phone,
      description,
      snsUrls,
      options,
      tags,
      imageUrls,
      spaces,
      lat,
      lng,
    } = body;

    console.log('📝 Updating location:', locationId);

    // Verify ownership
    const { data: existingLocation, error: checkError } = await supabase
      .from('locations')
      .select('manager_id')
      .eq('id', locationId)
      .single();

    if (checkError || !existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    if (existingLocation.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this location' }, { status: 403 });
    }

    // Get category ID
    let categoryId = null;
    if (storeCategory) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', storeCategory)
        .single();
      categoryId = category?.id || null;
    }

    // Update main location
    const { error: locationError } = await supabase
      .from('locations')
      .update({
        name: storeName,
        category_id: categoryId,
        lat,
        lng,
        address: addressDetail ? `${address} ${addressDetail}` : address,
        phone: phone || null,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', locationId);

    if (locationError) {
      console.error('❌ Error updating location:', locationError);
      return NextResponse.json({ error: 'Failed to update location', details: locationError.message }, { status: 500 });
    }

    // Update location options
    await supabase.from('location_options').delete().eq('location_id', locationId);
    if (options) {
      await supabase.from('location_options').insert({
        location_id: locationId,
        parking: options.parking || false,
        pets: options.pets || false,
        twenty_four_hours: options.twentyFourHours || false,
      });
    }

    // Update location images
    await supabase.from('location_images').delete().eq('location_id', locationId);
    if (imageUrls && imageUrls.length > 0) {
      const imageInserts = imageUrls.map((url: string, index: number) => ({
        location_id: locationId,
        image_url: url,
        sort_order: index,
      }));
      await supabase.from('location_images').insert(imageInserts);
    }

    // Update tags
    await supabase.from('location_tags').delete().eq('location_id', locationId);
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let { data: tag } = await supabase.from('tags').select('id').eq('name', tagName).single();
        if (!tag) {
          const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select().single();
          tag = newTag;
        }
        if (tag) {
          await supabase.from('location_tags').insert({ location_id: locationId, tag_id: tag.id });
        }
      }
    }

    // Update SNS
    await supabase.from('location_sns').delete().eq('location_id', locationId);
    if (snsUrls && snsUrls.length > 0) {
      const snsInserts = snsUrls
        .filter((url: string) => url && url.trim())
        .map((url: string) => {
          let platform = 'website';
          if (url.includes('instagram.com')) platform = 'instagram';
          else if (url.includes('facebook.com')) platform = 'facebook';
          return { location_id: locationId, platform, url };
        });
      if (snsInserts.length > 0) {
        await supabase.from('location_sns').insert(snsInserts);
      }
    }

    // Update spaces
    await supabase.from('spaces').delete().eq('location_id', locationId);
    if (spaces && spaces.length > 0) {
      const spaceInserts = spaces.map((space: any) => ({
        location_id: locationId,
        name: space.name,
        width: parseInt(space.width) || 0,
        height: parseInt(space.height) || 0,
        size: `${space.width} x ${space.height} cm`,
        price: parseInt(space.price) || 0,
        max_artworks: parseInt(space.maxArtworks) || 1,
        current_reservations: space.current_reservations || 0,
        image_url: space.imageUrl || null, // image_url 컬럼에 저장
        description: space.description || '',
        is_reserved: space.is_reserved || false,
      }));
      await supabase.from('spaces').insert(spaceInserts);
    }

    console.log('✅ Location updated successfully:', locationId);

    return NextResponse.json({ 
      success: true,
      location: {
        id: locationId,
        name: storeName,
      }
    });

  } catch (error) {
    console.error('Error in PUT locations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a location
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get location ID from query params
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('id');

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting location:', locationId);

    // Verify ownership
    const { data: existingLocation, error: checkError } = await supabase
      .from('locations')
      .select('manager_id')
      .eq('id', locationId)
      .single();

    if (checkError || !existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    if (existingLocation.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this location' }, { status: 403 });
    }

    // Delete related data first (due to foreign key constraints)
    await Promise.all([
      supabase.from('location_options').delete().eq('location_id', locationId),
      supabase.from('location_images').delete().eq('location_id', locationId),
      supabase.from('location_tags').delete().eq('location_id', locationId),
      supabase.from('location_sns').delete().eq('location_id', locationId),
      supabase.from('spaces').delete().eq('location_id', locationId),
    ]);

    // Delete the location itself
    const { error: deleteError } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId);

    if (deleteError) {
      console.error('❌ Error deleting location:', deleteError);
      return NextResponse.json({ error: 'Failed to delete location', details: deleteError.message }, { status: 500 });
    }

    console.log('✅ Location deleted successfully');
    return NextResponse.json({ success: true, message: 'Location deleted successfully' });

  } catch (error) {
    console.error('❌ DELETE /api/locations error:', error);
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

