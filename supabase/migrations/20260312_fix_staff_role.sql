-- Fix staff role that was incorrectly overwritten to 'citizen'
UPDATE public.users 
SET role = 'staff' 
WHERE email = 'staff@e-mtaa.go.tz' AND role = 'citizen';
