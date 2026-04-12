-- Fix: Allow staff to update users table (for citizen verification)

-- Add policy for staff/admin to update users (for verification)
DROP POLICY IF EXISTS "Staff can update users" ON public.users;
CREATE POLICY "Staff can update users" ON public.users
    FOR UPDATE USING (public.get_user_role_safe() IN ('staff', 'admin'));

-- Also ensure staff can delete users if needed
DROP POLICY IF EXISTS "Admin can delete users" ON public.users;
CREATE POLICY "Admin can delete users" ON public.users
    FOR DELETE USING (public.get_user_role_safe() = 'admin');
