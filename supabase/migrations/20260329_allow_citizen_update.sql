-- Allow citizens to update their own applications (for payment status changes)
-- This adds a policy for citizens to update status and form_data after payment

-- Drop existing policy if it conflicts
DROP POLICY IF EXISTS "Citizens can update their own applications" ON applications;

-- Create policy allowing citizens to update their own applications
CREATE POLICY "Citizens can update their own applications" ON applications
    FOR UPDATE USING (
        -- Citizens can update their own applications
        user_id = auth.uid()
    )
    WITH CHECK (
        -- Citizens can only update their own applications
        user_id = auth.uid()
    );

-- Also ensure the existing staff policy still works alongside this
-- The policies work with OR logic, so if any policy allows, it succeeds
