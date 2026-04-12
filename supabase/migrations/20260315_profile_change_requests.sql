-- Create profile_change_requests table for sensitive field updates requiring approval
CREATE TABLE IF NOT EXISTS public.profile_change_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_changes_user ON public.profile_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_changes_status ON public.profile_change_requests(status);

-- Enable RLS
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own change requests
CREATE POLICY "Users can view own change requests" ON public.profile_change_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own change requests
CREATE POLICY "Users can insert own change requests" ON public.profile_change_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff can view all change requests
CREATE POLICY "Staff can view all change requests" ON public.profile_change_requests
    FOR SELECT USING (public.is_admin_or_staff());

-- Staff can update change requests (approve/reject)
CREATE POLICY "Staff can update change requests" ON public.profile_change_requests
    FOR UPDATE USING (public.is_admin_or_staff());
