
-- Fix the RLS policy for staff approval workflow
-- The current policy is too restrictive and not allowing staff to update event status

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Approval workflow updates allowed" ON public.events;

-- Create a more permissive policy that allows staff approval workflow
CREATE POLICY "Staff and approval workflow updates"
  ON public.events
  FOR UPDATE
  USING (
    -- Organizers can update their own events
    auth.uid() = organizer_id OR
    -- Staff assigned to specific events
    auth.uid() = staff_assigned_to OR
    -- Allow any staff member to approve pending_approval events
    (status = 'pending_approval' AND (
      has_role(auth.uid(), 'staff') OR
      has_role(auth.uid(), 'department_head') OR
      has_role(auth.uid(), 'event_coordinator')
    )) OR
    -- Dean of Student Affairs can approve pending_student_affairs events
    (status = 'pending_student_affairs' AND has_role(auth.uid(), 'dean_student_affairs')) OR
    -- Senate members can approve pending_vc events
    (status = 'pending_vc' AND has_role(auth.uid(), 'senate_member')) OR
    -- Super admins and deans can update any event
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'dean')
  )
  WITH CHECK (
    -- Same conditions for the WITH CHECK clause
    auth.uid() = organizer_id OR
    auth.uid() = staff_assigned_to OR
    (OLD.status = 'pending_approval' AND (
      has_role(auth.uid(), 'staff') OR
      has_role(auth.uid(), 'department_head') OR
      has_role(auth.uid(), 'event_coordinator')
    )) OR
    (OLD.status = 'pending_student_affairs' AND has_role(auth.uid(), 'dean_student_affairs')) OR
    (OLD.status = 'pending_vc' AND has_role(auth.uid(), 'senate_member')) OR
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'dean')
  );
