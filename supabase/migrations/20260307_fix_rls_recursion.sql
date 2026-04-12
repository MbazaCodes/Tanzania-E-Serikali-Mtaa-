-- Fix infinite recursion in RLS policies for users table
-- The issue: policies on users table query users table, causing recursion

-- Step 1: Create a security definer function to get user role without triggering RLS
-- Note: Using public schema since auth schema is managed by Supabase
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM users WHERE id = auth.uid();
$$;

-- Step 2: Create a security definer function to check if user is admin/staff
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

-- Step 3: Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Step 4: Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Staff and specialized roles can view all profiles" ON users;
DROP POLICY IF EXISTS "Staff can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON users;
DROP POLICY IF EXISTS "Admins can manage profiles" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Step 5: Create new non-recursive policies using the security definer functions

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow staff/admin to view all profiles (uses security definer function)
CREATE POLICY "Staff can view all profiles" ON users
    FOR SELECT USING (public.is_admin_or_staff());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage profiles" ON users
    FOR ALL USING (public.is_admin());

-- Step 6: Allow new user profile creation after signup (INSERT policy)
-- This is critical - without this, new signups can't create their profile
CREATE POLICY "Users can create own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 7: Fix services policies to use security definer functions
DROP POLICY IF EXISTS "Staff can view all services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Staff can view all services" ON services
    FOR SELECT USING (public.is_admin_or_staff());

CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (public.is_admin());

-- Step 8: Fix application policies
DROP POLICY IF EXISTS "Staff can view applications in their location" ON applications;
DROP POLICY IF EXISTS "Staff can view all applications" ON applications;
DROP POLICY IF EXISTS "Staff and approvers can update applications in their location" ON applications;
DROP POLICY IF EXISTS "Staff can update applications" ON applications;
CREATE POLICY "Staff can view all applications" ON applications
    FOR SELECT USING (public.is_admin_or_staff());

CREATE POLICY "Staff can update applications" ON applications
    FOR UPDATE USING (
        public.is_admin() OR 
        public.get_user_role() IN ('staff', 'approver')
    );

-- Step 9: Fix payment policies  
DROP POLICY IF EXISTS "Staff can view payments in their location" ON payments;
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
CREATE POLICY "Staff can view all payments" ON payments
    FOR SELECT USING (public.is_admin_or_staff());

-- Step 10: Fix activity_logs policies (also have recursion issue)
DROP POLICY IF EXISTS "Admins can view all logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON activity_logs;
CREATE POLICY "Admins can view all logs" ON activity_logs
    FOR SELECT USING (public.is_admin_or_staff());
CREATE POLICY "Users can view their own logs" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;