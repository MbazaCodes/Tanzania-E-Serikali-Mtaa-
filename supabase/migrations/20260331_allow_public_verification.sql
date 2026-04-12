-- Migration: Allow public verification of applications by application_number
-- Date: 2026-03-10
-- Purpose: Enable document verification feature to work for any user (even anonymous)

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow public verification by application_number" ON applications;

-- Create policy to allow anyone to SELECT applications when filtering by application_number
-- This is needed for the document verification feature to work
CREATE POLICY "Allow public verification by application_number" ON applications
    FOR SELECT
    USING (
        -- Allow access when querying by application_number (for verification)
        -- This enables the public verify documents feature
        true
    );

-- Note: The above policy allows SELECT on all applications.
-- If you want to restrict to only verified/issued documents, use:
-- USING (status IN ('issued', 'approved', 'verified'))

-- Alternative stricter policy (uncomment if needed):
-- DROP POLICY IF EXISTS "Allow public verification by application_number" ON applications;
-- CREATE POLICY "Allow public verification by application_number" ON applications
--     FOR SELECT
--     USING (
--         status IN ('issued', 'approved', 'verified', 'paid', 'submitted')
--     );
