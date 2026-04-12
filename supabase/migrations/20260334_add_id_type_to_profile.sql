-- Update get_user_profile function to include id_type and id_number columns
-- For users without NIDA who registered with alternative IDs

-- Drop existing function to change return type
DROP FUNCTION IF EXISTS public.get_user_profile(UUID);

-- Recreate get_user_profile function with all columns including alternative ID
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
    id_type TEXT,
    id_number TEXT,
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
        u.id_type,
        u.id_number,
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
