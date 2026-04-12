-- Simplify roles to just staff and admin (remove viewer/approver)

-- Update is_admin_or_staff function to only check for staff and admin
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('staff', 'admin')
  );
$$;

-- Update role constraint to only allow citizen, staff, admin
-- First, migrate any viewer/approver users to staff
UPDATE public.users SET role = 'staff' WHERE role IN ('viewer', 'approver');

-- Update RLS policies for applications
DROP POLICY IF EXISTS "Staff can update applications" ON public.applications;
CREATE POLICY "Staff can update applications" ON public.applications 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

-- Update RLS policies for profile_change_requests
DROP POLICY IF EXISTS "Staff can view profile_change_requests" ON public.profile_change_requests;
CREATE POLICY "Staff can view profile_change_requests" ON public.profile_change_requests 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

DROP POLICY IF EXISTS "Staff can update profile_change_requests" ON public.profile_change_requests;
CREATE POLICY "Staff can update profile_change_requests" ON public.profile_change_requests 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

-- Update RLS policies for users
DROP POLICY IF EXISTS "Staff can view users for verification" ON public.users;
CREATE POLICY "Staff can view users for verification" ON public.users 
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO anon;
