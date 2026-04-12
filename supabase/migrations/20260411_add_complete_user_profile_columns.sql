-- Add missing user profile columns to support full profile editing
-- Date: 2026-04-11

-- Personal Information
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS place_of_birth TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS education_level TEXT CHECK (education_level IN ('none', 'primary', 'secondary', 'diploma', 'degree', 'masters', 'phd'));

-- Contact Information
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS alternative_phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS alternative_email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country_of_residence TEXT;

-- Residential Address
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS house_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS landmark TEXT;

-- Emergency Contact
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT;

-- Staff/Work Information
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS employment_date DATE;

-- Additional Information
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disability_status TEXT CHECK (disability_status IN ('none', 'physical', 'visual', 'hearing', 'speech', 'multiple'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS religious_affiliation TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tribe TEXT;

-- Metadata
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Voter ID and Driving License (additional identity fields)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS voter_id_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS driving_license_number TEXT;

-- Diaspora additional fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city_of_residence TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS diaspora_region TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS diaspora_district TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS diaspora_ward TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_nida ON public.users(nida_number) WHERE nida_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_region_district ON public.users(region, district) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);

-- Update the get_user_profile function to include all new columns
DROP FUNCTION IF EXISTS public.get_user_profile(UUID);

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    gender TEXT,
    sex TEXT,
    date_of_birth DATE,
    place_of_birth TEXT,
    marital_status TEXT,
    occupation TEXT,
    education_level TEXT,
    nationality TEXT,
    country_of_citizenship TEXT,
    nida_number TEXT,
    id_type TEXT,
    id_number TEXT,
    passport_number TEXT,
    voter_id_number TEXT,
    driving_license_number TEXT,
    phone TEXT,
    alternative_phone TEXT,
    email TEXT,
    email_address TEXT,
    alternative_email TEXT,
    photo_url TEXT,
    role TEXT,
    is_verified BOOLEAN,
    is_diaspora BOOLEAN,
    country_of_residence TEXT,
    city_of_residence TEXT,
    diaspora_region TEXT,
    diaspora_district TEXT,
    diaspora_ward TEXT,
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    house_number TEXT,
    postal_code TEXT,
    landmark TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    office_id UUID,
    assigned_region TEXT,
    assigned_district TEXT,
    employee_id TEXT,
    department TEXT,
    "position" TEXT,
    employment_date DATE,
    blood_group TEXT,
    disability_status TEXT,
    religious_affiliation TEXT,
    tribe TEXT,
    citizen_id TEXT,
    seller_id TEXT,
    landlord_id TEXT,
    broker_id TEXT,
    last_login TIMESTAMPTZ,
    account_status TEXT,
    email_verified BOOLEAN,
    phone_verified BOOLEAN,
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
        u.date_of_birth,
        u.place_of_birth,
        u.marital_status,
        u.occupation,
        u.education_level,
        u.nationality,
        u.country_of_citizenship,
        u.nida_number,
        u.id_type,
        u.id_number,
        u.passport_number,
        u.voter_id_number,
        u.driving_license_number,
        u.phone,
        u.alternative_phone,
        u.email,
        u.email_address,
        u.alternative_email,
        u.photo_url,
        u.role,
        u.is_verified,
        u.is_diaspora,
        u.country_of_residence,
        u.city_of_residence,
        u.diaspora_region,
        u.diaspora_district,
        u.diaspora_ward,
        u.region,
        u.district,
        u.ward,
        u.street,
        u.house_number,
        u.postal_code,
        u.landmark,
        u.emergency_contact_name,
        u.emergency_contact_phone,
        u.emergency_contact_relation,
        u.office_id,
        u.assigned_region,
        u.assigned_district,
        u.employee_id,
        u.department,
        u."position",
        u.employment_date,
        u.blood_group,
        u.disability_status,
        u.religious_affiliation,
        u.tribe,
        u.citizen_id,
        u.seller_id,
        u.landlord_id,
        u.broker_id,
        u.last_login,
        u.account_status,
        u.email_verified,
        u.phone_verified,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = user_id;
$$;