-- ========================================
-- SIMPLE FIX FOR AUTH ERRORS
-- ========================================

-- Issue 1: Fix the "array_agg" error
-- This usually happens when array_agg is used outside of a proper aggregate context
-- Let's check for any problematic functions first

-- Check for functions that might be using array_agg incorrectly
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%array_agg%'
  AND n.nspname IN ('auth', 'public')
ORDER BY p.proname;

-- Issue 2: Fix the "role auth does not exist" error
-- The auth role should exist in Supabase, but let's check and fix permissions

-- Check if auth role exists
SELECT rolname FROM pg_roles WHERE rolname = 'auth';

-- If auth role doesn't exist, create it (this shouldn't happen in Supabase)
-- CREATE ROLE auth;

-- Grant necessary permissions to the service role instead
-- The service role key should have the necessary permissions
-- Let's grant permissions to the authenticated role

-- Grant permissions to authenticated role (this is what Supabase uses)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Also grant to anon role for public access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;

-- Issue 3: Check for problematic triggers and disable them temporarily
-- List all triggers on auth.users
SELECT 
    tg.tgname AS trigger_name,
    pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users' 
  AND NOT tg.tgisinternal;

-- If you find any triggers, disable them temporarily:
-- ALTER TABLE auth.users DISABLE TRIGGER trigger_name_here;

-- Issue 4: Fix any array_agg usage in triggers
-- This is a common issue where array_agg is used in a trigger function
-- without proper context

-- Check for any custom functions that might be causing the array_agg error
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition ILIKE '%array_agg%';

-- Issue 5: Create a simple, safe trigger function
-- This replaces any problematic triggers with a safe one

CREATE OR REPLACE FUNCTION handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert with error handling
  BEGIN
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
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')::text,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (auth_id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the auth user creation
      RAISE WARNING 'Failed to create public.users record: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Issue 6: Replace any existing problematic triggers
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the new safe trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_safe();

-- Issue 7: Fix any RLS policies that might be blocking inserts
-- Check if RLS is enabled and causing issues
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- If RLS is causing issues, temporarily disable it
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Issue 8: Ensure the roles enum exists and has the right values
-- Check if roles enum exists
SELECT typname FROM pg_type WHERE typname = 'roles';

-- If it doesn't exist, create it
-- CREATE TYPE roles AS ENUM ('user', 'admin', 'owner', 'moderator', 'violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'grey', 'white', 'black');

-- Issue 9: Fix any constraint issues
-- Make sure the public.users table can handle new users
ALTER TABLE public.users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN roles SET DEFAULT 'user';

-- Issue 10: Grant proper permissions to the service role
-- The service role should have all necessary permissions
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

