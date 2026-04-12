-- Add missing columns to applications table
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS ward TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS street TEXT;

-- Fix RLS policies for applications - allow citizens to insert their own applications
DROP POLICY IF EXISTS "Citizens can insert own applications" ON public.applications;
CREATE POLICY "Citizens can insert own applications" ON public.applications 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow citizens to view their own applications
DROP POLICY IF EXISTS "Citizens can view own applications" ON public.applications;
CREATE POLICY "Citizens can view own applications" ON public.applications 
    FOR SELECT USING (auth.uid() = user_id);

-- Allow staff to view all applications (already exists but ensure it's there)
DROP POLICY IF EXISTS "Staff can view all applications" ON public.applications;
CREATE POLICY "Staff can view all applications" ON public.applications 
    FOR SELECT USING (public.is_admin_or_staff());

-- Allow staff to update applications
DROP POLICY IF EXISTS "Staff can update applications" ON public.applications;
CREATE POLICY "Staff can update applications" ON public.applications 
    FOR UPDATE USING (public.is_admin_or_staff());
