-- Complete RLS fix - drops ALL existing policies on users table first
-- This ensures no recursive policies remain

-- Step 1: Drop ALL policies on users table dynamically
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Step 2: Create SECURITY DEFINER functions (idempotent)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM users WHERE id = auth.uid();
$$;

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

-- Step 3: Create safe non-recursive policies on users
-- Policy for users to view their own profile (no recursion - uses auth.uid())
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy for staff/admin to view all profiles (uses SECURITY DEFINER function)
CREATE POLICY "users_select_staff" ON users
    FOR SELECT USING (public.is_admin_or_staff());

-- Policy for users to update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy for admins to manage all profiles
CREATE POLICY "users_all_admin" ON users
    FOR ALL USING (public.is_admin());

-- Policy for new user profile creation after signup
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_staff() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
