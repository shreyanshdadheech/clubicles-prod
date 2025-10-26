-- Fix for user paaji@gmail.com who exists in auth but not in space_owners table
-- Run this in the Supabase SQL editor

-- First, verify the user exists in auth.users
-- (This query may not work due to RLS, but we know the user exists from frontend logs)

-- Create the missing space_owners record
INSERT INTO public.space_owners (
    auth_id,
    email,
    first_name,
    last_name,
    phone,
    avatar_url,
    membership_type,
    premium_plan,
    is_active,
    onboarding_completed,
    commission_rate,
    created_at,
    updated_at
) VALUES (
    '5bbe8666-9251-4981-b42d-69e263148930',  -- auth_id from console logs
    'paaji@gmail.com',                        -- email
    '',                                       -- first_name (empty for now)
    '',                                       -- last_name (empty for now)
    NULL,                                     -- phone
    NULL,                                     -- avatar_url
    'grey',                                   -- default membership_type
    'basic',                                  -- default premium_plan
    true,                                     -- is_active
    false,                                    -- onboarding_completed (user can complete later)
    10.00,                                    -- default commission_rate
    now(),                                    -- created_at
    now()                                     -- updated_at
) ON CONFLICT (auth_id) DO NOTHING;          -- Don't insert if already exists

-- Verify the record was created
SELECT 
    id, 
    auth_id, 
    email, 
    membership_type, 
    premium_plan,
    onboarding_completed,
    created_at
FROM public.space_owners 
WHERE email = 'paaji@gmail.com' OR auth_id = '5bbe8666-9251-4981-b42d-69e263148930';
