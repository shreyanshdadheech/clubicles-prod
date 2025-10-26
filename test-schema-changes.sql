-- Test the database schema changes
-- You can run these commands in your Supabase SQL editor

-- Check if redemption columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('redemption_code', 'qr_code_data', 'is_redeemed', 'redeemed_at', 'redeemed_by');

-- Check existing bookings structure
SELECT id, status, redemption_code, is_redeemed, created_at 
FROM bookings 
LIMIT 5;

-- If columns don't exist, run these ALTER statements:
/*
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS redemption_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS is_redeemed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS redeemed_by UUID REFERENCES space_owners(id);

-- Generate redemption codes for existing bookings
UPDATE public.bookings 
SET redemption_code = 
  'RC' || EXTRACT(year FROM created_at) || '-' || 
  LPAD(EXTRACT(doy FROM created_at)::text, 3, '0') || '-' ||
  LPAD(FLOOR(random() * 10000)::text, 4, '0')
WHERE redemption_code IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_redemption_code ON public.bookings(redemption_code);
CREATE INDEX IF NOT EXISTS idx_bookings_is_redeemed ON public.bookings(is_redeemed);
*/