-- Fix RLS infinite recursion (500 errors)
-- The issue: is_admin_or_staff() queries users table which has RLS policies that call is_admin_or_staff()

-- Step 1: Create a helper function that bypasses RLS using auth.uid() directly with raw SQL
CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT FROM users WHERE id = auth.uid();
$$;

-- Step 2: Update is_admin_or_staff to use simple check without querying users table with RLS
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role_safe() IN ('staff', 'admin'), false);
$$;

-- Step 3: Drop all existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Staff can view users for verification" ON public.users;
DROP POLICY IF EXISTS "Staff can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- Step 4: Create simple policies on users that don't cause recursion
-- Allow users to see their own profile (simple auth.uid() check - no function call)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow staff/admin to view all users (use the safe function)
CREATE POLICY "Staff can view all users" ON public.users
    FOR SELECT USING (public.get_user_role_safe() IN ('staff', 'admin'));

-- Step 5: Fix applications policies
DROP POLICY IF EXISTS "Citizens can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Staff can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Staff can update applications" ON public.applications;
DROP POLICY IF EXISTS "Citizens can insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Citizens can update own applications" ON public.applications;

-- Simple citizen policy - no function call needed
CREATE POLICY "Citizens can view own applications" ON public.applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Citizens can insert own applications" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Citizens can update own applications" ON public.applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Staff/admin can see all applications
CREATE POLICY "Staff can view all applications" ON public.applications
    FOR SELECT USING (public.get_user_role_safe() IN ('staff', 'admin'));

CREATE POLICY "Staff can update applications" ON public.applications
    FOR UPDATE USING (public.get_user_role_safe() IN ('staff', 'admin'));

-- Step 6: Fix profile_change_requests policies
DROP POLICY IF EXISTS "Users can view own change requests" ON public.profile_change_requests;
DROP POLICY IF EXISTS "Users can insert change requests" ON public.profile_change_requests;
DROP POLICY IF EXISTS "Staff can view profile_change_requests" ON public.profile_change_requests;
DROP POLICY IF EXISTS "Staff can update profile_change_requests" ON public.profile_change_requests;

CREATE POLICY "Users can view own change requests" ON public.profile_change_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert change requests" ON public.profile_change_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view profile_change_requests" ON public.profile_change_requests
    FOR SELECT USING (public.get_user_role_safe() IN ('staff', 'admin'));

CREATE POLICY "Staff can update profile_change_requests" ON public.profile_change_requests
    FOR UPDATE USING (public.get_user_role_safe() IN ('staff', 'admin'));

-- Step 7: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_safe() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO anon;
