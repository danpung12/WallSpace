-- Add foreign key constraint from reservations.artist_id to profiles.id
-- This allows Supabase to automatically join profiles data when querying reservations

ALTER TABLE public.reservations
ADD CONSTRAINT reservations_artist_id_profiles_fkey
FOREIGN KEY (artist_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reservations_artist_profiles 
ON public.reservations(artist_id);

-- Verify the constraint was added
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS foreign_table,
    a.attname AS column_name,
    af.attname AS foreign_column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE conname = 'reservations_artist_id_profiles_fkey';

