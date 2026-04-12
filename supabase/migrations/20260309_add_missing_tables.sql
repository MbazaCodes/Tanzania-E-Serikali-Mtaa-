-- Add missing tables: sessions, service_categories
-- And create a new locations table with proper hierarchical structure

-- Create sessions table for tracking active user sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT TRUE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_sw TEXT,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offices table
CREATE TABLE IF NOT EXISTS public.offices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create activity_logs table if not exists
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON public.sessions
    FOR ALL USING (auth.uid() = user_id);

-- Service categories policies (public read)
CREATE POLICY "Anyone can view service categories" ON public.service_categories
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage service categories" ON public.service_categories
    FOR ALL USING (public.is_admin());

-- Offices policies
DROP POLICY IF EXISTS "Anyone can view offices" ON public.offices;
DROP POLICY IF EXISTS "Admins can manage offices" ON public.offices;
CREATE POLICY "Anyone can view offices" ON public.offices
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage offices" ON public.offices
    FOR ALL USING (public.is_admin());

-- Activity logs policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Staff can view all activity" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all activity" ON public.activity_logs
    FOR SELECT USING (public.is_admin_or_staff());
CREATE POLICY "System can insert logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- Create locations table with hierarchical structure
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT CHECK (level IN ('region', 'district', 'ward', 'street')) NOT NULL,
    parent_id UUID REFERENCES public.locations(id),
    code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations policies (make it public read)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
CREATE POLICY "Anyone can view locations" ON public.locations
    FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON public.locations
    FOR ALL USING (public.is_admin());

-- Insert some default service categories
INSERT INTO public.service_categories (name, name_sw, description, icon) VALUES
    ('Certificates', 'Vyeti', 'Birth, death, marriage certificates', 'FileText'),
    ('Land', 'Ardhi', 'Land ownership and surveys', 'Map'),
    ('Business', 'Biashara', 'Business permits and licenses', 'Building'),
    ('Civil', 'Uraia', 'Civil registration services', 'Users')
ON CONFLICT DO NOTHING;
