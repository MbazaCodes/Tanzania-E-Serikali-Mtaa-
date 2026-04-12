-- Fix RLS policies to ensure admin can view all data

-- First, let's ensure the is_admin_or_staff function includes admin
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
    AND role IN ('staff', 'admin', 'approver', 'viewer')
  );
$$;

-- Ensure all policies on applications allow admin/staff to see data
DROP POLICY IF EXISTS "Admin can view all applications" ON public.applications;
CREATE POLICY "Admin can view all applications" ON public.applications 
    FOR SELECT USING (public.is_admin_or_staff() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all applications" ON public.applications;

-- Add policy for admin to view all users
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
CREATE POLICY "Admin can view all users" ON public.users
    FOR SELECT USING (public.is_admin_or_staff() OR auth.uid() = id);

-- Add policy for admin to view all payments (payments linked via application_id)
DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
CREATE POLICY "Admin can view all payments" ON public.payments
    FOR SELECT USING (public.is_admin_or_staff());

-- Add policy for anyone to view services (public data)
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Anyone can view services" ON public.services
    FOR SELECT USING (true);

-- Add policy for anyone to view service_categories (public data)
DROP POLICY IF EXISTS "Anyone can view service_categories" ON public.service_categories;
CREATE POLICY "Anyone can view service_categories" ON public.service_categories
    FOR SELECT USING (true);

-- Add policy for anyone to view locations (public data)
DROP POLICY IF EXISTS "Anyone can view locations" ON public.locations;
CREATE POLICY "Anyone can view locations" ON public.locations
    FOR SELECT USING (true);

-- Add policy for admin to view sessions
DROP POLICY IF EXISTS "Admin can view all sessions" ON public.sessions;
CREATE POLICY "Admin can view all sessions" ON public.sessions
    FOR SELECT USING (public.is_admin_or_staff() OR auth.uid() = user_id);

-- Add policy for admin to view activity_logs
DROP POLICY IF EXISTS "Admin can view all activity_logs" ON public.activity_logs;
CREATE POLICY "Admin can view all activity_logs" ON public.activity_logs
    FOR SELECT USING (public.is_admin_or_staff());

-- Grant execute permissions again to be safe
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon;
