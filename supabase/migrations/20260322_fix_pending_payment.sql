-- Fix pending_payment status and staff permissions

-- 1. Ensure pending_payment status exists in enum
DO $$
BEGIN
    BEGIN
        ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'pending_payment';
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END
$$;

-- 2. Update check constraint to include pending_payment  
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check 
    CHECK (status IS NULL OR status IN ('submitted', 'paid', 'verified', 'approved', 'issued', 'rejected', 'pending_review', 'returned', 'pending_payment'));

-- 3. Ensure staff can update applications
DROP POLICY IF EXISTS "Staff can update applications" ON public.applications;
CREATE POLICY "Staff can update applications" ON public.applications 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin', 'approver')
        )
    );

-- 4. Ensure staff can view profile_change_requests
DROP POLICY IF EXISTS "Staff can view profile_change_requests" ON public.profile_change_requests;
CREATE POLICY "Staff can view profile_change_requests" ON public.profile_change_requests 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin', 'approver')
        )
    );

-- 5. Ensure staff can update profile_change_requests
DROP POLICY IF EXISTS "Staff can update profile_change_requests" ON public.profile_change_requests;
CREATE POLICY "Staff can update profile_change_requests" ON public.profile_change_requests 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin', 'approver')
        )
    );

-- 6. Ensure staff can view users for verification purposes
DROP POLICY IF EXISTS "Staff can view users for verification" ON public.users;
CREATE POLICY "Staff can view users for verification" ON public.users 
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin', 'approver', 'viewer')
        )
    );

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;
GRANT SELECT, UPDATE ON public.profile_change_requests TO authenticated;
GRANT SELECT ON public.services TO authenticated;
GRANT SELECT ON public.users TO authenticated;
