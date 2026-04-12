-- Make service_id nullable and change to TEXT for flexibility
-- This allows applications to work with hardcoded services that aren't in the database

-- First drop the foreign key constraint
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_service_id_fkey;

-- Change service_id from UUID to TEXT to allow hardcoded string IDs
ALTER TABLE public.applications ALTER COLUMN service_id TYPE TEXT USING service_id::text;

-- Make service_id nullable
ALTER TABLE public.applications ALTER COLUMN service_id DROP NOT NULL;

-- Add service_name column to store the service name
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS service_name TEXT;
