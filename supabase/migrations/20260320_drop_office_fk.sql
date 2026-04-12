-- Drop foreign key constraint on assigned_office_id to avoid trigger issues
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_assigned_office_id_fkey;
