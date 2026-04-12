-- Add missing assigned_office_id column to applications table (no foreign key constraint to avoid trigger issues)
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS assigned_office_id UUID;

-- Drop existing foreign key if it exists
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_assigned_office_id_fkey;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_applications_office ON public.applications(assigned_office_id);
