-- ========================================
-- POTENTIAL FIXES FOR AUTH.USERS TRIGGER ISSUES
-- ========================================

-- COMMON ISSUE 1: Disable problematic triggers temporarily
-- (Only run this if you find triggers that reference public.users)

-- List all triggers on auth.users first:
-- SELECT tg.tgname AS trigger_name, pg_get_triggerdef(tg.oid) AS definition
-- FROM pg_trigger tg
-- JOIN pg_class c ON tg.tgrelid = c.oid
-- JOIN pg_namespace n ON c.relnamespace = n.oid
-- WHERE n.nspname = 'auth' AND c.relname = 'users' AND NOT tg.tgisinternal;

-- If you find a problematic trigger, disable it temporarily:
-- ALTER TABLE auth.users DISABLE TRIGGER trigger_name_here;

-- COMMON ISSUE 2: Fix public.users table constraints
-- Make sure the public.users table can handle new auth users

-- Check if there are any NOT NULL constraints that might be causing issues
-- and make them nullable or provide defaults:

-- Example: If first_name is NOT NULL but auth users don't have it initially
-- ALTER TABLE public.users ALTER COLUMN first_name DROP NOT NULL;

-- Example: If roles column is NOT NULL but auth users don't have it initially  
-- ALTER TABLE public.users ALTER COLUMN roles SET DEFAULT 'user';

-- COMMON ISSUE 3: Fix unique constraint conflicts
-- Check if there are unique constraints causing conflicts

-- Example: If email is unique but auth users might have different email formats
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;

-- COMMON ISSUE 4: Create a proper trigger function that handles errors
-- This is a safer approach than disabling triggers

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users with proper error handling
  INSERT INTO public.users (
    auth_id,
    email,
    first_name,
    last_name,
    roles,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')::roles,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Failed to create public.users record for auth user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- COMMON ISSUE 5: Create a trigger that uses the safe function
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- COMMON ISSUE 6: Fix any existing data issues
-- Check for orphaned records or constraint violations

-- Find auth users without corresponding public.users records
-- SELECT au.id, au.email 
-- FROM auth.users au 
-- LEFT JOIN public.users pu ON au.id = pu.auth_id 
-- WHERE pu.auth_id IS NULL;

-- COMMON ISSUE 7: Ensure proper permissions
-- Make sure the auth role can insert into public.users

-- Grant necessary permissions
GRANT INSERT, UPDATE ON public.users TO auth;
GRANT USAGE ON SCHEMA public TO auth;
GRANT SELECT ON public.users TO auth;

-- COMMON ISSUE 8: Check for RLS policies that might be blocking inserts
-- Disable RLS temporarily if it's causing issues

-- Check if RLS is enabled on public.users
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'users';

-- If RLS is enabled and causing issues, you can temporarily disable it:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- COMMON ISSUE 9: Fix any enum type mismatches
-- Make sure the roles enum includes all possible values

-- Check current enum values
-- SELECT unnest(enum_range(NULL::roles));

-- Add missing enum values if needed
-- ALTER TYPE roles ADD VALUE IF NOT EXISTS 'user';
-- ALTER TYPE roles ADD VALUE IF NOT EXISTS 'owner';
-- ALTER TYPE roles ADD VALUE IF NOT EXISTS 'admin';

