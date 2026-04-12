-- Migration: Add birth location fields and local government officials
-- Date: 2026-03-10
-- Description: Adds birth_region, birth_district for place of birth details,
--              and mtaa_executive_officer, ward_councillor, ward_chairperson for local government officials

-- Add birth location columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS birth_region TEXT,
ADD COLUMN IF NOT EXISTS birth_district TEXT;

-- Add local government officials columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS mtaa_executive_officer TEXT,
ADD COLUMN IF NOT EXISTS ward_councillor TEXT,
ADD COLUMN IF NOT EXISTS ward_chairperson TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.users.birth_region IS 'Region where user was born';
COMMENT ON COLUMN public.users.birth_district IS 'District where user was born';
COMMENT ON COLUMN public.users.mtaa_executive_officer IS 'Name of Village/Street Executive Officer (VEO/MEO)';
COMMENT ON COLUMN public.users.ward_councillor IS 'Name of Ward Councillor (Diwani)';
COMMENT ON COLUMN public.users.ward_chairperson IS 'Name of Ward Chairperson (Optional)';
