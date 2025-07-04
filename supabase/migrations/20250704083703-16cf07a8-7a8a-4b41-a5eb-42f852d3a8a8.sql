
-- Create pending_registrations table for handling registration approvals
CREATE TABLE public.pending_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  requested_role app_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Allow super admins to manage all pending registrations
CREATE POLICY "Super admins can manage pending registrations"
ON public.pending_registrations
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow senate members to view and manage pending registrations
CREATE POLICY "Senate members can manage pending registrations"
ON public.pending_registrations
FOR ALL
USING (has_role(auth.uid(), 'senate_member'::app_role));

-- Allow users to view their own pending registration
CREATE POLICY "Users can view their own pending registration"
ON public.pending_registrations
FOR SELECT
USING (auth.uid() = user_id);
