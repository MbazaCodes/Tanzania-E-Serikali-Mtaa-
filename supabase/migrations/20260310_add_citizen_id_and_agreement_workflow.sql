-- Migration: Add unique citizen_id for agreement second party identification
-- Date: 2026-03-10
-- Format: CT + YEAR + LETTER + 5-DIGIT (e.g., CT2026A123456)

-- Add citizen_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS citizen_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_citizen_id ON users(citizen_id);

-- Create sequence for generating citizen numbers
CREATE SEQUENCE IF NOT EXISTS citizen_id_seq START WITH 000001;

-- Function to generate unique citizen_id
CREATE OR REPLACE FUNCTION generate_citizen_id()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    letter_part TEXT;
    number_part TEXT;
    new_citizen_id TEXT;
    counter INT;
BEGIN
    -- Get current year
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Get next sequence value
    counter := NEXTVAL('citizen_id_seq');
    
    -- Determine letter based on counter (A-Z, then AA-AZ, etc.)
    letter_part := CHR(65 + ((counter - 000001) / 999999) % 26);
    
    -- Format number part (5 digits)
    number_part := LPAD(((counter - 000001) % 999999 + 1)::TEXT, 5, '0');
    
    -- Combine: CT + YEAR + LETTER + NUMBER
    new_citizen_id := 'CT' || year_part || letter_part || number_part;
    
    RETURN new_citizen_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate citizen_id on user insert
CREATE OR REPLACE FUNCTION set_citizen_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.citizen_id IS NULL THEN
        NEW.citizen_id := generate_citizen_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_citizen_id ON users;
CREATE TRIGGER trigger_set_citizen_id
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_citizen_id();

-- Backfill existing users with citizen_id
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM users WHERE citizen_id IS NULL ORDER BY created_at
    LOOP
        UPDATE users 
        SET citizen_id = generate_citizen_id()
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- Add second_party_citizen_id column to applications for agreement services
ALTER TABLE applications ADD COLUMN IF NOT EXISTS second_party_citizen_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS second_party_user_id UUID REFERENCES users(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS second_party_accepted BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS second_party_accepted_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_second_party ON applications(second_party_user_id);

-- Update RLS policy to allow second party to view their applications
DROP POLICY IF EXISTS "Users can view own or second party applications" ON applications;
CREATE POLICY "Users can view own or second party applications" ON applications
    FOR SELECT USING (
        user_id = auth.uid() 
        OR buyer_id = auth.uid() 
        OR second_party_user_id = auth.uid()
    );

-- Allow second party to update their acceptance status
DROP POLICY IF EXISTS "Second party can accept applications" ON applications;
CREATE POLICY "Second party can accept applications" ON applications
    FOR UPDATE USING (
        second_party_user_id = auth.uid()
        AND status IN ('submitted', 'paid', 'pending_approval')
    )
    WITH CHECK (
        second_party_user_id = auth.uid()
    );

-- Add pending_approval status if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = 'application_status'::regtype) THEN
        ALTER TYPE application_status ADD VALUE 'pending_approval';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create notifications table for second party approval requests
CREATE TABLE IF NOT EXISTS agreement_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_citizen_id TEXT,
    notification_type TEXT DEFAULT 'agreement_approval',
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    is_actioned BOOLEAN DEFAULT false,
    action_taken TEXT, -- 'accepted' or 'rejected'
    action_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    actioned_at TIMESTAMPTZ
);

-- Enable RLS on agreement_notifications
ALTER TABLE agreement_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON agreement_notifications;
CREATE POLICY "Users can view own notifications" ON agreement_notifications
    FOR SELECT USING (recipient_id = auth.uid() OR sender_id = auth.uid());

-- Users can update their own notifications (mark as read, action)
DROP POLICY IF EXISTS "Recipients can update notifications" ON agreement_notifications;
CREATE POLICY "Recipients can update notifications" ON agreement_notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- System can insert notifications
DROP POLICY IF EXISTS "System can insert notifications" ON agreement_notifications;
CREATE POLICY "System can insert notifications" ON agreement_notifications
    FOR INSERT WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agreement_notifications_recipient ON agreement_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_agreement_notifications_application ON agreement_notifications(application_id);
