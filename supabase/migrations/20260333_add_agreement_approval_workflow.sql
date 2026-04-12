-- Add columns for agreement approval workflow
-- Allows one party to send agreement to another party for approval

-- Add target_user_id - the user who needs to approve/confirm the agreement
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES public.users(id);

-- Add target_user_nida - NIDA of the person who should confirm
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS target_user_nida TEXT;

-- Add target_user_role - role of the target user (tenant, buyer, landlord, seller)
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS target_user_role TEXT;

-- Add approval status for agreements
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS agreement_status TEXT DEFAULT 'pending' 
CHECK (agreement_status IN ('pending', 'approved', 'rejected', 'expired'));

-- Add approved_by_target - when target user approves
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS approved_by_target UUID REFERENCES public.users(id);

-- Add approved_by_target_at - timestamp of approval
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS approved_by_target_at TIMESTAMPTZ;

-- Add rejection reason if target rejects
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS target_rejection_reason TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_target_user_id ON public.applications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_target_user_nida ON public.applications(target_user_nida);
CREATE INDEX IF NOT EXISTS idx_applications_agreement_status ON public.applications(agreement_status);

-- Comments for documentation
COMMENT ON COLUMN public.applications.target_user_id IS 'User ID of the person who needs to approve the agreement';
COMMENT ON COLUMN public.applications.target_user_nida IS 'NIDA number of the person who should confirm (for lookup)';
COMMENT ON COLUMN public.applications.target_user_role IS 'Role of target user: tenant, buyer, landlord, seller';
COMMENT ON COLUMN public.applications.agreement_status IS 'Status of agreement: pending, approved, rejected, expired';
COMMENT ON COLUMN public.applications.approved_by_target IS 'User ID who approved the agreement';
COMMENT ON COLUMN public.applications.approved_by_target_at IS 'Timestamp when target user approved';
COMMENT ON COLUMN public.applications.target_rejection_reason IS 'Reason given if target user rejects the agreement';
