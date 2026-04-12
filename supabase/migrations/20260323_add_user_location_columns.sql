-- Add missing citizen location columns to users table

-- Add location columns for citizens
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ward TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS street TEXT;

-- Ensure other columns exist that might be missing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sex TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country_of_citizenship TEXT DEFAULT 'Tanzania';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_diaspora BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country_of_residence TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS passport_number TEXT;

-- Drop existing function to change return type
DROP FUNCTION IF EXISTS public.get_user_profile(UUID);

-- Update get_user_profile function to include all columns
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    gender TEXT,
    sex TEXT,
    nationality TEXT,
    country_of_citizenship TEXT,
    nida_number TEXT,
    phone TEXT,
    email TEXT,
    photo_url TEXT,
    role TEXT,
    is_verified BOOLEAN,
    is_diaspora BOOLEAN,
    country_of_residence TEXT,
    passport_number TEXT,
    office_id UUID,
    assigned_region TEXT,
    assigned_district TEXT,
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        u.id,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.gender,
        u.sex,
        u.nationality,
        u.country_of_citizenship,
        u.nida_number,
        u.phone,
        u.email,
        u.photo_url,
        u.role::TEXT,
        u.is_verified,
        u.is_diaspora,
        u.country_of_residence,
        u.passport_number,
        u.office_id,
        u.assigned_region,
        u.assigned_district,
        u.region,
        u.district,
        u.ward,
        u.street,
        u.created_at,
        u.updated_at
    FROM users u
    WHERE u.id = user_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO anon;

-- Update RLS policy to allow inserting with all columns
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
