-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('nurse', 'client', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  bio TEXT
);

-- Create nurse_profiles table
CREATE TABLE public.nurse_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL UNIQUE,
  specialization TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  education TEXT NOT NULL,
  certifications TEXT[] DEFAULT '{}',
  id_document_hash TEXT NOT NULL,
  certification_hashes TEXT[] DEFAULT '{}',
  ai_score DECIMAL(3, 2) DEFAULT 0.0 CHECK (ai_score >= 0 AND ai_score <= 100),
  rating DECIMAL(2, 1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  jobs_completed INTEGER DEFAULT 0 CHECK (jobs_completed >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  availability BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(8, 2) NOT NULL CHECK (hourly_rate > 0)
);

-- Create care_requests table
CREATE TABLE public.care_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  care_type TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(10, 2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requirements TEXT[] DEFAULT '{}'
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  care_request_id UUID REFERENCES public.care_requests(id) ON DELETE CASCADE,
  nurse_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ai_score DECIMAL(3, 2) NOT NULL CHECK (ai_score >= 0 AND ai_score <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'accepted', 'declined')),
  admin_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_response TEXT CHECK (client_response IN ('pending', 'accepted', 'declined')),
  UNIQUE(care_request_id, nurse_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document')),
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, reviewer_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'XAF',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('momo', 'cash', 'bank')),
  transaction_id TEXT,
  momo_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_location ON public.profiles(location_lat, location_lng);
CREATE INDEX idx_nurse_profiles_user_id ON public.nurse_profiles(user_id);
CREATE INDEX idx_nurse_profiles_ai_score ON public.nurse_profiles(ai_score DESC);
CREATE INDEX idx_care_requests_client_id ON public.care_requests(client_id);
CREATE INDEX idx_care_requests_status ON public.care_requests(status);
CREATE INDEX idx_care_requests_location ON public.care_requests(location_lat, location_lng);
CREATE INDEX idx_matches_care_request_id ON public.matches(care_request_id);
CREATE INDEX idx_matches_nurse_id ON public.matches(nurse_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_messages_match_id ON public.messages(match_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_reviews_match_id ON public.reviews(match_id);
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_payments_match_id ON public.payments(match_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_nurse_profiles_updated_at
  BEFORE UPDATE ON public.nurse_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_care_requests_updated_at
  BEFORE UPDATE ON public.care_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Nurse profiles policies
CREATE POLICY "Nurses can view their own profile" ON public.nurse_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Nurses can update their own profile" ON public.nurse_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Verified nurses can view other nurse profiles" ON public.nurse_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'nurse' 
      AND is_verified = TRUE
    )
  );

CREATE POLICY "Admins can view all nurse profiles" ON public.nurse_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Care requests policies
CREATE POLICY "Clients can view their own requests" ON public.care_requests
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create requests" ON public.care_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own requests" ON public.care_requests
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Verified nurses can view open requests" ON public.care_requests
  FOR SELECT USING (
    status = 'open'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'nurse' 
      AND is_verified = TRUE
    )
  );

CREATE POLICY "Admins can view all requests" ON public.care_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Matches policies
CREATE POLICY "Users can view their own matches" ON public.matches
  FOR SELECT USING (
    auth.uid() IN (nurse_id, (SELECT client_id FROM public.care_requests WHERE id = care_request_id))
  );

CREATE POLICY "Admins can view all matches" ON public.matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can create messages in their matches" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (sender_id, receiver_id)
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
      AND (
        (nurse_id = auth.uid() AND care_request_id IN (SELECT id FROM public.care_requests WHERE client_id = receiver_id))
        OR (nurse_id = receiver_id AND care_request_id IN (SELECT id FROM public.care_requests WHERE client_id = auth.uid()))
      )
    )
  );

CREATE POLICY "Users can update read status of messages sent to them" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Reviews policies
CREATE POLICY "Users can view reviews for their matches" ON public.reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
      AND (nurse_id = auth.uid() OR care_request_id IN (SELECT id FROM public.care_requests WHERE client_id = auth.uid()))
    )
  );

CREATE POLICY "Users can create reviews for their matches" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
      AND status = 'completed'
      AND (
        (nurse_id = reviewee_id AND care_request_id IN (SELECT id FROM public.care_requests WHERE client_id = reviewer_id))
        OR (nurse_id = reviewer_id AND care_request_id IN (SELECT id FROM public.care_requests WHERE client_id = reviewee_id))
      )
    )
  );

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
      AND (nurse_id = auth.uid() OR care_request_id IN (SELECT id FROM public.care_requests WHERE client_id = auth.uid()))
    )
  );

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
