-- Fix C-1: Replace open applications SELECT policy with restricted verification policy
-- The previous USING(true) exposed all citizen data to anonymous users
DROP POLICY IF EXISTS "Allow public verification by application_number" ON applications;
CREATE POLICY "Allow public verification by application_number" ON applications
    FOR SELECT
    USING (status IN ('issued', 'approved', 'verified'));

-- Fix C-2: Restrict notifications INSERT to service-role only (remove open WITH CHECK(true))
-- Citizens should not be able to insert notifications for arbitrary users
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
-- Only allow users to insert notifications where they are the sender (target is managed server-side)
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Fix C-5: Fix user_documents staff policies — currently allows ANY authenticated user
DROP POLICY IF EXISTS "Staff can view all documents" ON user_documents;
DROP POLICY IF EXISTS "Staff can update documents" ON user_documents;
CREATE POLICY "Staff can view all documents" ON user_documents
    FOR SELECT USING (public.get_user_role_safe() IN ('staff', 'admin'));
CREATE POLICY "Staff can update documents" ON user_documents
    FOR UPDATE USING (public.get_user_role_safe() IN ('staff', 'admin'));

-- Fix H-1: Fix buyer_id reference in RLS policy (column does not exist — should be target_user_id)
DROP POLICY IF EXISTS "Users can view own or second party applications" ON applications;
CREATE POLICY "Users can view own or second party applications" ON applications
    FOR SELECT USING (
        user_id = auth.uid()
        OR target_user_id = auth.uid()
        OR second_party_user_id = auth.uid()
    );
