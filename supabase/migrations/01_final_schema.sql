-- =====================================================
-- FILE: 01_final_schema.sql
-- E-Mtaa Consolidated Database Schema
-- Purpose: Clean, production-ready schema combining all migrations
-- Date: 2026-04-11
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CUSTOM TYPES (Consolidated)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'staff', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'submitted', 'pending_review', 'pending_payment', 'paid',
        'verified', 'approved', 'issued', 'returned', 'rejected', 'refunded'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE business_type AS ENUM ('seller', 'landlord', 'broker');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE business_registration_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE client_relationship_type AS ENUM ('tenant', 'buyer', 'renter');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE client_relationship_status AS ENUM ('active', 'inactive', 'pending', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 2. CORE TABLES
-- =====================================================

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    gender TEXT,
    sex TEXT,
    date_of_birth DATE,
    place_of_birth TEXT,
    marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    occupation TEXT,
    education_level TEXT CHECK (education_level IN ('none', 'primary', 'secondary', 'diploma', 'degree', 'masters', 'phd')),
    
    -- Nationality & Identity
    nationality TEXT DEFAULT 'Tanzanian',
    country_of_citizenship TEXT DEFAULT 'Tanzania',
    nida_number TEXT UNIQUE,
    id_type TEXT,
    id_number TEXT,
    passport_number TEXT,
    voter_id_number TEXT,
    driving_license_number TEXT,
    
    -- Contact Information
    phone TEXT,
    alternative_phone TEXT,
    email TEXT UNIQUE NOT NULL,
    email_address TEXT,
    alternative_email TEXT,
    photo_url TEXT,
    
    -- Role & Status
    role user_role DEFAULT 'citizen',
    is_verified BOOLEAN DEFAULT FALSE,
    is_diaspora BOOLEAN DEFAULT FALSE,
    country_of_residence TEXT,
    city_of_residence TEXT,
    diaspora_region TEXT,
    diaspora_district TEXT,
    diaspora_ward TEXT,
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    
    -- Location (Residential)
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    house_number TEXT,
    postal_code TEXT,
    landmark TEXT,
    
    -- Birth Location
    birth_region TEXT,
    birth_district TEXT,
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    
    -- Staff/Work Information
    office_id UUID,
    assigned_region TEXT,
    assigned_district TEXT,
    employee_id TEXT,
    department TEXT,
    position TEXT,
    employment_date DATE,
    
    -- Business IDs (for registered sellers/landlords/brokers)
    citizen_id TEXT UNIQUE,
    seller_id TEXT,
    landlord_id TEXT,
    broker_id TEXT,
    
    -- Additional Information
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    disability_status TEXT CHECK (disability_status IN ('none', 'physical', 'visual', 'hearing', 'speech', 'multiple')),
    religious_affiliation TEXT,
    tribe TEXT,
    
    -- Local Government Officials (for staff)
    mtaa_executive_officer TEXT,
    ward_councillor TEXT,
    ward_chairperson TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    name_en TEXT,
    description TEXT,
    form_schema JSONB NOT NULL,
    diaspora_form_schema JSONB,
    document_template JSONB,
    fee DECIMAL(12,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table (hierarchical)
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level TEXT CHECK (level IN ('region', 'district', 'ward', 'street')) NOT NULL,
    parent_id UUID REFERENCES public.locations(id),
    code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offices table
CREATE TABLE IF NOT EXISTS public.offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service categories
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_sw TEXT,
    description TEXT,
    icon TEXT,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. APPLICATIONS & WORKFLOW TABLES
-- =====================================================

-- Applications table (core)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT,
    form_data JSONB NOT NULL,
    status application_status DEFAULT 'submitted',
    application_number TEXT UNIQUE,
    
    -- Location data (denormalized for performance)
    region TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    location_id UUID REFERENCES public.locations(id),
    
    -- Assignment tracking
    assigned_staff_id UUID REFERENCES public.users(id),
    assigned_office_id UUID,
    
    -- Agreement workflow (for Makubaliano/PANGISHA)
    second_party_user_id UUID REFERENCES public.users(id),
    second_party_citizen_id TEXT,
    second_party_accepted BOOLEAN DEFAULT FALSE,
    second_party_accepted_at TIMESTAMPTZ,
    target_user_id UUID REFERENCES public.users(id),
    target_user_nida TEXT,
    target_user_role TEXT,
    agreement_status TEXT DEFAULT 'pending' CHECK (agreement_status IN ('pending', 'approved', 'rejected', 'expired')),
    approved_by_target UUID REFERENCES public.users(id),
    approved_by_target_at TIMESTAMPTZ,
    target_rejection_reason TEXT,
    confirmation_data JSONB,
    is_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Payment data
    payment_data JSONB,
    
    -- Staff action tracking
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES public.users(id),
    rejected_at TIMESTAMPTZ,
    returned_by UUID REFERENCES public.users(id),
    returned_at TIMESTAMPTZ,
    issued_by UUID REFERENCES public.users(id),
    issued_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    
    -- Feedback
    feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'TZS',
    payment_method TEXT,
    transaction_id TEXT UNIQUE,
    receipt_number TEXT UNIQUE,
    breakdown JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Documents table
CREATE TABLE IF NOT EXISTS public.generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) NOT NULL,
    document_url TEXT NOT NULL,
    qr_code_url TEXT,
    certificate_id TEXT UNIQUE,
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. BUSINESS & CLIENT RELATIONSHIPS
-- =====================================================

-- Business registrations (for sellers, landlords, brokers)
CREATE TABLE IF NOT EXISTS public.business_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type business_type NOT NULL,
    business_id VARCHAR(20) UNIQUE,
    
    -- Business details
    business_name VARCHAR(255),
    description TEXT,
    experience_years INTEGER DEFAULT 0,
    specialization VARCHAR(255),
    
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
    id_document_url TEXT,
    proof_document_url TEXT,
    photo_url TEXT,
    
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

-- Client relationships (tenants, buyers tracking)
CREATE TABLE IF NOT EXISTS public.client_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_business_id VARCHAR(20),
    owner_business_type VARCHAR(20),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_citizen_id VARCHAR(20),
    relationship_type client_relationship_type NOT NULL,
    property_type VARCHAR(100),
    property_description TEXT,
    property_address TEXT,
    property_region VARCHAR(100),
    property_district VARCHAR(100),
    property_ward VARCHAR(100),
    agreement_id UUID,
    agreement_number VARCHAR(50),
    monthly_rent DECIMAL(15,2),
    total_price DECIMAL(15,2),
    deposit_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'TZS',
    start_date DATE NOT NULL,
    end_date DATE,
    last_payment_date DATE,
    next_payment_due DATE,
    status client_relationship_status DEFAULT 'active',
    status_reason TEXT,
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    client_email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. REQUESTS & NOTIFICATIONS
-- =====================================================

-- Profile change requests (requires approval)
CREATE TABLE IF NOT EXISTS public.profile_change_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agreement notifications
CREATE TABLE IF NOT EXISTS public.agreement_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_citizen_id TEXT,
    notification_type TEXT DEFAULT 'agreement_approval',
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_actioned BOOLEAN DEFAULT FALSE,
    action_taken TEXT,
    action_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    actioned_at TIMESTAMPTZ
);

-- User documents storage metadata
CREATE TABLE IF NOT EXISTS public.user_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    document_category TEXT NOT NULL DEFAULT 'support',
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions tracking
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    location_id UUID REFERENCES locations(id),
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. HELPER FUNCTIONS (SECURITY DEFINER - avoids RLS recursion)
-- =====================================================

-- Get user role safely (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role_safe()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role::TEXT FROM users WHERE id = auth.uid();
$$;

-- Check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(public.get_user_role_safe() IN ('staff', 'admin'), FALSE);
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(public.get_user_role_safe() = 'admin', FALSE);
$$;

-- Generate citizen ID (CT + YEAR + LETTER + 5-DIGIT)
CREATE OR REPLACE FUNCTION public.generate_citizen_id()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    letter_part TEXT;
    number_part TEXT;
    new_citizen_id TEXT;
    counter INT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    counter := COALESCE(NEXTVAL('citizen_id_seq'), 1);
    letter_part := CHR(65 + ((counter - 1) / 999999) % 26);
    number_part := LPAD(((counter - 1) % 999999 + 1)::TEXT, 5, '0');
    new_citizen_id := 'CT' || year_part || letter_part || number_part;
    RETURN new_citizen_id;
END;
$$ LANGUAGE plpgsql;

-- Generate business ID
CREATE OR REPLACE FUNCTION public.generate_business_id(b_type business_type)
RETURNS VARCHAR(20) AS $$
DECLARE
    prefix VARCHAR(2);
    year_part VARCHAR(4);
    letter CHAR(1);
    seq_num INTEGER;
    new_id VARCHAR(20);
BEGIN
    CASE b_type
        WHEN 'seller' THEN prefix := 'SL';
        WHEN 'landlord' THEN prefix := 'LL';
        WHEN 'broker' THEN prefix := 'BR';
    END CASE;
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    letter := CHR(65 + FLOOR(RANDOM() * 26)::INTEGER);
    SELECT COALESCE(MAX(SUBSTRING(business_id FROM 8 FOR 5)::INTEGER), 0) + 1 INTO seq_num
    FROM business_registrations
    WHERE business_type = b_type AND business_id IS NOT NULL;
    new_id := prefix || year_part || letter || LPAD(seq_num::TEXT, 5, '0');
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Generate application number
CREATE OR REPLACE FUNCTION public.generate_app_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.application_number := 'APP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Approve business registration
CREATE OR REPLACE FUNCTION public.approve_business_registration(
    registration_id UUID,
    approver_id UUID
)
RETURNS VARCHAR(20) AS $$
DECLARE
    reg_record RECORD;
    new_business_id VARCHAR(20);
BEGIN
    SELECT * INTO reg_record FROM business_registrations WHERE id = registration_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Registration not found'; END IF;
    IF reg_record.status = 'approved' THEN RETURN reg_record.business_id; END IF;
    new_business_id := generate_business_id(reg_record.business_type);
    UPDATE business_registrations
    SET status = 'approved', business_id = new_business_id,
        reviewed_by = approver_id, reviewed_at = NOW(),
        approved_at = NOW(), updated_at = NOW()
    WHERE id = registration_id;
    CASE reg_record.business_type
        WHEN 'seller' THEN UPDATE users SET seller_id = new_business_id WHERE id = reg_record.user_id;
        WHEN 'landlord' THEN UPDATE users SET landlord_id = new_business_id WHERE id = reg_record.user_id;
        WHEN 'broker' THEN UPDATE users SET broker_id = new_business_id WHERE id = reg_record.user_id;
    END CASE;
    RETURN new_business_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. SEQUENCES
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS public.citizen_id_seq START WITH 1;

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- NOTE: Application number trigger is intentionally NOT created here.
-- The frontend generates numbers in format TZ-SERVICE-YYYYMMDD-XXXX.
-- A DB-side trigger would overwrite those with APP-YYYYMMDD-XXXX.
-- The generate_app_number() function is kept for reference only.
DROP TRIGGER IF EXISTS tr_generate_app_number ON applications;

-- Citizen ID trigger
CREATE OR REPLACE FUNCTION public.set_citizen_id()
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
    FOR EACH ROW EXECUTE FUNCTION set_citizen_id();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
CREATE TRIGGER trigger_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trigger_business_registrations_updated_at ON business_registrations;
CREATE TRIGGER trigger_business_registrations_updated_at BEFORE UPDATE ON business_registrations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trigger_client_relationships_updated_at ON client_relationships;
CREATE TRIGGER trigger_client_relationships_updated_at BEFORE UPDATE ON client_relationships FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- 9. RLS POLICIES (Non-recursive)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- USERS policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can insert any user" ON users;
CREATE POLICY "Admin can insert any user" ON users FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete users" ON users;
CREATE POLICY "Admin can delete users" ON users FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can view all users" ON users;
CREATE POLICY "Staff can view all users" ON users FOR SELECT USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff can update users" ON users;
CREATE POLICY "Staff can update users" ON users FOR UPDATE USING (public.is_admin_or_staff());

-- SERVICES policies
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Staff can view all services" ON services;
CREATE POLICY "Staff can view all services" ON services FOR SELECT USING (public.is_admin_or_staff());

-- APPLICATIONS policies
DROP POLICY IF EXISTS "Citizens can view own applications" ON applications;
CREATE POLICY "Citizens can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Citizens can insert own applications" ON applications;
CREATE POLICY "Citizens can insert own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Citizens can update own applications" ON applications;
CREATE POLICY "Citizens can update own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all applications" ON applications;
CREATE POLICY "Staff can view all applications" ON applications FOR SELECT USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff can update applications" ON applications;
CREATE POLICY "Staff can update applications" ON applications FOR UPDATE USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Second party can view applications" ON applications;
CREATE POLICY "Second party can view applications" ON applications FOR SELECT USING (second_party_user_id = auth.uid());

-- PUBLIC VERIFICATION (for document verification feature)
DROP POLICY IF EXISTS "Public can verify issued applications" ON applications;
CREATE POLICY "Public can verify issued applications" ON applications FOR SELECT USING (status = 'issued');

-- PAYMENTS policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM applications WHERE id = payments.application_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
CREATE POLICY "Staff can view all payments" ON payments FOR SELECT USING (public.is_admin_or_staff());

-- BUSINESS REGISTRATIONS policies
DROP POLICY IF EXISTS "Users can view own registrations" ON business_registrations;
CREATE POLICY "Users can view own registrations" ON business_registrations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own registrations" ON business_registrations;
CREATE POLICY "Users can insert own registrations" ON business_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all registrations" ON business_registrations;
CREATE POLICY "Staff can view all registrations" ON business_registrations FOR SELECT USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff can update registrations" ON business_registrations;
CREATE POLICY "Staff can update registrations" ON business_registrations FOR UPDATE USING (public.is_admin_or_staff());

-- CLIENT RELATIONSHIPS policies
DROP POLICY IF EXISTS "Owners can view own relationships" ON client_relationships;
CREATE POLICY "Owners can view own relationships" ON client_relationships FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Clients can view own relationships" ON client_relationships;
CREATE POLICY "Clients can view own relationships" ON client_relationships FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Owners can insert relationships" ON client_relationships;
CREATE POLICY "Owners can insert relationships" ON client_relationships FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- PROFILE CHANGE REQUESTS policies
DROP POLICY IF EXISTS "Users can view own change requests" ON profile_change_requests;
CREATE POLICY "Users can view own change requests" ON profile_change_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert change requests" ON profile_change_requests;
CREATE POLICY "Users can insert change requests" ON profile_change_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view profile_change_requests" ON profile_change_requests;
CREATE POLICY "Staff can view profile_change_requests" ON profile_change_requests FOR SELECT USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "Staff can update profile_change_requests" ON profile_change_requests;
CREATE POLICY "Staff can update profile_change_requests" ON profile_change_requests FOR UPDATE USING (public.is_admin_or_staff());

-- NOTIFICATIONS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- USER DOCUMENTS policies
DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
CREATE POLICY "Users can view own documents" ON user_documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upload own documents" ON user_documents;
CREATE POLICY "Users can upload own documents" ON user_documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all documents" ON user_documents;
CREATE POLICY "Staff can view all documents" ON user_documents FOR SELECT USING (public.is_admin_or_staff());

-- PUBLIC DATA policies (locations, offices, service_categories)
DROP POLICY IF EXISTS "Anyone can view locations" ON locations;
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view offices" ON offices;
CREATE POLICY "Anyone can view offices" ON offices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view service categories" ON service_categories;
CREATE POLICY "Anyone can view service categories" ON service_categories FOR SELECT USING (true);

-- =====================================================
-- 10. INDEXES (Performance)
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_nida ON users(nida_number) WHERE nida_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_citizen_id ON users(citizen_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_region_district ON users(region, district);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_service_id ON applications(service_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_application_number ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_second_party ON applications(second_party_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_target_user ON applications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_location ON applications(region, district, ward);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Business registrations indexes
CREATE INDEX IF NOT EXISTS idx_business_registrations_user_id ON business_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_business_registrations_business_type ON business_registrations(business_type);
CREATE INDEX IF NOT EXISTS idx_business_registrations_status ON business_registrations(status);
CREATE INDEX IF NOT EXISTS idx_business_registrations_business_id ON business_registrations(business_id);

-- Client relationships indexes
CREATE INDEX IF NOT EXISTS idx_client_relationships_owner_id ON client_relationships(owner_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_client_id ON client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_status ON client_relationships(status);

-- Location indexes
CREATE INDEX IF NOT EXISTS idx_locations_level ON locations(level);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- 11. GRANTS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;