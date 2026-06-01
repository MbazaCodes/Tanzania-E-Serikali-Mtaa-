-- Fix phone number CHECK constraint
-- Previous constraint '^[0-9]{10,15}$' rejects international format +255...
-- New constraint accepts: +255712345678, 0712345678, +1-800-555-0123, etc.

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_phone_check;

ALTER TABLE public.users ADD CONSTRAINT users_phone_check
    CHECK (phone IS NULL OR phone ~ '^[+]?[0-9][0-9\s\-]{7,19}$');
