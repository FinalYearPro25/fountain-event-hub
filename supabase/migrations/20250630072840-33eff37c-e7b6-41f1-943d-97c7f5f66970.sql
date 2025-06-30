
-- Create enum types first
CREATE TYPE public.user_type AS ENUM ('student', 'staff', 'outsider');
CREATE TYPE public.app_role AS ENUM ('super_admin', 'senate_member', 'dean', 'department_head', 'event_coordinator', 'student', 'staff', 'outsider');
CREATE TYPE public.venue_type AS ENUM ('hall', 'auditorium', 'classroom', 'outdoor', 'conference_room');
CREATE TYPE public.resource_category AS ENUM ('audio_visual', 'furniture', 'catering', 'decoration', 'technical');
CREATE TYPE public.event_type AS ENUM ('academic', 'cultural', 'sports', 'conference', 'workshop', 'seminar');
CREATE TYPE public.event_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE public.approval_level AS ENUM ('college_dean', 'senate', 'final');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE public.attendance_status AS ENUM ('registered', 'attended', 'absent');
CREATE TYPE public.booking_type AS ENUM ('class', 'event', 'maintenance', 'blocked');
CREATE TYPE public.booking_status AS ENUM ('active', 'cancelled', 'completed');

-- Create colleges table
CREATE TABLE public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    dean_id UUID REFERENCES auth.users(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    user_type user_type NOT NULL DEFAULT 'student',
    student_id TEXT,
    staff_id TEXT,
    college_id UUID REFERENCES public.colleges(id),
    department TEXT,
    year_of_study INTEGER,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create venues table
CREATE TABLE public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    college_id UUID REFERENCES public.colleges(id),
    capacity INTEGER NOT NULL,
    venue_type venue_type NOT NULL,
    location_description TEXT,
    facilities JSONB DEFAULT '[]',
    booking_price_external DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category resource_category NOT NULL,
    price_per_unit DECIMAL(10,2) DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    organizer_id UUID REFERENCES auth.users(id) NOT NULL,
    venue_id UUID REFERENCES public.venues(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    banner_image_url TEXT,
    status event_status DEFAULT 'draft',
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_approvals table
CREATE TABLE public.event_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES auth.users(id),
    approval_level approval_level NOT NULL,
    status approval_status DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_resources table
CREATE TABLE public.event_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES public.resources(id),
    quantity_requested INTEGER NOT NULL,
    quantity_approved INTEGER,
    total_cost DECIMAL(10,2) NOT NULL,
    status approval_status DEFAULT 'pending'
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    payment_status payment_status DEFAULT 'pending',
    payment_reference TEXT,
    attendance_status attendance_status DEFAULT 'registered',
    certificate_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create venue_bookings table
CREATE TABLE public.venue_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id),
    event_id UUID REFERENCES public.events(id),
    booked_by UUID REFERENCES auth.users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    booking_type booking_type DEFAULT 'event',
    status booking_status DEFAULT 'active',
    penalty_applied BOOLEAN DEFAULT false,
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    no_show BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_bookings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'senate_member' THEN 2
      WHEN 'dean' THEN 3
      WHEN 'department_head' THEN 4
      WHEN 'event_coordinator' THEN 5
      WHEN 'staff' THEN 6
      WHEN 'student' THEN 7
      WHEN 'outsider' THEN 8
    END
  LIMIT 1
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles table
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for colleges table
CREATE POLICY "Anyone can view colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Admins can manage colleges" ON public.colleges FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for venues table
CREATE POLICY "Anyone can view active venues" ON public.venues FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage venues" ON public.venues FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for resources table
CREATE POLICY "Anyone can view active resources" ON public.resources FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for events table
CREATE POLICY "Anyone can view approved events" ON public.events FOR SELECT USING (status = 'approved' OR organizer_id = auth.uid());
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Admins can manage all events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'dean'));

-- RLS Policies for event_registrations table
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can view event registrations" ON public.event_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
);

-- Insert sample colleges
INSERT INTO public.colleges (name, code, description) VALUES
('College of Engineering', 'COE', 'Engineering and Technology programs'),
('College of Sciences', 'COS', 'Natural and Applied Sciences'),
('College of Management Sciences', 'CMS', 'Business and Management studies'),
('College of Social Sciences', 'CSS', 'Social Sciences and Humanities');

-- Insert sample venues
INSERT INTO public.venues (name, code, capacity, venue_type, location_description, college_id) VALUES
('Main Auditorium', 'MAIN_AUD', 500, 'auditorium', 'Central Campus Main Building', (SELECT id FROM public.colleges WHERE code = 'COE' LIMIT 1)),
('Engineering Hall A', 'ENG_A', 150, 'hall', 'Engineering Building Block A', (SELECT id FROM public.colleges WHERE code = 'COE' LIMIT 1)),
('Science Lab Complex', 'SCI_LAB', 80, 'classroom', 'Science Building Laboratory', (SELECT id FROM public.colleges WHERE code = 'COS' LIMIT 1)),
('Business Conference Room', 'BIZ_CONF', 50, 'conference_room', 'Management Building 3rd Floor', (SELECT id FROM public.colleges WHERE code = 'CMS' LIMIT 1));

-- Insert sample resources
INSERT INTO public.resources (name, category, price_per_unit, available_quantity, description) VALUES
('Projector', 'audio_visual', 50.00, 10, 'HD Digital Projector with HDMI support'),
('Sound System', 'audio_visual', 100.00, 5, 'Professional PA system with microphones'),
('Round Tables', 'furniture', 20.00, 50, 'Standard round tables for 8 people'),
('Chairs', 'furniture', 5.00, 200, 'Comfortable event chairs'),
('Catering Package', 'catering', 15.00, 100, 'Light refreshments and beverages');

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- Default role assignment (student for now)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
