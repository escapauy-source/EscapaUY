-- =====================================================
-- EscapaUY Partner Dashboard - Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (for authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'tourist', -- 'tourist', 'partner', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 1B. AUTO-CREATE PROFILE TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'tourist')
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 1. PARTNERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT,
  location TEXT,
  
  -- Legal info (Ley 17.250)
  rut TEXT,
  mintur_registration TEXT,
  legal_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Availability settings (JSONB for flexibility)
  availability_settings JSONB DEFAULT '{"days": {}, "specialDates": {}}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. PARTNER SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  
  -- Service info
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  schedule TEXT,
  price NUMERIC(10, 2),
  
  -- Images (array of URLs from Supabase Storage)
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Contact info (hidden until payment)
  contact_info JSONB DEFAULT '{}'::jsonb,
  -- Example: {"address": "...", "phone": "...", "coordinates": {"lat": -34, "lng": -57}, "instructions": "..."}
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PARTNER BOOKINGS TABLE (for future)
-- =====================================================
CREATE TABLE IF NOT EXISTS partner_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  service_id UUID REFERENCES partner_services(id) ON DELETE SET NULL,
  
  -- Tourist info
  tourist_name TEXT,
  tourist_email TEXT,
  tourist_residence TEXT, -- For IVA exemption
  
  -- Booking details
  booking_date DATE NOT NULL,
  time_slot TEXT, -- 'morning', 'afternoon', 'evening'
  amount NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2), -- 15% seña
  balance_amount NUMERIC(10, 2), -- 85% saldo
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  iva_exempt BOOLEAN DEFAULT false,
  
  -- QR code
  qr_code TEXT,
  voucher_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_bookings ENABLE ROW LEVEL SECURITY;

-- Partners can only view/edit their own data
CREATE POLICY "Partners can view own profile"
  ON partners FOR SELECT
  USING (id::text = auth.uid()::text OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Partners can update own profile"
  ON partners FOR UPDATE
  USING (id::text = auth.uid()::text OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Services belong to partners
CREATE POLICY "Partners can view own services"
  ON partner_services FOR SELECT
  USING (partner_id::text = auth.uid()::text);

CREATE POLICY "Partners can insert own services"
  ON partner_services FOR INSERT
  WITH CHECK (partner_id::text = auth.uid()::text);

CREATE POLICY "Partners can update own services"
  ON partner_services FOR UPDATE
  USING (partner_id::text = auth.uid()::text);

CREATE POLICY "Partners can delete own services"
  ON partner_services FOR DELETE
  USING (partner_id::text = auth.uid()::text);

-- Bookings
CREATE POLICY "Partners can view own bookings"
  ON partner_bookings FOR SELECT
  USING (partner_id::text = auth.uid()::text);

-- Public can view services (for catalog)
CREATE POLICY "Anyone can view services"
  ON partner_services FOR SELECT
  USING (true);

-- =====================================================
-- 5. STORAGE BUCKET FOR SERVICE IMAGES
-- =====================================================

-- Create bucket (run this in Supabase Storage UI or via SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view service images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

CREATE POLICY "Authenticated users can upload service images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'service-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Partners can delete own service images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'service-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- 6. SEED DATA (Optional - for testing)
-- =====================================================

-- Debug partner
INSERT INTO partners (id, email, name, business_name, location)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'debug@bodega-el-legado.com',
  'Bodega El Legado',
  'Bodega El Legado S.A.',
  'Carmelo, Colonia'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 7. INDEXES (for performance)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_services_partner_id ON partner_services(partner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_partner_id ON partner_bookings(partner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON partner_bookings(booking_date);

-- =====================================================
-- 8. LOGS CUMPLIMIENTO (Auditing & Resilience)
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_cumplimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL, -- 'climate_toggle', 'capacity_change', 'bcu_alert_action'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for logs (Admin only)
ALTER TABLE logs_cumplimiento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view logs"
  ON logs_cumplimiento FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can insert logs"
  ON logs_cumplimiento FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- DONE! 
-- =====================================================
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify tables are created
-- 3. Verify RLS is enabled
-- 4. Check Storage bucket exists
