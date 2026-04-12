-- E-Mtaa Database Schema

-- Users table (extends Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    gender TEXT,
    nationality TEXT DEFAULT 'Tanzanian',
    nida_number TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    photo_url TEXT,
    role TEXT CHECK (role IN ('citizen', 'staff', 'admin')) DEFAULT 'citizen',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    region TEXT NOT NULL,
    district TEXT NOT NULL,
    ward TEXT NOT NULL,
    street TEXT NOT NULL,
    council_code TEXT NOT NULL
);

-- Services table
CREATE TABLE public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    form_schema JSONB NOT NULL,
    document_template JSONB NOT NULL,
    fee DECIMAL(12,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    service_id UUID REFERENCES public.services(id) NOT NULL,
    form_data JSONB NOT NULL,
    status TEXT CHECK (status IN ('submitted', 'paid', 'verified', 'approved', 'issued', 'rejected')) DEFAULT 'submitted',
    application_number TEXT UNIQUE,
    assigned_staff_id UUID REFERENCES public.users(id),
    location_id UUID REFERENCES public.locations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT,
    transaction_id TEXT UNIQUE,
    receipt_number TEXT UNIQUE,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    breakdown JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Documents table
CREATE TABLE public.generated_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) NOT NULL,
    document_url TEXT NOT NULL,
    qr_code_url TEXT,
    certificate_id TEXT UNIQUE,
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- Citizens see only their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Citizens can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Citizens can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff can see applications in their ward (simplified for demo: staff see all)
CREATE POLICY "Staff can view all applications" ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('staff', 'admin'))
);

-- Admin can do everything
CREATE POLICY "Admins have full access" ON public.users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- TRIGGERS for application numbers
CREATE OR REPLACE FUNCTION generate_app_number() RETURNS TRIGGER AS $$
BEGIN
    NEW.application_number := 'APP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_app_number
BEFORE INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION generate_app_number();
