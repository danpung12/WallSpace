// API services for locations
import { createClient } from '@/lib/supabase/client';

/**
 * Upload location image to Supabase Storage
 */
export async function uploadLocationImage(file: File, managerId: string): Promise<string> {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${managerId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('locations')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading location image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('locations')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Create a new location with all related data
 */
export async function createLocation(locationData: {
  storeName: string;
  storeCategory: string;
  address: string;
  addressDetail?: string;
  phone?: string;
  description?: string;
  lat: number;
  lng: number;
  snsUrls?: string[];
  options?: {
    parking: boolean;
    pets: boolean;
    twentyFourHours: boolean;
  };
  tags?: string[];
  imageUrls?: string[];
  spaces?: Array<{
    name: string;
    width: string;
    height: string;
    price: string;
    imageUrl?: string;
    description?: string;
  }>;
}) {
  const response = await fetch('/api/locations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(locationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to create location');
  }

  return await response.json();
}

/**
 * Get all locations for a manager
 */
export async function getManagerLocations() {
  const response = await fetch('/api/locations?myLocations=true');
  
  if (!response.ok) {
    throw new Error('Failed to fetch locations');
  }

  return await response.json();
}
