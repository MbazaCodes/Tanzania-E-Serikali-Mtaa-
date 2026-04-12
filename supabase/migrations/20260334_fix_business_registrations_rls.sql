-- Fix RLS policies for business_registrations to avoid recursion
-- Migration: 20260333_fix_business_registrations_rls.sql

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Staff can view all registrations" ON business_registrations;
DROP POLICY IF EXISTS "Staff can update registrations" ON business_registrations;

-- Recreate staff policies using get_user_role_safe() to avoid recursion
CREATE POLICY "Staff can view all registrations"
    ON business_registrations FOR SELECT
    USING (public.get_user_role_safe() IN ('staff', 'admin'));

CREATE POLICY "Staff can update registrations"
    ON business_registrations FOR UPDATE
    USING (public.get_user_role_safe() IN ('staff', 'admin'));

-- Also fix the public policy if needed
DROP POLICY IF EXISTS "Public can view approved registrations" ON business_registrations;
CREATE POLICY "Public can view approved registrations"
    ON business_registrations FOR SELECT
    USING (status = 'approved');
