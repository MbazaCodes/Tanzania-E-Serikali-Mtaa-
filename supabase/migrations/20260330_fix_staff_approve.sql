-- Fix staff application approval permissions
-- This migration ensures staff can update applications status

-- Drop existing policies and recreate with simpler logic
DROP POLICY IF EXISTS "Staff can update applications" ON public.applications;

-- Create a more permissive policy for staff updates
CREATE POLICY "Staff can update applications" ON public.applications
    FOR UPDATE 
    USING (
        -- Staff or admin can update any application
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    )
    WITH CHECK (
        -- Allow any update by staff/admin
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

-- Also ensure staff can view all applications
DROP POLICY IF EXISTS "Staff can view all applications" ON public.applications;
CREATE POLICY "Staff can view all applications" ON public.applications
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

-- Grant full table access to authenticated users (RLS still applies)
GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;

-- Ensure the status can be updated
COMMENT ON COLUMN public.applications.status IS 'Application status: submitted, pending_payment, paid, verified, approved, issued, rejected, returned';
