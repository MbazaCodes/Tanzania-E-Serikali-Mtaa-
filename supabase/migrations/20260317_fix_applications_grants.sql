-- Grant permissions on applications table

-- Ensure authenticated users can SELECT, INSERT, UPDATE on applications
GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;
GRANT SELECT ON public.applications TO anon;

-- Fix INSERT policy (ensure it works)
DROP POLICY IF EXISTS "Citizens can insert own applications" ON public.applications;
CREATE POLICY "Citizens can insert own applications" ON public.applications 
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Ensure users can update their own applications (for status changes during payment)
DROP POLICY IF EXISTS "Citizens can update own applications" ON public.applications;
CREATE POLICY "Citizens can update own applications" ON public.applications 
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Ensure USAGE on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
