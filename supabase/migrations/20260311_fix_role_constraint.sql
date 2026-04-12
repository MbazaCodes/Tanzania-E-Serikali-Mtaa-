-- Fix role constraint to include all roles used by the application

-- First drop the existing constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with all roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('citizen', 'staff', 'admin', 'viewer', 'approver'));

-- Also add office_id, assigned_region, assigned_district columns if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS office_id UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS assigned_region TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS assigned_district TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country_of_citizenship TEXT DEFAULT 'Tanzania';
