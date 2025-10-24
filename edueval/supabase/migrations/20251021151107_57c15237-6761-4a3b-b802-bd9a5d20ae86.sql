-- Create enum for institution approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'institution', 'teacher');

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  institution_code TEXT UNIQUE NOT NULL,
  contact_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status approval_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for teachers and additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL,
  institution_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_title TEXT NOT NULL,
  subject_class TEXT NOT NULL,
  exam_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration TEXT NOT NULL,
  file_url TEXT,
  status approval_status DEFAULT 'pending',
  institution_code TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics table for dummy data
CREATE TABLE public.student_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  class TEXT NOT NULL,
  avg_score INTEGER NOT NULL,
  attendance INTEGER NOT NULL,
  institution_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Institutions can view their own data"
  ON public.institutions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert institutions"
  ON public.institutions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Institutions can update their own data"
  ON public.institutions FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admin can update all institutions"
  ON public.institutions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    auth.role() = 'anon'
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid() OR role = 'admin');

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for exams
CREATE POLICY "Users can view exams for their institution"
  ON public.exams FOR SELECT
  USING (
    institution_code IN (
      SELECT institution_code FROM public.profiles WHERE user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teachers can create exams"
  ON public.exams FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Teachers can update their own exams"
  ON public.exams FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policies for analytics
CREATE POLICY "Users can view analytics for their institution"
  ON public.student_analytics FOR SELECT
  USING (
    institution_code IN (
      SELECT institution_code FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Function to generate institution code
CREATE OR REPLACE FUNCTION generate_institution_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'INST' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM institutions WHERE institution_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update institution status (bypasses RLS for admin operations)
CREATE OR REPLACE FUNCTION update_institution_status(institution_id UUID, new_status approval_status)
RETURNS VOID AS $$
BEGIN
  UPDATE institutions SET status = new_status WHERE id = institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
