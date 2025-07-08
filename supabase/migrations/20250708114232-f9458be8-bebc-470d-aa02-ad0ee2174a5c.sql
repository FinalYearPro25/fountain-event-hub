
-- Add staff_assigned_to field to events table to track which staff should approve
ALTER TABLE public.events ADD COLUMN staff_assigned_to uuid REFERENCES auth.users(id);

-- Add approval_level field to track approval hierarchy
ALTER TABLE public.events ADD COLUMN approval_level text DEFAULT 'pending_approval';

-- Create venue_bookings entries when events are approved
CREATE OR REPLACE FUNCTION create_venue_booking_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When event status changes to approved, create venue booking
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.venue_id IS NOT NULL THEN
    INSERT INTO public.venue_bookings (
      venue_id,
      event_id,
      start_time,
      end_time,
      booked_by,
      booking_type,
      status
    ) VALUES (
      NEW.venue_id,
      NEW.id,
      NEW.start_date,
      NEW.end_date,
      NEW.organizer_id,
      'event',
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic venue booking
CREATE TRIGGER create_venue_booking_trigger
  AFTER UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION create_venue_booking_on_approval();

-- Update RLS policies for events to include staff assigned
DROP POLICY IF EXISTS "Organizers can update own events" ON public.events;
CREATE POLICY "Organizers and assigned staff can update events"
  ON public.events
  FOR UPDATE
  USING (auth.uid() = organizer_id OR auth.uid() = staff_assigned_to);

-- Allow staff to view events assigned to them
DROP POLICY IF EXISTS "Anyone can view approved events" ON public.events;
CREATE POLICY "View approved events or assigned events"
  ON public.events
  FOR SELECT
  USING (
    status = 'approved' OR 
    organizer_id = auth.uid() OR 
    staff_assigned_to = auth.uid() OR
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'dean') OR
    has_role(auth.uid(), 'dean_student_affairs') OR
    has_role(auth.uid(), 'senate_member')
  );
