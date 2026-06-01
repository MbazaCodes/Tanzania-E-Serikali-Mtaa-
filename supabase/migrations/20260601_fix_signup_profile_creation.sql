-- =====================================================================
-- Fix: Citizens can't create their own profile during signup
--
-- PROBLEM: When email confirmation is enabled, supabase.auth.signUp()
-- creates the auth user but does NOT establish a session. So auth.uid()
-- returns NULL. The INSERT policy "auth.uid() = id" then blocks the
-- profile row creation because NULL != new-user-id.
--
-- SOLUTION: Create a SECURITY DEFINER function that bypasses RLS to
-- create the profile row during signup. This is safe because:
-- 1. It only inserts if the user doesn't already exist
-- 2. The id must match an existing auth.users row (FK constraint)
-- 3. Role is hardcoded to 'citizen' (can't self-promote)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.create_citizen_profile(
  p_id UUID,
  p_first_name TEXT,
  p_middle_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_sex TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_place_of_birth TEXT DEFAULT NULL,
  p_marital_status TEXT DEFAULT NULL,
  p_occupation TEXT DEFAULT NULL,
  p_education_level TEXT DEFAULT NULL,
  p_nationality TEXT DEFAULT 'Tanzanian',
  p_country_of_citizenship TEXT DEFAULT 'Tanzania',
  p_nida_number TEXT DEFAULT NULL,
  p_id_type TEXT DEFAULT NULL,
  p_id_number TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_district TEXT DEFAULT NULL,
  p_ward TEXT DEFAULT NULL,
  p_street TEXT DEFAULT NULL,
  p_is_diaspora BOOLEAN DEFAULT FALSE,
  p_country_of_residence TEXT DEFAULT NULL,
  p_passport_number TEXT DEFAULT NULL,
  p_is_verified BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, first_name, middle_name, last_name, email, phone,
    sex, gender, date_of_birth, place_of_birth, marital_status,
    occupation, education_level, nationality, country_of_citizenship,
    nida_number, id_type, id_number, region, district, ward, street,
    is_diaspora, country_of_residence, passport_number,
    role, is_verified
  ) VALUES (
    p_id, p_first_name, p_middle_name, p_last_name, p_email, p_phone,
    p_sex, p_gender, p_date_of_birth, p_place_of_birth, p_marital_status,
    p_occupation, p_education_level, p_nationality, p_country_of_citizenship,
    p_nida_number, p_id_type, p_id_number, p_region, p_district, p_ward, p_street,
    p_is_diaspora, p_country_of_residence, p_passport_number,
    'citizen', p_is_verified  -- role is ALWAYS citizen (can't self-promote)
  )
  ON CONFLICT (id) DO NOTHING;  -- safe: if profile already exists, skip
END;
$$;

-- Grant execute to anon and authenticated (needed during signup before session exists)
GRANT EXECUTE ON FUNCTION public.create_citizen_profile TO anon;
GRANT EXECUTE ON FUNCTION public.create_citizen_profile TO authenticated;

-- Also fix: allow anon users to check if email/NIDA exists (for duplicate check during signup)
-- Currently RLS blocks all SELECT for unauthenticated users
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE email = p_email);
$$;

CREATE OR REPLACE FUNCTION public.check_nida_exists(p_nida TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE nida_number = p_nida);
$$;

GRANT EXECUTE ON FUNCTION public.check_email_exists TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_nida_exists TO anon;
GRANT EXECUTE ON FUNCTION public.check_nida_exists TO authenticated;
