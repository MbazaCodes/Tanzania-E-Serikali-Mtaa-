-- Business Registrations Table for Sellers, Landlords, Brokers
-- Migration: 20260330_add_business_registrations.sql

-- Create enum for business types
DO $$ BEGIN
    CREATE TYPE business_type AS ENUM ('seller', 'landlord', 'broker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for registration status
DO $$ BEGIN
    CREATE TYPE business_registration_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create business_registrations table
CREATE TABLE IF NOT EXISTS business_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type business_type NOT NULL,
    business_id VARCHAR(20) UNIQUE, -- Generated upon approval (e.g., SL2026A00001, LL2026A00001, BR2026A00001)
    
    -- Business details
    business_name VARCHAR(255),
    description TEXT,
    experience_years INTEGER DEFAULT 0,
    specialization VARCHAR(255), -- e.g., "Nyumba za Kuishi", "Ardhi", "Magari", etc.
    
    -- Location
    region VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    street VARCHAR(255),
    
    -- Contact
    phone VARCHAR(20),
    alt_phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Documents
    id_document_url TEXT, -- NIDA or other ID
    proof_document_url TEXT, -- Business license, TIN, etc.
    photo_url TEXT, -- Profile photo
    
    -- Status
    status business_registration_status DEFAULT 'pending',
    rejection_reason TEXT,
    
    -- Approval tracking
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_registrations_user_id ON business_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_business_registrations_business_type ON business_registrations(business_type);
CREATE INDEX IF NOT EXISTS idx_business_registrations_status ON business_registrations(status);
CREATE INDEX IF NOT EXISTS idx_business_registrations_business_id ON business_registrations(business_id);

-- Add business_id column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS seller_id VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS landlord_id VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_id VARCHAR(20);

-- Function to generate business ID
CREATE OR REPLACE FUNCTION generate_business_id(b_type business_type)
RETURNS VARCHAR(20) AS $$
DECLARE
    prefix VARCHAR(2);
    year_part VARCHAR(4);
    letter CHAR(1);
    seq_num INTEGER;
    new_id VARCHAR(20);
BEGIN
    -- Set prefix based on business type
    CASE b_type
        WHEN 'seller' THEN prefix := 'SL';
        WHEN 'landlord' THEN prefix := 'LL';
        WHEN 'broker' THEN prefix := 'BR';
    END CASE;
    
    -- Get current year
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Get random letter A-Z
    letter := CHR(65 + FLOOR(RANDOM() * 26)::INTEGER);
    
    -- Get next sequence number for this type
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN business_id ~ ('^' || prefix || '[0-9]{4}[A-Z][0-9]{5}$')
                THEN SUBSTRING(business_id FROM 8 FOR 5)::INTEGER
                ELSE 0
            END
        ), 0
    ) + 1 INTO seq_num
    FROM business_registrations
    WHERE business_type = b_type AND business_id IS NOT NULL;
    
    -- Construct the ID
    new_id := prefix || year_part || letter || LPAD(seq_num::TEXT, 5, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve business registration
CREATE OR REPLACE FUNCTION approve_business_registration(
    registration_id UUID,
    approver_id UUID
)
RETURNS VARCHAR(20) AS $$
DECLARE
    reg_record RECORD;
    new_business_id VARCHAR(20);
BEGIN
    -- Get registration record
    SELECT * INTO reg_record FROM business_registrations WHERE id = registration_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration not found';
    END IF;
    
    IF reg_record.status = 'approved' THEN
        RETURN reg_record.business_id;
    END IF;
    
    -- Generate business ID
    new_business_id := generate_business_id(reg_record.business_type);
    
    -- Update registration
    UPDATE business_registrations
    SET 
        status = 'approved',
        business_id = new_business_id,
        reviewed_by = approver_id,
        reviewed_at = NOW(),
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = registration_id;
    
    -- Update user's profile with business ID
    CASE reg_record.business_type
        WHEN 'seller' THEN
            UPDATE users SET seller_id = new_business_id WHERE id = reg_record.user_id;
        WHEN 'landlord' THEN
            UPDATE users SET landlord_id = new_business_id WHERE id = reg_record.user_id;
        WHEN 'broker' THEN
            UPDATE users SET broker_id = new_business_id WHERE id = reg_record.user_id;
    END CASE;
    
    RETURN new_business_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE business_registrations ENABLE ROW LEVEL SECURITY;

-- Citizens can view their own registrations
CREATE POLICY "Users can view own registrations"
    ON business_registrations FOR SELECT
    USING (auth.uid() = user_id);

-- Citizens can insert their own registrations
CREATE POLICY "Users can insert own registrations"
    ON business_registrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Citizens can update their pending registrations
CREATE POLICY "Users can update own pending registrations"
    ON business_registrations FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Staff and admin can view all registrations
CREATE POLICY "Staff can view all registrations"
    ON business_registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Staff and admin can update registrations (for approval/rejection)
CREATE POLICY "Staff can update registrations"
    ON business_registrations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Public can view approved registrations (for verification)
CREATE POLICY "Public can view approved registrations"
    ON business_registrations FOR SELECT
    USING (status = 'approved');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON business_registrations TO authenticated;
GRANT SELECT ON business_registrations TO anon;
