-- Client Relationships Table
-- Tracks relationships between landlords/sellers and their tenants/customers
-- Migration: 20260331_add_client_relationships.sql

-- Create enum for relationship types
DO $$ BEGIN
    CREATE TYPE client_relationship_type AS ENUM ('tenant', 'buyer', 'renter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for relationship status
DO $$ BEGIN
    CREATE TYPE client_relationship_status AS ENUM ('active', 'inactive', 'pending', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create client_relationships table
CREATE TABLE IF NOT EXISTS client_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- The business owner (landlord/seller)
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_business_id VARCHAR(20), -- e.g., LL2026A00001, SL2026A00001
    owner_business_type VARCHAR(20), -- 'landlord', 'seller', 'broker'
    
    -- The client (tenant/buyer)
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_citizen_id VARCHAR(20), -- CT ID of the client
    
    -- Relationship details
    relationship_type client_relationship_type NOT NULL,
    
    -- Property/Item details
    property_type VARCHAR(100), -- 'nyumba', 'chumba', 'duka', 'ardhi', 'gari', etc.
    property_description TEXT,
    property_address TEXT,
    property_region VARCHAR(100),
    property_district VARCHAR(100),
    property_ward VARCHAR(100),
    
    -- Agreement details
    agreement_id UUID, -- Reference to agreement if exists
    agreement_number VARCHAR(50),
    
    -- Financial details
    monthly_rent DECIMAL(15, 2), -- For tenants
    total_price DECIMAL(15, 2), -- For buyers
    deposit_amount DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'TZS',
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for indefinite/ongoing
    last_payment_date DATE,
    next_payment_due DATE,
    
    -- Status
    status client_relationship_status DEFAULT 'active',
    status_reason TEXT,
    
    -- Contact info (cached for quick access)
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    client_email VARCHAR(255),
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_relationships_owner_id ON client_relationships(owner_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_client_id ON client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_status ON client_relationships(status);
CREATE INDEX IF NOT EXISTS idx_client_relationships_owner_business_id ON client_relationships(owner_business_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_relationship_type ON client_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_client_relationships_start_date ON client_relationships(start_date);
CREATE INDEX IF NOT EXISTS idx_client_relationships_end_date ON client_relationships(end_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_relationship_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_client_relationships_updated_at ON client_relationships;
CREATE TRIGGER trigger_client_relationships_updated_at
    BEFORE UPDATE ON client_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_client_relationship_timestamp();

-- RLS Policies
ALTER TABLE client_relationships ENABLE ROW LEVEL SECURITY;

-- Owners can view their own client relationships
CREATE POLICY "Owners can view own relationships"
    ON client_relationships FOR SELECT
    USING (auth.uid() = owner_id);

-- Clients can view relationships where they are the client
CREATE POLICY "Clients can view own relationships"
    ON client_relationships FOR SELECT
    USING (auth.uid() = client_id);

-- Owners can insert new relationships
CREATE POLICY "Owners can insert relationships"
    ON client_relationships FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Owners can update their relationships
CREATE POLICY "Owners can update own relationships"
    ON client_relationships FOR UPDATE
    USING (auth.uid() = owner_id);

-- Owners can delete their relationships
CREATE POLICY "Owners can delete own relationships"
    ON client_relationships FOR DELETE
    USING (auth.uid() = owner_id);

-- Staff and admin can view all relationships
CREATE POLICY "Staff can view all relationships"
    ON client_relationships FOR SELECT
    USING (public.get_user_role_safe() IN ('staff', 'admin'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON client_relationships TO authenticated;
