-- Add redemption columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN redemption_code VARCHAR(20) UNIQUE DEFAULT 
  'RC' || EXTRACT(year FROM now()) || '-' || 
  LPAD(EXTRACT(doy FROM now())::text, 3, '0') || '-' ||
  LPAD(FLOOR(random() * 10000)::text, 4, '0'),
ADD COLUMN qr_code_data TEXT, -- Will store QR code data/URL
ADD COLUMN is_redeemed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN redeemed_at TIMESTAMPTZ,
ADD COLUMN redeemed_by UUID REFERENCES space_owners(id); -- Space owner who redeemed

-- Create index for redemption lookups
CREATE INDEX idx_bookings_redemption_code ON public.bookings(redemption_code);
CREATE INDEX idx_bookings_is_redeemed ON public.bookings(is_redeemed);

-- Update existing bookings to have redemption codes
UPDATE public.bookings 
SET redemption_code = 
  'RC' || EXTRACT(year FROM created_at) || '-' || 
  LPAD(EXTRACT(doy FROM created_at)::text, 3, '0') || '-' ||
  LPAD(FLOOR(random() * 10000)::text, 4, '0')
WHERE redemption_code IS NULL;