
-- Fix RLS policies for events table to allow proper approval workflow
-- Remove the problematic temporary policies and create proper ones

DROP POLICY IF EXISTS "TEMP allow all authenticated updates" ON public.events;
DROP POLICY IF EXISTS "TEMP allow all updates for debug" ON public.events;

-- Update the staff approval policy to be more permissive for approval workflow
DROP POLICY IF EXISTS "Staff can view pending approval events" ON public.events;
CREATE POLICY "Staff can view events for approval" 
  ON public.events 
  FOR SELECT 
  USING (
    status IN ('pending_approval', 'pending_student_affairs', 'pending_vc') OR
    organizer_id = auth.uid() OR 
    staff_assigned_to = auth.uid() OR
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'dean') OR
    has_role(auth.uid(), 'dean_student_affairs') OR
    has_role(auth.uid(), 'senate_member') OR
    has_role(auth.uid(), 'staff')
  );

-- Create comprehensive update policy for approval workflow
DROP POLICY IF EXISTS "Organizers, assigned staff, or any staff for staff-approval eve" ON public.events;
CREATE POLICY "Approval workflow updates allowed"
  ON public.events
  FOR UPDATE
  USING (
    -- Organizers can update their own events
    auth.uid() = organizer_id OR
    -- Staff assigned to specific events
    auth.uid() = staff_assigned_to OR
    -- Any staff member can approve pending_approval events
    (status = 'pending_approval' AND has_role(auth.uid(), 'staff')) OR
    -- Department heads can approve pending_approval events
    (status = 'pending_approval' AND has_role(auth.uid(), 'department_head')) OR
    -- Event coordinators can approve pending_approval events
    (status = 'pending_approval' AND has_role(auth.uid(), 'event_coordinator')) OR
    -- Dean of Student Affairs can approve pending_student_affairs events
    (status = 'pending_student_affairs' AND has_role(auth.uid(), 'dean_student_affairs')) OR
    -- Senate members can approve pending_vc events
    (status = 'pending_vc' AND has_role(auth.uid(), 'senate_member')) OR
    -- Super admins can update any event
    has_role(auth.uid(), 'super_admin') OR
    -- Deans can update any event
    has_role(auth.uid(), 'dean')
  );

-- Allow notifications to be inserted by the system
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);
