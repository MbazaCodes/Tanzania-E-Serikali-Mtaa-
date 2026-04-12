-- Add alternative ID type columns for users without NIDA
-- This supports birth certificate, voter ID, driving license, etc.

ALTER TABLE users ADD COLUMN IF NOT EXISTS id_type text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_number text;

-- Add comment for documentation
COMMENT ON COLUMN users.id_type IS 'Alternative ID type for users without NIDA: birth_certificate, voter_id, driving_license, zanzibar_id, student_id, employer_id';
COMMENT ON COLUMN users.id_number IS 'Alternative ID number for users without NIDA';

-- Create index for alternative ID lookup
CREATE INDEX IF NOT EXISTS idx_users_alternative_id ON users(id_type, id_number) WHERE id_type IS NOT NULL;
