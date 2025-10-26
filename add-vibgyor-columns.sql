-- Add VIBGYOR counter columns to spaces table
ALTER TABLE public.spaces 
ADD COLUMN IF NOT EXISTS violet INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS indigo INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS blue INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS green INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS yellow INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS orange INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS red INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS grey INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS white INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS black INTEGER DEFAULT 0;

-- Add constraints to ensure counters are non-negative
ALTER TABLE public.spaces 
ADD CONSTRAINT IF NOT EXISTS check_violet_non_negative CHECK (violet >= 0),
ADD CONSTRAINT IF NOT EXISTS check_indigo_non_negative CHECK (indigo >= 0),
ADD CONSTRAINT IF NOT EXISTS check_blue_non_negative CHECK (blue >= 0),
ADD CONSTRAINT IF NOT EXISTS check_green_non_negative CHECK (green >= 0),
ADD CONSTRAINT IF NOT EXISTS check_yellow_non_negative CHECK (yellow >= 0),
ADD CONSTRAINT IF NOT EXISTS check_orange_non_negative CHECK (orange >= 0),
ADD CONSTRAINT IF NOT EXISTS check_red_non_negative CHECK (red >= 0),
ADD CONSTRAINT IF NOT EXISTS check_grey_non_negative CHECK (grey >= 0),
ADD CONSTRAINT IF NOT EXISTS check_white_non_negative CHECK (white >= 0),
ADD CONSTRAINT IF NOT EXISTS check_black_non_negative CHECK (black >= 0);
