-- Create ENUM types first
CREATE TYPE public.membership_type AS ENUM ('grey', 'professional');
CREATE TYPE public.professional_role AS ENUM ('violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'grey', 'white', 'black');
CREATE TYPE public.premium_plan AS ENUM ('basic', 'premium');
CREATE TYPE public.space_status AS ENUM ('pending', 'approved', 'rejected', 'inactive');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Enable PostGIS extension for geometry support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (Regular app users)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,                -- References supabase auth.users.id
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(15),
  avatar_url TEXT,
  city VARCHAR(100),                           -- Added city column
  professional_role public.professional_role, -- Added professional_role column
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

-- Admins table (Simplified - removed email, names, permissions, is_super_admin)
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,               -- References supabase auth.users.id
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Space Owners table (Removed professional_role and verification_status)
CREATE TABLE public.space_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,               -- References supabase auth.users.id
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(15),
  avatar_url TEXT,
  membership_type public.membership_type DEFAULT 'grey',
  premium_plan public.premium_plan DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT space_owners_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT space_owners_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
  CONSTRAINT space_owners_commission_check CHECK (commission_rate >= 0 AND commission_rate <= 100)
);

-- Business info for space owners (with admin verification capability)
CREATE TABLE public.space_owner_business_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_owner_id UUID NOT NULL UNIQUE REFERENCES space_owners(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  gst_number VARCHAR(15),
  pan_number VARCHAR(10) NOT NULL,
  business_address TEXT NOT NULL,
  business_city VARCHAR(100) NOT NULL,
  business_state VARCHAR(50) NOT NULL,
  business_pincode VARCHAR(6) NOT NULL,
  verification_status public.verification_status DEFAULT 'pending',
  verified_by UUID REFERENCES admins(id),     -- Admin who verified
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,                      -- Reason for rejection if applicable
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT business_gst_format CHECK (gst_number IS NULL OR gst_number ~ '^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$'),
  CONSTRAINT business_pan_format CHECK (pan_number ~ '^[A-Z]{5}\d{4}[A-Z]{1}$'),
  CONSTRAINT business_pincode_format CHECK (business_pincode ~ '^\d{6}$')
);

-- Business Balances table for tracking earnings and balances
CREATE TABLE public.business_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE REFERENCES space_owner_business_info(id) ON DELETE CASCADE,
  current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_withdrawn DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  pending_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,    -- Amount pending from recent bookings
  commission_deducted DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  tax_deducted DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  last_payout_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT business_balances_amounts_check CHECK (
    current_balance >= 0 AND 
    total_earned >= 0 AND 
    total_withdrawn >= 0 AND 
    pending_amount >= 0 AND
    commission_deducted >= 0 AND
    tax_deducted >= 0
  )
);

-- Payment info for space owners
CREATE TABLE public.space_owner_payment_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_owner_id UUID NOT NULL UNIQUE REFERENCES space_owners(id) ON DELETE CASCADE,
  bank_account_number VARCHAR(20) NOT NULL,
  bank_ifsc_code VARCHAR(11) NOT NULL,
  bank_account_holder_name VARCHAR(100) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  upi_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_ifsc_format CHECK (bank_ifsc_code ~ '^[A-Z]{4}\d{7}$'),
  CONSTRAINT payment_upi_format CHECK (upi_id IS NULL OR upi_id ~ '^[\w.-]+@[\w.-]+$')
);

-- Spaces table (Modified - Added business_id, Removed owner_id)
CREATE TABLE public.spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES space_owner_business_info(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOMETRY(POINT, 4326) GENERATED ALWAYS AS (
    CASE 
      WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
      THEN ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)
      ELSE NULL
    END
  ) STORED,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 0,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status public.space_status DEFAULT 'pending',
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_bookings INTEGER DEFAULT 0,
  revenue DECIMAL(12, 2) DEFAULT 0.0,
  operating_hours JSONB DEFAULT '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], "open": "09:00", "close": "18:00"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT spaces_price_checks CHECK (price_per_day > 0 AND price_per_hour > 0),
  CONSTRAINT spaces_seats_check CHECK (total_seats > 0 AND available_seats >= 0 AND available_seats <= total_seats),
  CONSTRAINT spaces_rating_check CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT spaces_pincode_format CHECK (pincode ~ '^\d{6}$'),
  CONSTRAINT spaces_coordinates_check CHECK (
    (latitude IS NULL AND longitude IS NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL AND 
     latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
  )
);

-- Tax configurations table
CREATE TABLE public.tax_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  applies_to VARCHAR(20) NOT NULL CHECK (applies_to IN ('booking', 'owner_payout', 'both')),
  description TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tax_percentage_check CHECK (percentage >= 0 AND percentage <= 100)
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date DATE NOT NULL,
  seats_booked INTEGER NOT NULL CHECK (seats_booked > 0),
  base_amount DECIMAL(10, 2) NOT NULL CHECK (base_amount > 0),
  tax_amount DECIMAL(10, 2) DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
  owner_payout DECIMAL(10, 2) NOT NULL CHECK (owner_payout >= 0),
  platform_commission DECIMAL(10, 2) DEFAULT 0 CHECK (platform_commission >= 0),
  status public.booking_status DEFAULT 'pending',
  payment_id VARCHAR(100),
  booking_reference VARCHAR(20) UNIQUE DEFAULT 
    'BK' || EXTRACT(year FROM now()) || '-' || 
    LPAD(EXTRACT(doy FROM now())::text, 3, '0') || '-' ||
    LPAD(FLOOR(random() * 10000)::text, 4, '0'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_time_check CHECK (end_time > start_time),
  CONSTRAINT bookings_date_check CHECK (
    status IN ('completed', 'cancelled') OR date >= CURRENT_DATE
  )
);

-- Booking taxes table (Simplified - Removed tax_name and tax_percentage)
CREATE TABLE public.booking_taxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tax_id UUID NOT NULL REFERENCES tax_configurations(id),
  tax_amount DECIMAL(10, 2) NOT NULL CHECK (tax_amount >= 0),
  base_amount DECIMAL(10, 2) NOT NULL CHECK (base_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Booking payments table (Renamed from payments)
CREATE TABLE public.booking_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_payment_id VARCHAR(50),
  razorpay_order_id VARCHAR(50),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency CHAR(3) DEFAULT 'INR' CHECK (currency ~ '^[A-Z]{3}$'),
  status public.payment_status DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Space owner payments table (New - for tracking payments made to space owners)
CREATE TABLE public.space_owner_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES space_owner_business_info(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  payout_status public.payout_status DEFAULT 'pending',
  transaction_reference VARCHAR(100),          -- Bank/UPI transaction reference
  payment_method VARCHAR(20) DEFAULT 'bank_transfer',  -- bank_transfer, upi, etc.
  processed_by UUID REFERENCES admins(id),    -- Admin who processed the payment
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,                         -- Reason if payment failed
  booking_ids UUID[],                          -- Array of booking IDs this payout covers
  commission_deducted DECIMAL(10, 2) DEFAULT 0 CHECK (commission_deducted >= 0),
  tax_deducted DECIMAL(10, 2) DEFAULT 0 CHECK (tax_deducted >= 0),
  net_amount DECIMAL(12, 2) NOT NULL CHECK (net_amount > 0),  -- Amount after deductions
  payout_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT space_owner_payments_method_check CHECK (payment_method IN ('bank_transfer', 'upi', 'cheque'))
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_professional_role ON users(professional_role);

CREATE INDEX idx_admins_auth_id ON admins(auth_id);
CREATE INDEX idx_admins_is_active ON admins(is_active);

CREATE INDEX idx_space_owners_auth_id ON space_owners(auth_id);
CREATE INDEX idx_space_owners_membership_type ON space_owners(membership_type);

CREATE INDEX idx_business_info_verification ON space_owner_business_info(verification_status);
CREATE INDEX idx_business_info_verified_by ON space_owner_business_info(verified_by);

CREATE INDEX idx_business_balances_business_id ON business_balances(business_id);
CREATE INDEX idx_business_balances_current_balance ON business_balances(current_balance);

CREATE INDEX idx_spaces_business_id ON spaces(business_id);
CREATE INDEX idx_spaces_city ON spaces(city);
CREATE INDEX idx_spaces_status ON spaces(status);
CREATE INDEX idx_spaces_location ON spaces USING gist(location) WHERE location IS NOT NULL;

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_space_id ON bookings(space_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_space_owner_payments_business_id ON space_owner_payments(business_id);
CREATE INDEX idx_space_owner_payments_status ON space_owner_payments(payout_status);
CREATE INDEX idx_space_owner_payments_date ON space_owner_payments(payout_date);

CREATE INDEX idx_reviews_space_id ON reviews(space_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Useful views
CREATE VIEW public.dashboard_stats AS
SELECT
  (SELECT count(*) FROM users WHERE is_active = true) as total_users,
  (SELECT count(*) FROM spaces WHERE status = 'approved') as total_spaces,
  (SELECT count(*) FROM bookings WHERE status = 'completed') as total_bookings,
  (SELECT COALESCE(sum(total_amount), 0) FROM bookings WHERE status = 'completed') as total_revenue,
  (SELECT count(*) FROM space_owners WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days')) as new_owners_this_month,
  (SELECT count(*) FROM bookings WHERE status = 'completed' AND created_at >= (CURRENT_DATE - INTERVAL '30 days')) as bookings_this_month;

CREATE VIEW public.business_analytics AS
SELECT
  bi.id as business_id,
  bi.business_name,
  so.email as owner_email,
  CONCAT(so.first_name, ' ', so.last_name) as owner_name,
  bi.verification_status,
  so.membership_type,
  count(DISTINCT s.id) as total_spaces,
  count(DISTINCT b.id) as total_bookings,
  COALESCE(sum(b.owner_payout), 0) as total_revenue,
  COALESCE(avg(r.rating), 0) as average_rating,
  bb.current_balance,
  bb.total_earned,
  bb.pending_amount
FROM space_owner_business_info bi
JOIN space_owners so ON bi.space_owner_id = so.id
LEFT JOIN business_balances bb ON bi.id = bb.business_id
LEFT JOIN spaces s ON bi.id = s.business_id
LEFT JOIN bookings b ON s.id = b.space_id AND b.status = 'completed'
LEFT JOIN reviews r ON s.id = r.space_id
GROUP BY bi.id, bi.business_name, so.email, so.first_name, so.last_name, 
         bi.verification_status, so.membership_type, bb.current_balance, bb.total_earned, bb.pending_amount;

-- =============================================
-- 1. UPDATE RAW_APP_META_DATA FUNCTION & TRIGGERS
-- =============================================

-- Function to update raw_app_meta_data in auth.users
CREATE OR REPLACE FUNCTION update_auth_raw_user_meta_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Update raw_app_meta_data based on which table triggered the function
  IF TG_TABLE_NAME = 'admins' THEN
    -- Update auth.users with admin_id
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('admin_id', NEW.id::text)
    WHERE id = NEW.auth_id;
    
  ELSIF TG_TABLE_NAME = 'space_owners' THEN
    -- Update auth.users with space_owner_id
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('space_owner_id', NEW.id::text)
    WHERE id = NEW.auth_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updating metadata on insert
CREATE TRIGGER trigger_update_admin_metadata
  AFTER INSERT ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_raw_user_meta_data();

CREATE TRIGGER trigger_update_space_owner_metadata
  AFTER INSERT ON public.space_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_raw_user_meta_data();

-- =============================================
-- 2. SYNC BALANCE FUNCTION (CRON JOB)
-- =============================================

-- Function to sync business balances
CREATE OR REPLACE FUNCTION sync_business_balances()
RETURNS void AS $$
DECLARE
  business_rec RECORD;
  monthly_earnings DECIMAL(12, 2);
  total_earnings DECIMAL(12, 2);
  total_payouts DECIMAL(12, 2);
  pending_earnings DECIMAL(12, 2);
  commission_total DECIMAL(12, 2);
  tax_total DECIMAL(12, 2);
  current_month_start DATE;
BEGIN
  -- Get the first day of current month
  current_month_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  -- Loop through all businesses that have spaces
  FOR business_rec IN 
    SELECT DISTINCT bi.id as business_id
    FROM space_owner_business_info bi
    WHERE EXISTS (SELECT 1 FROM spaces s WHERE s.business_id = bi.id)
  LOOP
    
    -- Calculate monthly earnings (current month from completed bookings)
    SELECT COALESCE(SUM(b.owner_payout), 0)
    INTO monthly_earnings
    FROM bookings b
    JOIN spaces s ON b.space_id = s.id
    WHERE s.business_id = business_rec.business_id
      AND b.status = 'completed'
      AND b.created_at >= current_month_start
      AND b.created_at < (current_month_start + INTERVAL '1 month');
    
    -- Calculate total lifetime earnings
    SELECT COALESCE(SUM(b.owner_payout), 0)
    INTO total_earnings
    FROM bookings b
    JOIN spaces s ON b.space_id = s.id
    WHERE s.business_id = business_rec.business_id
      AND b.status = 'completed';
    
    -- Calculate total payouts made to business
    SELECT COALESCE(SUM(sop.net_amount), 0)
    INTO total_payouts
    FROM space_owner_payments sop
    WHERE sop.business_id = business_rec.business_id
      AND sop.payout_status = 'completed';
    
    -- Calculate pending earnings (completed bookings not yet paid out)
    SELECT COALESCE(SUM(b.owner_payout), 0)
    INTO pending_earnings
    FROM bookings b
    JOIN spaces s ON b.space_id = s.id
    LEFT JOIN space_owner_payments sop ON business_rec.business_id = sop.business_id 
      AND b.id = ANY(sop.booking_ids)
      AND sop.payout_status = 'completed'
    WHERE s.business_id = business_rec.business_id
      AND b.status = 'completed'
      AND sop.id IS NULL; -- Bookings not yet paid out
    
    -- Calculate total commission deducted
    SELECT COALESCE(SUM(sop.commission_deducted), 0)
    INTO commission_total
    FROM space_owner_payments sop
    WHERE sop.business_id = business_rec.business_id
      AND sop.payout_status = 'completed';
    
    -- Calculate total tax deducted
    SELECT COALESCE(SUM(sop.tax_deducted), 0)
    INTO tax_total
    FROM space_owner_payments sop
    WHERE sop.business_id = business_rec.business_id
      AND sop.payout_status = 'completed';
    
    -- Upsert business balance record
    INSERT INTO business_balances (
      business_id,
      current_balance,
      total_earned,
      total_withdrawn,
      pending_amount,
      commission_deducted,
      tax_deducted,
      last_payout_date,
      updated_at
    )
    VALUES (
      business_rec.business_id,
      monthly_earnings, -- Current month earnings as current balance
      total_earnings,
      total_payouts,
      pending_earnings,
      commission_total,
      tax_total,
      (SELECT MAX(processed_at) FROM space_owner_payments 
       WHERE business_id = business_rec.business_id AND payout_status = 'completed'),
      now()
    )
    ON CONFLICT (business_id) DO UPDATE SET
      current_balance = EXCLUDED.current_balance,
      total_earned = EXCLUDED.total_earned,
      total_withdrawn = EXCLUDED.total_withdrawn,
      pending_amount = EXCLUDED.pending_amount,
      commission_deducted = EXCLUDED.commission_deducted,
      tax_deducted = EXCLUDED.tax_deducted,
      last_payout_date = EXCLUDED.last_payout_date,
      updated_at = EXCLUDED.updated_at;
      
  END LOOP;
  
  RAISE NOTICE 'Business balances synced successfully at %', now();
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly balances on 1st of every month
CREATE OR REPLACE FUNCTION reset_monthly_balances()
RETURNS void AS $$
BEGIN
  -- Reset current_balance to 0 for all businesses on 1st of month
  -- This happens automatically when sync_business_balances runs as it calculates current month
  
  -- Log the reset
  RAISE NOTICE 'Monthly balance reset completed at %', now();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. SPACE AVAILABILITY UPDATE FUNCTION & TRIGGER
-- =============================================

-- Function to update space availability when booking is made
CREATE OR REPLACE FUNCTION update_space_availability()
RETURNS TRIGGER AS $$
DECLARE
  space_total_seats INTEGER;
  conflicting_bookings_seats INTEGER;
BEGIN
  -- Get total seats for the space
  SELECT total_seats INTO space_total_seats
  FROM spaces 
  WHERE id = NEW.space_id;
  
  -- Calculate total seats booked for the same space, date, and overlapping time
  SELECT COALESCE(SUM(seats_booked), 0) INTO conflicting_bookings_seats
  FROM bookings 
  WHERE space_id = NEW.space_id
    AND date = NEW.date
    AND status IN ('confirmed', 'pending') -- Don't count cancelled/completed
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid) -- Exclude current booking if update
    AND (
      -- Check for time overlap
      (start_time < NEW.end_time AND end_time > NEW.start_time)
    );
  
  -- Add current booking seats to the conflicting total
  conflicting_bookings_seats := conflicting_bookings_seats + NEW.seats_booked;
  
  -- Update available seats
  UPDATE spaces 
  SET available_seats = space_total_seats - conflicting_bookings_seats,
      updated_at = now()
  WHERE id = NEW.space_id;
  
  -- Update total_bookings and revenue if booking is confirmed/completed
  IF NEW.status IN ('confirmed', 'completed') THEN
    UPDATE spaces 
    SET total_bookings = total_bookings + 1,
        revenue = revenue + NEW.total_amount,
        updated_at = now()
    WHERE id = NEW.space_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate space availability when booking status changes
CREATE OR REPLACE FUNCTION recalculate_space_availability()
RETURNS TRIGGER AS $$
DECLARE
  space_total_seats INTEGER;
  total_booked_seats INTEGER;
BEGIN
  -- Get total seats for the space
  SELECT total_seats INTO space_total_seats
  FROM spaces 
  WHERE id = COALESCE(NEW.space_id, OLD.space_id);
  
  -- Recalculate total booked seats for all active bookings
  SELECT COALESCE(SUM(seats_booked), 0) INTO total_booked_seats
  FROM bookings 
  WHERE space_id = COALESCE(NEW.space_id, OLD.space_id)
    AND date >= CURRENT_DATE -- Only future and today's bookings
    AND status IN ('confirmed', 'pending'); -- Active bookings only
  
  -- Update available seats (simplified - just current availability)
  UPDATE spaces 
  SET available_seats = GREATEST(0, space_total_seats - total_booked_seats),
      updated_at = now()
  WHERE id = COALESCE(NEW.space_id, OLD.space_id);
  
  -- Handle revenue updates
  IF TG_OP = 'UPDATE' THEN
    -- Adjust revenue if status changed
    IF OLD.status != NEW.status THEN
      IF NEW.status IN ('confirmed', 'completed') AND OLD.status NOT IN ('confirmed', 'completed') THEN
        -- Booking became active - add revenue
        UPDATE spaces 
        SET total_bookings = total_bookings + 1,
            revenue = revenue + NEW.total_amount
        WHERE id = NEW.space_id;
      ELSIF OLD.status IN ('confirmed', 'completed') AND NEW.status NOT IN ('confirmed', 'completed') THEN
        -- Booking became inactive - subtract revenue
        UPDATE spaces 
        SET total_bookings = GREATEST(0, total_bookings - 1),
            revenue = GREATEST(0, revenue - OLD.total_amount)
        WHERE id = OLD.space_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Booking deleted - subtract revenue if it was active
    IF OLD.status IN ('confirmed', 'completed') THEN
      UPDATE spaces 
      SET total_bookings = GREATEST(0, total_bookings - 1),
          revenue = GREATEST(0, revenue - OLD.total_amount)
      WHERE id = OLD.space_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for space availability management
CREATE TRIGGER trigger_update_space_availability_on_insert
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_space_availability();

CREATE TRIGGER trigger_recalculate_space_availability_on_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_space_availability();

CREATE TRIGGER trigger_recalculate_space_availability_on_delete
  AFTER DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_space_availability();

-- =============================================
-- 4. UTILITY FUNCTIONS FOR CRON SCHEDULING
-- =============================================

-- Function to be called by cron daily to sync balances
CREATE OR REPLACE FUNCTION daily_balance_sync()
RETURNS void AS $$
BEGIN
  PERFORM sync_business_balances();
  
  -- Reset monthly balances on 1st of each month
  IF EXTRACT(day FROM CURRENT_DATE) = 1 THEN
    PERFORM reset_monthly_balances();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to manually trigger balance sync (for testing)
CREATE OR REPLACE FUNCTION manual_balance_sync()
RETURNS TABLE(
  business_id UUID,
  business_name TEXT,
  current_balance DECIMAL(12,2),
  total_earned DECIMAL(12,2),
  pending_amount DECIMAL(12,2)
) AS $$
BEGIN
  -- Run the sync
  PERFORM sync_business_balances();
  
  -- Return current state
  RETURN QUERY
  SELECT 
    bb.business_id,
    bi.business_name,
    bb.current_balance,
    bb.total_earned,
    bb.pending_amount
  FROM business_balances bb
  JOIN space_owner_business_info bi ON bb.business_id = bi.id
  ORDER BY bb.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. CRON JOB SETUP (PostgreSQL with pg_cron extension)
-- =============================================

-- Enable pg_cron extension (run as superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily balance sync at 2 AM
SELECT cron.schedule('daily-balance-sync', '0 2 * * *', 'SELECT daily_balance_sync();');

-- =============================================
-- COMMENTS AND USAGE
-- =============================================

-- =============================================
-- FALLBACK PAYMENT TABLE FOR FAILED/ISSUE PAYMENTS
-- =============================================

-- Table to store payment issues and fallback data
CREATE TABLE public.payment_fallback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  razorpay_payment_id VARCHAR(50),
  razorpay_order_id VARCHAR(50),
  webhook_event_id VARCHAR(100),                 -- Razorpay webhook event ID
  event_type VARCHAR(50),                        -- payment.authorized, payment.failed, etc.
  amount DECIMAL(10, 2) NOT NULL,
  currency CHAR(3) DEFAULT 'INR',
  payment_status VARCHAR(20),                    -- Status from webhook
  gateway_response JSONB,                        -- Full webhook payload
  error_code VARCHAR(50),                        -- Error code if payment failed
  error_description TEXT,                        -- Human readable error
  failure_reason TEXT,                           -- Detailed failure reason
  retry_count INTEGER DEFAULT 0,                 -- Number of retry attempts
  is_resolved BOOLEAN DEFAULT false,             -- Whether issue was resolved
  resolved_at TIMESTAMPTZ,                       -- When it was resolved
  resolved_by UUID REFERENCES admins(id),       -- Admin who resolved it
  notes TEXT,                                    -- Admin notes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payment_fallback_amount_check CHECK (amount > 0),
  CONSTRAINT payment_fallback_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT payment_fallback_retry_check CHECK (retry_count >= 0)
);

-- Indexes for fallback table
CREATE INDEX idx_payment_fallback_booking_id ON payment_fallback(booking_id);
CREATE INDEX idx_payment_fallback_razorpay_payment_id ON payment_fallback(razorpay_payment_id);
CREATE INDEX idx_payment_fallback_status ON payment_fallback(payment_status);
CREATE INDEX idx_payment_fallback_resolved ON payment_fallback(is_resolved);
CREATE INDEX idx_payment_fallback_created ON payment_fallback(created_at);

-- =============================================
-- 1. USER SYNC FUNCTIONS FROM AUTH.USERS
-- =============================================

-- Create trigger on auth.users for automatic sync
CREATE TRIGGER trigger_sync_user_from_auth
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_from_auth();

-- Manual sync function to sync all existing auth users
CREATE OR REPLACE FUNCTION manual_sync_all_users()
RETURNS TABLE(
  synced_count INTEGER,
  updated_count INTEGER,
  error_count INTEGER,
  errors TEXT[]
) AS $$
DECLARE
  sync_count INTEGER := 0;
  update_count INTEGER := 0;
  err_count INTEGER := 0;
  error_messages TEXT[] := ARRAY[]::TEXT[];
  auth_user RECORD;
BEGIN
  -- Loop through all auth users
  FOR auth_user IN 
    SELECT * FROM auth.users 
    ORDER BY created_at DESC
  LOOP
    BEGIN
      -- Trigger the sync function for each user
      PERFORM sync_user_from_auth() FROM (SELECT auth_user.*) t;
      
      -- Check if user was inserted or updated
      IF EXISTS(SELECT 1 FROM public.users WHERE auth_id = auth_user.id) THEN
        sync_count := sync_count + 1;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      err_count := err_count + 1;
      error_messages := array_append(error_messages, 
        'Error syncing user ' || auth_user.email || ': ' || SQLERRM);
    END;
  END LOOP;
  
  RETURN QUERY SELECT sync_count, update_count, err_count, error_messages;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. PAYMENT WEBHOOK RPC FUNCTION
-- =============================================

-- RPC function to handle successful payment webhooks
CREATE OR REPLACE FUNCTION handle_payment_webhook(
  webhook_data JSONB
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  booking_id UUID,
  payment_id UUID
) AS $$
DECLARE
  razorpay_payment_id VARCHAR(50);
  razorpay_order_id VARCHAR(50);
  webhook_event_id VARCHAR(100);
  event_type VARCHAR(50);
  payment_amount DECIMAL(10, 2);
  payment_currency VARCHAR(3);
  payment_status_value VARCHAR(20);
  booking_record RECORD;
  payment_record RECORD;
  space_owner_id UUID;
  commission_rate DECIMAL(5, 2);
  owner_payout_amount DECIMAL(10, 2);
  platform_commission_amount DECIMAL(10, 2);
  webhook_signature VARCHAR(200);
  is_signature_valid BOOLEAN := true; -- You should implement signature validation
BEGIN
  -- Extract webhook data
  BEGIN
    webhook_event_id := webhook_data->>'id';
    event_type := webhook_data->>'event';
    razorpay_payment_id := webhook_data->'payload'->'payment'->>'id';
    razorpay_order_id := webhook_data->'payload'->'payment'->>'order_id';
    payment_amount := (webhook_data->'payload'->'payment'->>'amount')::DECIMAL / 100; -- Razorpay amount is in paise
    payment_currency := UPPER(webhook_data->'payload'->'payment'->>'currency');
    payment_status_value := webhook_data->'payload'->'payment'->>'status';
    
    -- Validate required fields
    IF razorpay_payment_id IS NULL OR razorpay_order_id IS NULL THEN
      RAISE EXCEPTION 'Missing required payment identifiers';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log to fallback table
    INSERT INTO payment_fallback (
      webhook_event_id,
      event_type,
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      currency,
      payment_status,
      gateway_response,
      error_description,
      failure_reason
    ) VALUES (
      webhook_event_id,
      COALESCE(event_type, 'unknown'),
      razorpay_payment_id,
      razorpay_order_id,
      COALESCE(payment_amount, 0),
      COALESCE(payment_currency, 'INR'),
      payment_status_value,
      webhook_data,
      'Webhook data parsing error',
      SQLERRM
    );
    
    RETURN QUERY SELECT false, 'Invalid webhook data: ' || SQLERRM, NULL::UUID, NULL::UUID;
    RETURN;
  END;
  
  -- Find booking by payment ID or order ID
  SELECT bp.*, b.id as booking_id, b.user_id, b.space_id, b.total_amount, b.status as booking_status
  INTO payment_record
  FROM booking_payments bp
  JOIN bookings b ON bp.booking_id = b.id
  WHERE bp.razorpay_payment_id = razorpay_payment_id 
     OR bp.razorpay_order_id = razorpay_order_id
  ORDER BY bp.created_at DESC
  LIMIT 1;
  
  -- If payment not found, log to fallback
  IF payment_record.id IS NULL THEN
    INSERT INTO payment_fallback (
      webhook_event_id,
      event_type,
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      currency,
      payment_status,
      gateway_response,
      error_description,
      failure_reason
    ) VALUES (
      webhook_event_id,
      event_type,
      razorpay_payment_id,
      razorpay_order_id,
      payment_amount,
      payment_currency,
      payment_status_value,
      webhook_data,
      'Payment record not found',
      'No matching booking_payment found for payment_id: ' || razorpay_payment_id
    );
    
    RETURN QUERY SELECT false, 'Payment record not found', NULL::UUID, NULL::UUID;
    RETURN;
  END IF;
  
  -- Handle different event types
  IF event_type = 'payment.authorized' AND payment_status_value = 'authorized' THEN
    -- Payment successful - update payment status
    UPDATE booking_payments 
    SET 
      status = 'completed',
      gateway_response = webhook_data,
      updated_at = now()
    WHERE id = payment_record.id;
    
    -- Get commission rate for the space owner
    SELECT so.commission_rate 
    INTO commission_rate
    FROM spaces s
    JOIN space_owner_business_info bi ON s.business_id = bi.id
    JOIN space_owners so ON bi.space_owner_id = so.id
    WHERE s.id = payment_record.space_id;
    
    commission_rate := COALESCE(commission_rate, 10.00); -- Default 10%
    
    -- Calculate owner payout and platform commission
    platform_commission_amount := (payment_amount * commission_rate) / 100;
    owner_payout_amount := payment_amount - platform_commission_amount;
    
    -- Update booking status and payout amounts
    UPDATE bookings 
    SET 
      status = 'confirmed',
      owner_payout = owner_payout_amount,
      platform_commission = platform_commission_amount,
      updated_at = now()
    WHERE id = payment_record.booking_id;
    
    RETURN QUERY SELECT true, 'Payment processed successfully', 
                        payment_record.booking_id::UUID, 
                        payment_record.id::UUID;
                        
  ELSIF event_type = 'payment.failed' OR payment_status_value IN ('failed', 'cancelled') THEN
    -- Payment failed
    UPDATE booking_payments 
    SET 
      status = 'failed',
      gateway_response = webhook_data,
      updated_at = now()
    WHERE id = payment_record.id;
    
    UPDATE bookings 
    SET 
      status = 'cancelled',
      updated_at = now()
    WHERE id = payment_record.booking_id;
    
    -- Log to fallback for tracking
    INSERT INTO payment_fallback (
      booking_id,
      webhook_event_id,
      event_type,
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      currency,
      payment_status,
      gateway_response,
      error_description,
      failure_reason
    ) VALUES (
      payment_record.booking_id,
      webhook_event_id,
      event_type,
      razorpay_payment_id,
      razorpay_order_id,
      payment_amount,
      payment_currency,
      payment_status_value,
      webhook_data,
      'Payment failed',
      webhook_data->'payload'->'payment'->>'error_description'
    );
    
    RETURN QUERY SELECT false, 'Payment failed', 
                        payment_record.booking_id::UUID, 
                        payment_record.id::UUID;
                        
  ELSE
    -- Unknown or unhandled event
    INSERT INTO payment_fallback (
      booking_id,
      webhook_event_id,
      event_type,
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      currency,
      payment_status,
      gateway_response,
      error_description,
      failure_reason
    ) VALUES (
      payment_record.booking_id,
      webhook_event_id,
      event_type,
      razorpay_payment_id,
      razorpay_order_id,
      payment_amount,
      payment_currency,
      payment_status_value,
      webhook_data,
      'Unhandled webhook event',
      'Event type: ' || event_type || ', Status: ' || payment_status_value
    );
    
    RETURN QUERY SELECT false, 'Unhandled webhook event: ' || event_type, 
                        payment_record.booking_id::UUID, 
                        payment_record.id::UUID;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- Catch-all error handling
  INSERT INTO payment_fallback (
    webhook_event_id,
    event_type,
    razorpay_payment_id,
    razorpay_order_id,
    amount,
    currency,
    payment_status,
    gateway_response,
    error_description,
    failure_reason
  ) VALUES (
    webhook_event_id,
    COALESCE(event_type, 'unknown'),
    razorpay_payment_id,
    razorpay_order_id,
    COALESCE(payment_amount, 0),
    COALESCE(payment_currency, 'INR'),
    payment_status_value,
    webhook_data,
    'Function execution error',
    SQLERRM
  );
  
  RETURN QUERY SELECT false, 'Internal error: ' || SQLERRM, NULL::UUID, NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UTILITY FUNCTIONS FOR PAYMENT MANAGEMENT
-- =============================================

-- Function to retry failed payments from fallback table
CREATE OR REPLACE FUNCTION retry_failed_payment(fallback_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  retry_count INTEGER
) AS $$
DECLARE
  fallback_record RECORD;
  retry_result RECORD;
BEGIN
  -- Get fallback record
  SELECT * INTO fallback_record
  FROM payment_fallback
  WHERE id = fallback_id AND is_resolved = false;
  
  IF fallback_record.id IS NULL THEN
    RETURN QUERY SELECT false, 'Fallback record not found or already resolved', 0;
    RETURN;
  END IF;
  
  -- Increment retry count
  UPDATE payment_fallback 
  SET retry_count = retry_count + 1, updated_at = now()
  WHERE id = fallback_id;
  
  -- Attempt to reprocess the webhook
  SELECT * INTO retry_result
  FROM handle_payment_webhook(fallback_record.gateway_response)
  LIMIT 1;
  
  -- If successful, mark as resolved
  IF retry_result.success THEN
    UPDATE payment_fallback 
    SET 
      is_resolved = true,
      resolved_at = now(),
      notes = 'Resolved via retry function',
      updated_at = now()
    WHERE id = fallback_id;
  END IF;
  
  RETURN QUERY SELECT 
    retry_result.success, 
    retry_result.message, 
    fallback_record.retry_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to manually resolve a fallback payment issue
CREATE OR REPLACE FUNCTION resolve_payment_fallback(
  fallback_id UUID,
  admin_id UUID,
  resolution_notes TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Check if fallback exists
  IF NOT EXISTS(SELECT 1 FROM payment_fallback WHERE id = fallback_id) THEN
    RETURN QUERY SELECT false, 'Fallback record not found';
    RETURN;
  END IF;
  
  -- Check if admin exists
  IF NOT EXISTS(SELECT 1 FROM admins WHERE id = admin_id AND is_active = true) THEN
    RETURN QUERY SELECT false, 'Invalid admin ID';
    RETURN;
  END IF;
  
  -- Mark as resolved
  UPDATE payment_fallback 
  SET 
    is_resolved = true,
    resolved_at = now(),
    resolved_by = admin_id,
    notes = resolution_notes,
    updated_at = now()
  WHERE id = fallback_id;
  
  RETURN QUERY SELECT true, 'Payment fallback resolved successfully';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS FOR MONITORING AND REPORTING
-- =============================================

-- View for payment fallback dashboard
CREATE VIEW public.payment_fallback_dashboard AS
SELECT
  pf.id,
  pf.booking_id,
  b.booking_reference,
  u.email as user_email,
  CONCAT(u.first_name, ' ', u.last_name) as user_name,
  pf.razorpay_payment_id,
  pf.amount,
  pf.payment_status,
  pf.event_type,
  pf.error_description,
  pf.retry_count,
  pf.is_resolved,
  pf.resolved_at,
  CONCAT(admin_u.first_name, ' ', admin_u.last_name) as resolved_by_name,
  pf.created_at,
  DATE_PART('day', now() - pf.created_at) as days_old
FROM payment_fallback pf
LEFT JOIN bookings b ON pf.booking_id = b.id
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN admins a ON pf.resolved_by = a.id
LEFT JOIN users admin_u ON a.auth_id = admin_u.auth_id
ORDER BY pf.created_at DESC;

-- View for payment success rate monitoring
CREATE VIEW public.payment_success_metrics AS
SELECT
  DATE_TRUNC('day', bp.created_at) as payment_date,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN bp.status = 'completed' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN bp.status = 'failed' THEN 1 END) as failed_payments,
  COUNT(CASE WHEN pf.id IS NOT NULL THEN 1 END) as fallback_cases,
  ROUND(
    (COUNT(CASE WHEN bp.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
  ) as success_rate_percentage,
  SUM(CASE WHEN bp.status = 'completed' THEN bp.amount ELSE 0 END) as successful_amount,
  SUM(CASE WHEN bp.status = 'failed' THEN bp.amount ELSE 0 END) as failed_amount
FROM booking_payments bp
LEFT JOIN payment_fallback pf ON bp.razorpay_payment_id = pf.razorpay_payment_id
WHERE bp.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', bp.created_at)
ORDER BY payment_date DESC;

-- =============================================
-- COMMENTS AND USAGE EXAMPLES
-- =============================================

/*
USAGE EXAMPLES:

1. SYNC USERS FROM AUTH:
   -- Automatic sync via triggers (already enabled)
   
   -- Manual sync all users:
   SELECT * FROM manual_sync_all_users();
   
   -- Check sync status:
   SELECT COUNT(*) as auth_users FROM auth.users;
   SELECT COUNT(*) as synced_users FROM public.users;

2. HANDLE PAYMENT WEBHOOK:
   -- Example webhook call:
   SELECT * FROM handle_payment_webhook('{
     "id": "event_123",
     "event": "payment.authorized",
     "payload": {
       "payment": {
         "id": "pay_123",
         "order_id": "order_123",
         "amount": 50000,
         "currency": "INR",
         "status": "authorized"
       }
     }
   }'::jsonb);

3. MONITOR PAYMENT FALLBACKS:
   -- View all unresolved issues:
   SELECT * FROM payment_fallback_dashboard WHERE is_resolved = false;
   
   -- Retry a failed payment:
   SELECT * FROM retry_failed_payment('fallback-uuid-here');
   
   -- Manually resolve an issue:
   SELECT * FROM resolve_payment_fallback('fallback-uuid', 'admin-uuid', 'Manual resolution');

4. PAYMENT METRICS:
   -- View success rates:
   SELECT * FROM payment_success_metrics ORDER BY payment_date DESC LIMIT 7;
   
   -- Count unresolved issues:
   SELECT COUNT(*) FROM payment_fallback WHERE is_resolved = false;

MONITORING QUERIES:
- Unresolved payment issues: SELECT * FROM payment_fallback WHERE is_resolved = false;
- Recent webhook failures: SELECT * FROM payment_fallback WHERE created_at >= now() - interval '24 hours';

*/

-- =============================================
-- 7. SPACE OWNER ONBOARDING FUNCTION
-- =============================================

-- Function to handle complete space owner onboarding
CREATE OR REPLACE FUNCTION onboard_space_owner(onboarding_data JSONB)
RETURNS JSONB AS $$
DECLARE
  space_owner_record UUID;
  business_info_record UUID;
  payment_info_record UUID;
  user_auth_id UUID;
  user_email TEXT;
  user_first_name TEXT;
  user_last_name TEXT;
  user_phone TEXT;
  business_info JSONB;
  payment_info JSONB;
  result JSONB;
BEGIN
  -- Get current user's auth info
  user_auth_id := auth.uid();
  
  IF user_auth_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get user details from auth.users
  SELECT 
    email,
    raw_user_meta_data->>'first_name',
    raw_user_meta_data->>'last_name',
    phone
  INTO 
    user_email,
    user_first_name,
    user_last_name,
    user_phone
  FROM auth.users 
  WHERE id = user_auth_id;
  
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found in auth.users');
  END IF;
  
  -- Extract business and payment info from the input
  business_info := onboarding_data->'businessInfo';
  payment_info := onboarding_data->'paymentInfo';
  
  -- Validate required fields
  IF business_info IS NULL OR payment_info IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business info and payment info are required');
  END IF;
  
  BEGIN
    -- Insert into space_owners table
    INSERT INTO public.space_owners (
      auth_id,
      email,
      first_name,
      last_name,
      phone,
      onboarding_completed
    ) VALUES (
      user_auth_id,
      user_email,
      COALESCE(user_first_name, ''),
      COALESCE(user_last_name, ''),
      user_phone,
      true
    ) RETURNING id INTO space_owner_record;
    
    -- Insert into space_owner_business_info table
    INSERT INTO public.space_owner_business_info (
      space_owner_id,
      business_name,
      business_type,
      gst_number,
      pan_number,
      business_address,
      business_city,
      business_state,
      business_pincode
    ) VALUES (
      space_owner_record,
      business_info->>'companyName',
      business_info->>'businessType',
      business_info->>'gstNumber',
      business_info->>'panNumber',
      business_info->>'address',
      SPLIT_PART(business_info->>'address', ',', -2),  -- Extract city from address
      SPLIT_PART(business_info->>'address', ',', -1),  -- Extract state from address
      '000000'  -- Default pincode, should be extracted properly
    ) RETURNING id INTO business_info_record;
    
    -- Insert into space_owner_payment_info table
    INSERT INTO public.space_owner_payment_info (
      space_owner_id,
      bank_account_number,
      bank_ifsc_code,
      bank_account_holder_name,
      bank_name,
      upi_id
    ) VALUES (
      space_owner_record,
      payment_info->>'accountNumber',
      payment_info->>'ifscCode',
      payment_info->>'accountHolderName',
      payment_info->>'bankName',
      payment_info->>'upiId'
    ) RETURNING id INTO payment_info_record;
    
    -- Initialize business balance
    INSERT INTO public.business_balances (
      business_id,
      current_balance,
      total_earned,
      total_withdrawn,
      pending_amount
    ) VALUES (
      business_info_record,
      0.00,
      0.00,
      0.00,
      0.00
    );
    
    -- Update auth.users raw_app_meta_data with space_owner_id
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('space_owner_id', space_owner_record::text, 'owner_onboarded', true)
    WHERE id = user_auth_id;
    
    result := jsonb_build_object(
      'success', true,
      'space_owner_id', space_owner_record,
      'business_info_id', business_info_record,
      'payment_info_id', payment_info_record
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback any partial inserts and return error
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'detail', SQLSTATE
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
- Payment success rate: SELECT * FROM payment_success_metrics WHERE payment_date = current_date;
*/


