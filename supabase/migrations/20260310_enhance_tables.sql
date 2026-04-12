-- Enhance tables with additional fields and indexes

-- Add missing columns to sessions table
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS registered_count INTEGER DEFAULT 0;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to service_categories table
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to locations table
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_locations_level ON public.locations(level);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON public.locations(parent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(active);

-- Insert sample location data for Tanzania
INSERT INTO public.locations (name, level, code) VALUES
    ('Dar es Salaam', 'region', 'DSM-001'),
    ('Arusha', 'region', 'AR-001'),
    ('Mwanza', 'region', 'MZ-001'),
    ('Dodoma', 'region', 'DD-001'),
    ('Kilimanjaro', 'region', 'KL-001'),
    ('Tanga', 'region', 'TG-001'),
    ('Morogoro', 'region', 'MR-001'),
    ('Mbeya', 'region', 'MB-001')
ON CONFLICT DO NOTHING;

-- Insert more service categories
INSERT INTO public.service_categories (name, name_sw, description, icon, "order", active) VALUES
    ('Healthcare', 'Afya', 'Medical and health services', 'Heart', 1, true),
    ('Education', 'Elimu', 'Educational programs and training', 'GraduationCap', 2, true),
    ('Social Services', 'Ustawi wa Jamii', 'Community and social support', 'Users', 3, true),
    ('Infrastructure', 'Miundombinu', 'Infrastructure projects', 'Building2', 4, true),
    ('Environment', 'Mazingira', 'Environmental initiatives', 'Leaf', 5, true)
ON CONFLICT DO NOTHING;
