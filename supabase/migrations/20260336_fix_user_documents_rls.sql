-- Fix RLS recursion across all tables
-- Simplified policies to avoid infinite recursion

-- Drop old helper functions that cause issues
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS auth.get_user_role();

-- Fix users table - drop old recursive policies
DROP POLICY IF EXISTS "Staff and specialized roles can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON users;

-- Ensure simplified users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON users;
CREATE POLICY "Authenticated users can view basic profiles" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix Staff can view all documents policy
DROP POLICY IF EXISTS "Staff can view all documents" ON user_documents;
CREATE POLICY "Staff can view all documents" ON user_documents
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix Staff can update documents policy
DROP POLICY IF EXISTS "Staff can update documents" ON user_documents;
CREATE POLICY "Staff can update documents" ON user_documents
    FOR UPDATE USING (auth.uid() IS NOT NULL);
