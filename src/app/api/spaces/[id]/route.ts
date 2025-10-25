import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH: Update space availability
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spaceId = params.id;
    const body = await request.json();
    const { manually_closed, max_artworks, width, height, price_per_day, image_url } = body;

    console.log('🔄 Updating space:', spaceId, body);

    // First, verify the space belongs to the user's location
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('location_id')
      .eq('id', spaceId)
      .single();

    if (spaceError || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Verify location ownership
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('manager_id')
      .eq('id', space.location_id)
      .single();

    if (locationError || !location || location.manager_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this space' }, { status: 403 });
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (typeof manually_closed === 'boolean') updateData.manually_closed = manually_closed;
    if (max_artworks !== undefined) updateData.max_artworks = max_artworks;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (price_per_day !== undefined) updateData.price_per_day = price_per_day;
    if (image_url !== undefined) updateData.image_url = image_url;

    // Update the space
    const { data: updatedSpace, error: updateError } = await supabase
      .from('spaces')
      .update(updateData)
      .eq('id', spaceId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating space:', updateError);
      return NextResponse.json({ error: 'Failed to update space' }, { status: 500 });
    }

    console.log('✅ Space updated successfully');
    return NextResponse.json(updatedSpace);

  } catch (error) {
    console.error('❌ PATCH /api/spaces/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

