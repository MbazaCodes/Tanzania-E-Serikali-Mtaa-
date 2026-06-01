-- Fix H-2: Consolidate application status CHECK constraint
-- Previous migrations added/removed values inconsistently.
-- This is the definitive final constraint covering all status values used by the app.

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
    CHECK (status IS NULL OR status IN (
        'submitted',
        'pending_review',
        'pending_payment',
        'paid',
        'verified',
        'approved',
        'issued',
        'returned',
        'rejected',
        'refunded'
    ));

COMMENT ON COLUMN public.applications.status IS
    'Application lifecycle: submitted → pending_review → pending_payment → paid → verified → approved → issued. Can also be: returned (sent back for corrections) or rejected.';
