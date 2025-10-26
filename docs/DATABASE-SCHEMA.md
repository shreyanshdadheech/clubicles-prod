# Clubicles Database Schema Documentation

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Tables](#core-tables)
3. [VIBGYOR Integration](#vibgyor-integration)
4. [Row Level Security Policies](#row-level-security-policies)
5. [Database Functions & Triggers](#database-functions--triggers)
6. [Indexes & Performance](#indexes--performance)
7. [Migration Scripts](#migration-scripts)

---

## Schema Overview

The Clubicles database is built on PostgreSQL with Supabase, implementing a multi-tenant architecture using Row Level Security (RLS) policies. The schema supports three primary user types with complete data isolation.

### Database Statistics

- **Total Tables**: 20
- **Total Enums**: 8
- **Total Functions**: 5
- **Total Triggers**: 3
- **RLS Policies**: 25+

### Architecture Principles

1. **Multi-Tenancy**: Complete data isolation between user types
2. **Security-First**: RLS policies control all data access
3. **VIBGYOR Integration**: Professional tracking built into core schema
4. **Audit Trail**: Comprehensive tracking of all changes
5. **Performance**: Strategic indexes for common queries

---

## Core Tables

### Authentication & Users

#### `users` Table
```sql
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
    auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
    email varchar UNIQUE NOT NULL CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    first_name varchar,
    last_name varchar,
    phone varchar CHECK (
        phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'
    ),
    city varchar,
    professional_role professional_role, -- VIBGYOR enum
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Indexes
    INDEX idx_users_auth_id (auth_id),
    INDEX idx_users_email (email),
    INDEX idx_users_professional_role (professional_role),
    INDEX idx_users_city (city)
);
```

#### `space_owners` Table
```sql
CREATE TABLE space_owners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
    auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
    email varchar UNIQUE NOT NULL CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    first_name varchar,
    last_name varchar,
    phone varchar CHECK (
        phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'
    ),
    premium_plan premium_plan DEFAULT 'basic',
    is_active boolean NOT NULL DEFAULT true,
    onboarding_completed boolean NOT NULL DEFAULT false,
    commission_rate numeric DEFAULT 10.00 CHECK (
        commission_rate >= 0 AND commission_rate <= 100
    ),
    approval_status text NOT NULL DEFAULT 'pending' CHECK (
        approval_status IN ('approved', 'pending', 'rejected')
    ),
    plan_expiry_date timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Indexes
    INDEX idx_space_owners_auth_id (auth_id),
    INDEX idx_space_owners_approval_status (approval_status),
    INDEX idx_space_owners_plan_expiry (plan_expiry_date)
);
```

#### `admins` Table
```sql
CREATE TABLE admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL DEFAULT gen_random_uuid(),
    auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Indexes
    INDEX idx_admins_auth_id (auth_id)
);
```

### Business Information

#### `space_owner_business_info` Table
```sql
CREATE TABLE space_owner_business_info (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    space_owner_id uuid UNIQUE NOT NULL REFERENCES space_owners(id),
    business_name varchar NOT NULL,
    business_type varchar NOT NULL,
    gst_number varchar CHECK (
        gst_number IS NULL OR 
        gst_number ~ '^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$'
    ),
    pan_number varchar NOT NULL CHECK (
        pan_number ~ '^[A-Z]{5}\d{4}[A-Z]{1}$'
    ),
    business_address text NOT NULL,
    business_city varchar NOT NULL,
    business_state varchar NOT NULL,
    business_pincode varchar NOT NULL CHECK (
        business_pincode ~ '^\d{6}$'
    ),
    verification_status verification_status DEFAULT 'pending',
    verified_by uuid REFERENCES admins(id),
    verified_at timestamptz,
    rejection_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Indexes
    INDEX idx_business_info_owner_id (space_owner_id),
    INDEX idx_business_info_verification (verification_status),
    INDEX idx_business_info_city (business_city)
);
```

### Spaces & VIBGYOR

#### `spaces` Table (with VIBGYOR Integration)
```sql
CREATE TABLE spaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid NOT NULL REFERENCES space_owner_business_info(id),
    name varchar NOT NULL,
    description text NOT NULL,
    address text NOT NULL,
    city varchar NOT NULL,
    pincode varchar NOT NULL CHECK (pincode ~ '^\d{6}$'),
    latitude numeric,
    longitude numeric,
    location geometry(POINT, 4326) DEFAULT CASE
        WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
        THEN ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326)
        ELSE NULL
    END,
    total_seats integer NOT NULL,
    available_seats integer NOT NULL DEFAULT 0,
    price_per_hour numeric NOT NULL,
    price_per_day numeric NOT NULL,
    amenities text[] DEFAULT '{}',
    images text[] DEFAULT '{}',
    rating numeric DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_bookings integer DEFAULT 0,
    revenue numeric DEFAULT 0.0,
    operating_hours jsonb DEFAULT '{
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        "open": "09:00",
        "close": "18:00"
    }',
    
    -- VIBGYOR Columns
    violet integer DEFAULT 0,
    indigo integer DEFAULT 0,
    blue integer DEFAULT 0,
    green integer DEFAULT 0,
    yellow integer DEFAULT 0,
    orange integer DEFAULT 0,
    red integer DEFAULT 0,
    grey integer DEFAULT 0,
    white integer DEFAULT 0,
    black integer DEFAULT 0,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Indexes
    INDEX idx_spaces_business_id (business_id),
    INDEX idx_spaces_city (city),
    INDEX idx_spaces_location USING GIST (location),
    INDEX idx_spaces_price_hour (price_per_hour),
    INDEX idx_spaces_rating (rating),
    INDEX idx_spaces_vibgyor_composite (violet, indigo, blue, green, yellow)
);
```

### Bookings & Payments

#### `bookings` Table
```sql
CREATE TABLE bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    space_id uuid NOT NULL REFERENCES spaces(id),
    start_time time NOT NULL,
    end_time time NOT NULL,
    date date NOT NULL CHECK (
        date >= '2024-01-01' AND 
        date <= (CURRENT_DATE + INTERVAL '1 year')
    ),
    seats_booked integer NOT NULL CHECK (seats_booked > 0),
    base_amount numeric NOT NULL CHECK (base_amount > 0),
    tax_amount numeric DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount numeric NOT NULL CHECK (total_amount > 0),
    owner_payout numeric NOT NULL CHECK (owner_payout >= 0),
    platform_commission numeric DEFAULT 0 CHECK (platform_commission >= 0),
    status booking_status DEFAULT 'pending',
    payment_id varchar,
    booking_reference varchar UNIQUE DEFAULT (
        'BK' || EXTRACT(year FROM now()) || '-' || 
        LPAD(EXTRACT(doy FROM now())::text, 3, '0') || '-' ||
        LPAD(FLOOR(random() * 10000)::text, 4, '0')
    ),
    
    -- Redemption System
    redemption_code varchar UNIQUE DEFAULT (
        'RC' || EXTRACT(year FROM now()) || '-' || 
        LPAD(EXTRACT(doy FROM now())::text, 3, '0') || '-' ||
        LPAD(FLOOR(random() * 10000)::text, 4, '0')
    ),
    qr_code_data text,
    is_redeemed boolean NOT NULL DEFAULT false,
    redeemed_at timestamptz,
    redeemed_by uuid REFERENCES space_owners(id),
    
    -- VIBGYOR Tracking
    roles professional_role[], -- Array to support multiple roles
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Indexes
    INDEX idx_bookings_user_id (user_id),
    INDEX idx_bookings_space_id (space_id),
    INDEX idx_bookings_date (date),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_redemption_code (redemption_code),
    INDEX idx_bookings_booking_reference (booking_reference),
    INDEX idx_bookings_composite (space_id, date, start_time, end_time)
);
```

#### `booking_payments` Table
```sql
CREATE TABLE booking_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id),
    razorpay_payment_id varchar,
    razorpay_order_id varchar,
    amount numeric NOT NULL CHECK (amount > 0),
    currency char(3) DEFAULT 'INR' CHECK (currency ~ '^[A-Z]{3}$'),
    status payment_status DEFAULT 'pending',
    gateway_response jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Indexes
    INDEX idx_booking_payments_booking_id (booking_id),
    INDEX idx_booking_payments_razorpay_id (razorpay_payment_id),
    INDEX idx_booking_payments_status (status)
);
```

### Reviews & Ratings

#### `reviews` Table
```sql
CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    space_id uuid NOT NULL REFERENCES spaces(id),
    booking_id uuid UNIQUE NOT NULL REFERENCES bookings(id),
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Indexes
    INDEX idx_reviews_space_id (space_id),
    INDEX idx_reviews_user_id (user_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_booking_id (booking_id)
);
```

---

## VIBGYOR Integration

### Professional Role Enum
```sql
CREATE TYPE professional_role AS ENUM (
    'violet',   -- Visionaries & Venture Capitalists
    'indigo',   -- IT & Industrialists
    'blue',     -- Branding & Marketing
    'green',    -- Green Footprint & EV
    'yellow',   -- Young Entrepreneurs
    'orange',   -- Oracle of Bharat
    'red',      -- Real Estate & Recreationists
    'grey',     -- Nomads (Multi-talented)
    'white',    -- Policy Makers & Health Professionals
    'black'     -- Prefer Not to Say
);
```

### VIBGYOR Analytics View
```sql
CREATE VIEW vibgyor_analytics AS
SELECT 
    s.id as space_id,
    s.name as space_name,
    s.city,
    s.total_bookings,
    
    -- VIBGYOR Distribution
    s.violet,
    s.indigo,
    s.blue,
    s.green,
    s.yellow,
    s.orange,
    s.red,
    s.grey,
    s.white,
    s.black,
    
    -- Calculate percentages
    CASE WHEN s.total_bookings > 0 THEN
        ROUND((s.violet::numeric / s.total_bookings * 100), 2)
    ELSE 0 END as violet_percentage,
    
    CASE WHEN s.total_bookings > 0 THEN
        ROUND((s.indigo::numeric / s.total_bookings * 100), 2)
    ELSE 0 END as indigo_percentage,
    
    -- ... (similar for all colors)
    
    -- Most dominant professional type
    CASE 
        WHEN s.violet >= GREATEST(s.indigo, s.blue, s.green, s.yellow, s.orange, s.red, s.grey, s.white, s.black) THEN 'violet'
        WHEN s.indigo >= GREATEST(s.blue, s.green, s.yellow, s.orange, s.red, s.grey, s.white, s.black) THEN 'indigo'
        -- ... (continue for all colors)
        ELSE 'mixed'
    END as dominant_professional_type,
    
    -- Diversity score (0-1, higher = more diverse)
    1.0 - POWER(
        (s.violet::float / NULLIF(s.total_bookings, 0))::float, 2) - 
        POWER((s.indigo::float / NULLIF(s.total_bookings, 0))::float, 2)
        -- ... (continue for all colors)
    ) as diversity_score
    
FROM spaces s
WHERE s.total_bookings > 0;
```

### VIBGYOR Platform Analytics
```sql
CREATE VIEW platform_vibgyor_stats AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    
    -- Count by professional role
    COUNT(CASE WHEN u.professional_role = 'violet' THEN 1 END) as violet_users,
    COUNT(CASE WHEN u.professional_role = 'indigo' THEN 1 END) as indigo_users,
    COUNT(CASE WHEN u.professional_role = 'blue' THEN 1 END) as blue_users,
    COUNT(CASE WHEN u.professional_role = 'green' THEN 1 END) as green_users,
    COUNT(CASE WHEN u.professional_role = 'yellow' THEN 1 END) as yellow_users,
    COUNT(CASE WHEN u.professional_role = 'orange' THEN 1 END) as orange_users,
    COUNT(CASE WHEN u.professional_role = 'red' THEN 1 END) as red_users,
    COUNT(CASE WHEN u.professional_role = 'grey' THEN 1 END) as grey_users,
    COUNT(CASE WHEN u.professional_role = 'white' THEN 1 END) as white_users,
    COUNT(CASE WHEN u.professional_role = 'black' THEN 1 END) as black_users,
    
    -- Calculate percentages
    ROUND((COUNT(CASE WHEN u.professional_role = 'violet' THEN 1 END)::numeric / COUNT(u.id) * 100), 2) as violet_percentage
    -- ... (similar for all colors)
    
FROM users u
WHERE u.is_active = true;
```

---

## Row Level Security Policies

### Users Table Policies
```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth_id = auth.uid());
```

### Space Owners Policies
```sql
-- Space owners can see their own data
CREATE POLICY "Space owners can view own profile" ON space_owners
    FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY "Space owners can update own profile" ON space_owners
    FOR UPDATE USING (auth_id = auth.uid());

-- Space owners can see their spaces
CREATE POLICY "Owners can view own spaces" ON spaces
    FOR SELECT USING (
        business_id IN (
            SELECT sbi.id 
            FROM space_owner_business_info sbi
            JOIN space_owners so ON sbi.space_owner_id = so.id
            WHERE so.auth_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage own spaces" ON spaces
    FOR ALL USING (
        business_id IN (
            SELECT sbi.id 
            FROM space_owner_business_info sbi
            JOIN space_owners so ON sbi.space_owner_id = so.id
            WHERE so.auth_id = auth.uid()
        )
    );
```

### Bookings Policies
```sql
-- Users see their bookings, owners see bookings for their spaces
CREATE POLICY "Booking access policy" ON bookings
    FOR SELECT USING (
        -- User can see their own bookings
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
        OR
        -- Space owners can see bookings for their spaces
        space_id IN (
            SELECT s.id FROM spaces s
            JOIN space_owner_business_info sbi ON s.business_id = sbi.id
            JOIN space_owners so ON sbi.space_owner_id = so.id
            WHERE so.auth_id = auth.uid()
        )
    );

-- Only users can create bookings for themselves
CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Only space owners can update bookings for their spaces (for redemption)
CREATE POLICY "Owners can update space bookings" ON bookings
    FOR UPDATE USING (
        space_id IN (
            SELECT s.id FROM spaces s
            JOIN space_owner_business_info sbi ON s.business_id = sbi.id
            JOIN space_owners so ON sbi.space_owner_id = so.id
            WHERE so.auth_id = auth.uid()
        )
    );
```

### Public Access Policies
```sql
-- Allow public read access to spaces for browsing
CREATE POLICY "Public can view active spaces" ON spaces
    FOR SELECT USING (true);

-- Allow public read access to reviews
CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (true);
```

---

## Database Functions & Triggers

### VIBGYOR Update Function
```sql
CREATE OR REPLACE FUNCTION update_vibgyor_counters()
RETURNS TRIGGER AS $$
DECLARE
    user_role professional_role;
BEGIN
    -- Get user's professional role
    SELECT professional_role INTO user_role
    FROM users u
    WHERE u.id = NEW.user_id;
    
    -- Only update if booking is confirmed
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Update the corresponding VIBGYOR counter
        UPDATE spaces SET
            violet = violet + CASE WHEN user_role = 'violet' THEN 1 ELSE 0 END,
            indigo = indigo + CASE WHEN user_role = 'indigo' THEN 1 ELSE 0 END,
            blue = blue + CASE WHEN user_role = 'blue' THEN 1 ELSE 0 END,
            green = green + CASE WHEN user_role = 'green' THEN 1 ELSE 0 END,
            yellow = yellow + CASE WHEN user_role = 'yellow' THEN 1 ELSE 0 END,
            orange = orange + CASE WHEN user_role = 'orange' THEN 1 ELSE 0 END,
            red = red + CASE WHEN user_role = 'red' THEN 1 ELSE 0 END,
            grey = grey + CASE WHEN user_role = 'grey' THEN 1 ELSE 0 END,
            white = white + CASE WHEN user_role = 'white' THEN 1 ELSE 0 END,
            black = black + CASE WHEN user_role = 'black' THEN 1 ELSE 0 END,
            total_bookings = total_bookings + 1,
            updated_at = now()
        WHERE id = NEW.space_id;
        
        -- Store the role in the booking for future reference
        NEW.roles = ARRAY[user_role];
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER vibgyor_booking_trigger
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_vibgyor_counters();
```

### Booking Reference Generator
```sql
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL THEN
        NEW.booking_reference := 'BK' || 
            EXTRACT(year FROM now())::text || '-' ||
            LPAD(EXTRACT(doy FROM now())::text, 3, '0') || '-' ||
            LPAD(FLOOR(random() * 10000)::text, 4, '0');
    END IF;
    
    IF NEW.redemption_code IS NULL THEN
        NEW.redemption_code := 'RC' || 
            EXTRACT(year FROM now())::text || '-' ||
            LPAD(EXTRACT(doy FROM now())::text, 3, '0') || '-' ||
            LPAD(FLOOR(random() * 10000)::text, 4, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_booking_codes_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_reference();
```

### Revenue Calculation Function
```sql
CREATE OR REPLACE FUNCTION calculate_booking_revenue(
    p_base_amount numeric,
    p_space_id uuid
) RETURNS TABLE(
    base_amount numeric,
    tax_amount numeric,
    total_amount numeric,
    owner_payout numeric,
    platform_commission numeric
) AS $$
DECLARE
    v_tax_rate numeric := 0;
    v_commission_rate numeric := 10;
BEGIN
    -- Get applicable tax rate
    SELECT COALESCE(SUM(tc.percentage), 0) INTO v_tax_rate
    FROM tax_configurations tc
    WHERE tc.is_enabled = true 
    AND tc.applies_to IN ('booking', 'both');
    
    -- Get commission rate for this space's owner
    SELECT COALESCE(so.commission_rate, 10) INTO v_commission_rate
    FROM spaces s
    JOIN space_owner_business_info sbi ON s.business_id = sbi.id
    JOIN space_owners so ON sbi.space_owner_id = so.id
    WHERE s.id = p_space_id;
    
    -- Calculate amounts
    base_amount := p_base_amount;
    tax_amount := ROUND(base_amount * v_tax_rate / 100, 2);
    total_amount := base_amount + tax_amount;
    platform_commission := ROUND(base_amount * v_commission_rate / 100, 2);
    owner_payout := base_amount - platform_commission;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
```

---

## Indexes & Performance

### Strategic Indexes
```sql
-- User lookup performance
CREATE INDEX CONCURRENTLY idx_users_auth_lookup ON users (auth_id, is_active);
CREATE INDEX CONCURRENTLY idx_users_professional_city ON users (professional_role, city) 
    WHERE is_active = true;

-- Space search performance
CREATE INDEX CONCURRENTLY idx_spaces_search ON spaces (city, price_per_hour, rating)
    WHERE total_seats > available_seats;
CREATE INDEX CONCURRENTLY idx_spaces_location_search ON spaces 
    USING GIST (location) WHERE location IS NOT NULL;

-- Booking performance
CREATE INDEX CONCURRENTLY idx_bookings_time_search ON bookings 
    (space_id, date, start_time, end_time, status);
CREATE INDEX CONCURRENTLY idx_bookings_user_recent ON bookings 
    (user_id, created_at DESC) WHERE status IN ('confirmed', 'completed');

-- Analytics performance
CREATE INDEX CONCURRENTLY idx_bookings_vibgyor_analytics ON bookings 
    (space_id, status, created_at) WHERE status = 'confirmed';
CREATE INDEX CONCURRENTLY idx_spaces_vibgyor_totals ON spaces 
    (city, total_bookings DESC) WHERE total_bookings > 0;

-- Revenue calculations
CREATE INDEX CONCURRENTLY idx_bookings_revenue ON bookings 
    (space_id, date, total_amount) WHERE status = 'confirmed';
```

### Composite Indexes for Complex Queries
```sql
-- Space owner dashboard queries
CREATE INDEX CONCURRENTLY idx_owner_dashboard_composite ON bookings 
    (space_id, status, date DESC, created_at DESC);

-- Admin analytics queries
CREATE INDEX CONCURRENTLY idx_admin_analytics ON bookings 
    (status, created_at) WHERE status IN ('confirmed', 'completed');

-- VIBGYOR distribution queries
CREATE INDEX CONCURRENTLY idx_vibgyor_distribution ON spaces 
    (city, violet DESC, indigo DESC, blue DESC, green DESC, yellow DESC);
```

---

## Migration Scripts

### Initial Schema Setup
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums
CREATE TYPE professional_role AS ENUM (
    'violet', 'indigo', 'blue', 'green', 'yellow', 
    'orange', 'red', 'grey', 'white', 'black'
);

CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'completed', 'cancelled', 'refunded'
);

CREATE TYPE payment_status AS ENUM (
    'pending', 'successful', 'failed', 'refunded'
);

CREATE TYPE verification_status AS ENUM (
    'pending', 'approved', 'rejected'
);

CREATE TYPE premium_plan AS ENUM (
    'basic', 'premium'
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)
```

### VIBGYOR Migration
```sql
-- Add VIBGYOR columns to existing spaces
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS violet integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS indigo integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS blue integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS green integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS yellow integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS orange integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS red integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS grey integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS white integer DEFAULT 0;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS black integer DEFAULT 0;

-- Backfill VIBGYOR data from existing bookings
UPDATE spaces SET 
    violet = (
        SELECT COUNT(*) FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.space_id = spaces.id 
        AND b.status = 'confirmed'
        AND u.professional_role = 'violet'
    ),
    indigo = (
        SELECT COUNT(*) FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.space_id = spaces.id 
        AND b.status = 'confirmed'
        AND u.professional_role = 'indigo'
    );
    -- ... (continue for all colors)
```

### Performance Optimization Migration
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_space_date 
    ON bookings (space_id, date, status);

-- Update statistics
ANALYZE users;
ANALYZE spaces;
ANALYZE bookings;

-- Vacuum for better performance
VACUUM ANALYZE;
```

This comprehensive database schema documentation covers all aspects of the Clubicles database design, from core tables to the unique VIBGYOR integration system.