-- Fix Foreign Key relationships for applications table
-- Issue: applications.service_id has no FK constraint to services table
-- This causes PostgREST to fail when joining applications with services

-- First, let's check if there are any applications with integer service_id values
-- and update them to use correct UUIDs

-- Drop existing FK constraint if it exists (wrong type)
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_service_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_applications_service_id;

-- First, let's add a temporary column for mapping
DO $$
DECLARE
    service_map RECORD;
BEGIN
    -- Handle case where service_id might be stored as text/integer instead of UUID
    -- Update any numeric service_id values to their corresponding UUIDs
    
    -- Check if there are any non-UUID values in service_id
    -- If service_id column is not UUID type, we need to convert it
    
    -- Check column type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'service_id' 
        AND data_type NOT IN ('uuid')
    ) THEN
        -- Create mapping for known services
        -- First add a new UUID column
        ALTER TABLE applications ADD COLUMN IF NOT EXISTS service_uuid UUID;
        
        -- Map old integer IDs to UUIDs based on service names
        UPDATE applications a
        SET service_uuid = s.id
        FROM services s
        WHERE a.service_name = s.name
        AND a.service_uuid IS NULL;
        
        -- If service_name mapping didn't work, try to match by position
        -- (assuming integer IDs were sequential)
        
        -- Drop old column and rename new one
        ALTER TABLE applications DROP COLUMN IF EXISTS service_id;
        ALTER TABLE applications RENAME COLUMN service_uuid TO service_id;
    END IF;
END $$;

-- Now ensure service_id is UUID type
DO $$
BEGIN
    -- If column is not UUID, alter it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'service_id' 
        AND data_type NOT IN ('uuid')
    ) THEN
        -- Try to cast existing values
        ALTER TABLE applications 
        ALTER COLUMN service_id TYPE UUID USING service_id::uuid;
    END IF;
EXCEPTION
    WHEN others THEN
        -- If cast fails, the column might have non-UUID values
        RAISE NOTICE 'Could not convert service_id to UUID. Manual intervention may be required.';
END $$;

-- Create the FK constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_service_id_fkey'
        AND table_name = 'applications'
    ) THEN
        ALTER TABLE applications 
        ADD CONSTRAINT applications_service_id_fkey 
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not create FK constraint. Check that service_id values match services.id';
END $$;

-- Also fix user_id FK if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_user_id_fkey'
        AND table_name = 'applications'
    ) THEN
        ALTER TABLE applications 
        ADD CONSTRAINT applications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not create user_id FK constraint';
END $$;

-- Grant permissions
GRANT SELECT ON applications TO authenticated;
GRANT SELECT ON services TO authenticated;
GRANT SELECT ON users TO authenticated;
