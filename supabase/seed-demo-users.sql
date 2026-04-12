-- Seed demo users for E-Serikali-Mtaa testing
-- Using actual Supabase Auth user IDs

-- Insert or update Citizen user profile
INSERT INTO public.users (
  id,
  first_name,
  middle_name,
  last_name,
  email,
  phone,
  role,
  is_verified,
  nationality,
  country_of_citizenship
) VALUES (
  'b6eafe1c-9513-45d8-a71e-11d7f385017d',
  'Test',
  'Demo',
  'Citizen',
  'mwananchi@e-mtaa.go.tz',
  '+255 700000001',
  'citizen',
  true,
  'Tanzanian',
  'Tanzania'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'citizen',
  is_verified = true,
  updated_at = NOW();

-- Insert or update Staff user profile
INSERT INTO public.users (
  id,
  first_name,
  middle_name,
  last_name,
  email,
  phone,
  role,
  is_verified,
  nationality,
  country_of_citizenship
) VALUES (
  '481b54e2-b261-4e92-bb02-1cbdf09e4eff',
  'Test',
  'Demo',
  'Staff',
  'staff@e-mtaa.go.tz',
  '+255 700000002',
  'staff',
  true,
  'Tanzanian',
  'Tanzania'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'staff',
  is_verified = true,
  updated_at = NOW();

-- Insert or update Admin user profile
INSERT INTO public.users (
  id,
  first_name,
  middle_name,
  last_name,
  email,
  phone,
  role,
  is_verified,
  nationality,
  country_of_citizenship
) VALUES (
  '481b54e2-b261-4e92-bb02-1cbdf09e4eff',
  'Test',
  'Demo',
  'Admin',
  'admin@e-mtaa.go.tz',
  '+255 700000003',
  'admin',
  true,
  'Tanzanian',
  'Tanzania'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_verified = true,
  updated_at = NOW();

-- Insert or update Real Admin user (Default)
INSERT INTO public.users (
  id,
  first_name,
  middle_name,
  last_name,
  email,
  phone,
  role,
  is_verified,
  nationality,
  country_of_citizenship
) VALUES (
  'bf992aaf-a06b-4166-b7af-a2e6b14bc4b3',
  'Admin',
  'System',
  'User',
  'mbazzacodes@gmail.com',
  '+255 700000000',
  'admin',
  true,
  'Tanzanian',
  'Tanzania'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_verified = true,
  updated_at = NOW();
