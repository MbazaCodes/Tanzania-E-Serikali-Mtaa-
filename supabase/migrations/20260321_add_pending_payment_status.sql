-- Add pending_payment status to application_status enum
-- This status is set when staff/admin approves an application, allowing citizen to pay

-- First, check if the status already exists, if not add it
DO $$
BEGIN
    -- Try to add the new value to the enum
    BEGIN
        ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'pending_payment';
    EXCEPTION WHEN duplicate_object THEN
        -- Value already exists, ignore
        NULL;
    END;
END
$$;

-- Also update the check constraint on applications table if it exists
-- First drop the existing constraint if it exists
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

-- Add updated constraint with pending_payment
ALTER TABLE applications ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('submitted', 'paid', 'verified', 'approved', 'issued', 'rejected', 'pending_review', 'returned', 'pending_payment'));
