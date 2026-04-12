-- Add columns for agreement confirmation (PANGISHA/MAUZIANO)
-- These columns track when the other party confirms their participation

-- Add confirmation_data column (stores confirmant details as JSON)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS confirmation_data JSONB;

-- Add is_confirmed column (boolean flag)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT FALSE;

-- Create index for faster queries on confirmed agreements
CREATE INDEX IF NOT EXISTS idx_applications_is_confirmed ON public.applications(is_confirmed);

-- Comments for documentation
COMMENT ON COLUMN public.applications.confirmation_data IS 'JSON data containing confirmant name, NIDA, phone, role, and timestamp';
COMMENT ON COLUMN public.applications.is_confirmed IS 'Whether the other party has confirmed their participation in the agreement';
