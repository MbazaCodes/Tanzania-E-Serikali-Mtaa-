-- Add staff action tracking columns to applications table
-- These columns track who performed each action and when

-- Add approved_by and approved_at columns
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add rejected_by and rejected_at columns
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Add returned_by and returned_at columns
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS returned_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ;

-- Add issued_by and issued_at columns
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ;

-- Add verified_by and verified_at columns
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_approved_by ON public.applications(approved_by);
CREATE INDEX IF NOT EXISTS idx_applications_issued_by ON public.applications(issued_by);

COMMENT ON COLUMN public.applications.approved_by IS 'Staff/Admin who approved the application';
COMMENT ON COLUMN public.applications.approved_at IS 'Timestamp when application was approved';
COMMENT ON COLUMN public.applications.rejected_by IS 'Staff/Admin who rejected the application';
COMMENT ON COLUMN public.applications.rejected_at IS 'Timestamp when application was rejected';
COMMENT ON COLUMN public.applications.returned_by IS 'Staff/Admin who returned the application';
COMMENT ON COLUMN public.applications.returned_at IS 'Timestamp when application was returned';
COMMENT ON COLUMN public.applications.issued_by IS 'Staff/Admin who issued the document';
COMMENT ON COLUMN public.applications.issued_at IS 'Timestamp when document was issued';
COMMENT ON COLUMN public.applications.verified_by IS 'Staff/Admin who verified the payment';
COMMENT ON COLUMN public.applications.verified_at IS 'Timestamp when payment was verified';
