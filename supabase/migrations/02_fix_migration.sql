-- =====================================================
-- FILE: 02_fix_migration.sql
-- E-Mtaa Database Fixes and Cleanup
-- Purpose: Resolves inconsistencies from migrations
-- Run AFTER: 01_final_schema.sql
-- Date: 2026-04-11
-- =====================================================

-- =====================================================
-- ISSUE 1: Remove duplicate/secondary role values
-- Problem: Some users have 'approver' or 'viewer' roles 
--          which aren't in the user_role enum
-- Fix: Migrate them to 'staff' or 'admin'
-- =====================================================

DO $$
BEGIN
    -- First, ensure the role column uses the correct type
    -- If column is TEXT, convert it to use the enum
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role' 
        AND data_type = 'text'
    ) THEN
        -- Migrate text values to valid enum values
        UPDATE users SET role = 'staff' WHERE role IN ('approver', 'viewer');
        UPDATE users SET role = 'citizen' WHERE role NOT IN ('citizen', 'staff', 'admin');
        
        -- Then alter column to use enum type
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
    END IF;
END $$;

-- =====================================================
-- ISSUE 2: Fix missing updated_at column on users
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- ISSUE 3: Standardize second party naming
-- Problem: Inconsistent naming between buyer_id, second_party_user_id
-- Fix: Ensure both exist and create view for compatibility
-- =====================================================

DO $$
BEGIN
    -- Add buyer_id if missing (for backward compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'applications' AND column_name = 'buyer_id') THEN
        ALTER TABLE applications ADD COLUMN buyer_id UUID REFERENCES users(id);
    END IF;
    
    -- Sync buyer_id with second_party_user_id where possible
    UPDATE applications SET buyer_id = second_party_user_id 
    WHERE buyer_id IS NULL AND second_party_user_id IS NOT NULL;
    
    UPDATE applications SET second_party_user_id = buyer_id 
    WHERE second_party_user_id IS NULL AND buyer_id IS NOT NULL;
END $$;

-- =====================================================
-- ISSUE 4: Add missing foreign key constraints
-- =====================================================

-- Add assigned_office_id FK (was missing in some migrations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_assigned_office_id_fkey'
    ) THEN
        ALTER TABLE applications 
        ADD CONSTRAINT applications_assigned_office_id_fkey 
        FOREIGN KEY (assigned_office_id) REFERENCES offices(id) ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create FK for assigned_office_id';
END $$;

-- Add location_id FK
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_location_id_fkey'
    ) THEN
        ALTER TABLE applications 
        ADD CONSTRAINT applications_location_id_fkey 
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create FK for location_id';
END $$;

-- =====================================================
-- ISSUE 5: Fix service_id type and FK
-- Problem: service_id changed from UUID to TEXT in some migrations
-- Fix: Ensure it's UUID with proper FK
-- =====================================================

DO $$
BEGIN
    -- Check if service_id is TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' AND column_name = 'service_id' 
        AND data_type = 'text'
    ) THEN
        -- Create mapping table for text IDs to UUIDs
        CREATE TEMP TABLE service_id_map AS
        SELECT id::text as old_id, id as new_id FROM services;
        
        -- Add temporary UUID column
        ALTER TABLE applications ADD COLUMN service_uuid UUID;
        
        -- Update using service_name mapping
        UPDATE applications a
        SET service_uuid = s.id
        FROM services s
        WHERE a.service_name = s.name;
        
        -- For remaining, try direct cast
        UPDATE applications 
        SET service_uuid = service_id::uuid 
        WHERE service_uuid IS NULL AND service_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
        
        -- Drop old column and rename
        ALTER TABLE applications DROP COLUMN service_id;
        ALTER TABLE applications RENAME COLUMN service_uuid TO service_id;
    END IF;
    
    -- Add FK constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_service_id_fkey'
    ) THEN
        ALTER TABLE applications 
        ADD CONSTRAINT applications_service_id_fkey 
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not convert service_id to UUID';
END $$;

-- =====================================================
-- ISSUE 6: Fix duplicate service definitions
-- Problem: Makubaliano ya Mauziano defined in multiple migrations
-- Fix: Ensure only one version exists
-- =====================================================

DO $$
BEGIN
    -- Remove duplicate service categories
    DELETE FROM service_categories WHERE name IN (
        SELECT name FROM service_categories GROUP BY name HAVING COUNT(*) > 1
    ) USING (SELECT MIN(created_at) as keep_time FROM service_categories GROUP BY name) 
    WHERE created_at > keep_time;
    
    -- Ensure services have unique names
    DELETE FROM services WHERE id IN (
        SELECT id FROM (
            SELECT id, name, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
            FROM services
        ) duplicates WHERE rn > 1
    );
    
    -- Add unique constraint if missing
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_name_key'
    ) THEN
        ALTER TABLE services ADD CONSTRAINT services_name_key UNIQUE (name);
    END IF;
END $$;

-- =====================================================
-- ISSUE 7: Fix RLS recursion in business_registrations
-- =====================================================

DO $$
BEGIN
    -- Drop problematic policies
    DROP POLICY IF EXISTS "Staff can view all registrations" ON business_registrations;
    DROP POLICY IF EXISTS "Staff can update registrations" ON business_registrations;
    DROP POLICY IF EXISTS "Public can view approved registrations" ON business_registrations;
    
    -- Recreate with safe functions
    CREATE POLICY "Staff can view all registrations"
        ON business_registrations FOR SELECT
        USING (public.is_admin_or_staff());
    
    CREATE POLICY "Staff can update registrations"
        ON business_registrations FOR UPDATE
        USING (public.is_admin_or_staff());
    
    CREATE POLICY "Public can view approved registrations"
        ON business_registrations FOR SELECT
        USING (status = 'approved');
END $$;

-- =====================================================
-- ISSUE 8: Add missing indexes for performance
-- =====================================================

-- Applications composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_service_status ON applications(service_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_created_status ON applications(created_at, status);

-- Users search indexes
CREATE INDEX IF NOT EXISTS idx_users_name_search ON users(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_users_location_search ON users(region, district, ward);

-- Payments date index
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- =====================================================
-- ISSUE 9: Add missing CHECK constraints
-- =====================================================

-- Ensure phone format validation (basic)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_phone_check 
        CHECK (phone IS NULL OR phone ~ '^[+]?[0-9][0-9\s\-]{7,19}$');
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Ensure email format validation (basic)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_email_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_check 
        CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- ISSUE 10: Fix sequence for citizen_id generation
-- =====================================================

DO $$
DECLARE
    max_id INTEGER;
BEGIN
    -- Get max existing citizen_id number
    SELECT COALESCE(MAX(SUBSTRING(citizen_id FROM 'CT[0-9]{4}[A-Z]([0-9]{5})$')::INTEGER), 0)
    INTO max_id FROM users WHERE citizen_id IS NOT NULL;
    
    -- Set sequence to max value
    PERFORM setval('citizen_id_seq', max_id + 1);
END $$;

-- =====================================================
-- ISSUE 11: Application status transition logging
-- NOTE: Strict transition VALIDATION was intentionally removed.
-- The app allows staff to skip steps (e.g. submitted -> approved directly)
-- and uses pending_review / returned which a strict trigger would block.
-- Status LOGGING (Issue 12 below) is kept — it records history without blocking.
-- =====================================================

-- Keep function for reference but do NOT attach it as a blocking trigger
CREATE OR REPLACE FUNCTION validate_application_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Soft log only — does not raise exceptions
    -- Any transition involving 'issued' is final and should not be reversed
    IF OLD.status = 'issued' AND NEW.status != 'issued' THEN
        RAISE WARNING 'Attempting to change status of issued application % from issued to %', NEW.id, NEW.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NOT attached as a trigger (intentionally) — see note above
DROP TRIGGER IF EXISTS tr_validate_status_transition ON applications;

-- =====================================================
-- ISSUE 12: Add audit logging for status changes
-- =====================================================

CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    old_status application_status,
    new_status application_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_status_history_app ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON application_status_history(changed_at);

ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

-- Policy for status history
CREATE POLICY "Users can view own app status history" ON application_status_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())
    );

CREATE POLICY "Staff can view all status history" ON application_status_history
    FOR SELECT USING (public.is_admin_or_staff());

-- Trigger to automatically log status changes
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (application_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_log_status_change ON applications;
CREATE TRIGGER tr_log_status_change
    AFTER UPDATE OF status ON applications
    FOR EACH ROW
    EXECUTE FUNCTION log_application_status_change();

-- =====================================================
-- ISSUE 13: Fix get_user_profile function (final version)
-- =====================================================

DROP FUNCTION IF EXISTS public.get_user_profile(UUID);

CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    full_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    nationality TEXT,
    nida_number TEXT,
    id_type TEXT,
    id_number TEXT,
    phone TEXT,
    email TEXT,
    photo_url TEXT,
    role TEXT,
    is_verified BOOLEAN,
    citizen_id TEXT,
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        u.id,
        u.first_name,
        u.middle_name,
        u.last_name,
        CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) as full_name,
        u.gender,
        u.date_of_birth,
        u.nationality,
        u.nida_number,
        u.id_type,
        u.id_number,
        u.phone,
        u.email,
        u.photo_url,
        u.role::TEXT,
        u.is_verified,
        u.citizen_id,
        u.region,
        u.district,
        u.ward,
        u.street,
        u.created_at
    FROM users u
    WHERE u.id = user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated, anon;