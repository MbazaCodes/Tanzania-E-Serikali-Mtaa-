-- =====================================================================
-- Fix RLS policies for admin staff management and citizen approval
-- 
-- PROBLEM: Admin cannot INSERT staff profiles because the only INSERT
-- policy on users is "auth.uid() = id" (self-insert only).
-- When admin creates a staff member via signUp + INSERT, the INSERT
-- fails because auth.uid() is the admin's ID, not the new staff's ID.
-- 
-- ALSO: Admin needs DELETE access for staff removal.
-- =====================================================================

-- Admin can insert any user profile (needed for staff creation)
DROP POLICY IF EXISTS "Admin can insert any user" ON users;
CREATE POLICY "Admin can insert any user" ON users
    FOR INSERT WITH CHECK (public.is_admin());

-- Admin can delete user profiles (needed for staff removal)
DROP POLICY IF EXISTS "Admin can delete users" ON users;
CREATE POLICY "Admin can delete users" ON users
    FOR DELETE USING (public.is_admin());

-- Ensure the applications table allows staff/admin to update status (for approvals)
DROP POLICY IF EXISTS "Staff can update applications" ON applications;
CREATE POLICY "Staff can update applications" ON applications
    FOR UPDATE USING (public.is_admin_or_staff());

-- Ensure staff can insert notifications (for approval/rejection messages)
DROP POLICY IF EXISTS "Staff can insert notifications" ON notifications;
CREATE POLICY "Staff can insert notifications" ON notifications
    FOR INSERT WITH CHECK (public.is_admin_or_staff());

-- Ensure staff can view all applications (for review/approval)
DROP POLICY IF EXISTS "Staff can view all applications" ON applications;
CREATE POLICY "Staff can view all applications" ON applications
    FOR SELECT USING (public.is_admin_or_staff());
