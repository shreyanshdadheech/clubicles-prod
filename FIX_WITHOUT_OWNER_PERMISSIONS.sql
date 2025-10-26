-- ========================================
-- FIX WITHOUT OWNER PERMISSIONS
-- ========================================
-- This fix works within Supabase's permission constraints

-- Step 1: Check what triggers exist (read-only, should work)
SELECT 
    tg.tgname AS trigger_name,
    pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users' 
  AND NOT tg.tgisinternal;

-- Step 2: Check for problematic functions (read-only)
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%array_agg%'
  AND n.nspname IN ('auth', 'public')
ORDER BY p.proname;

-- Step 3: Check table structure (read-only)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 4: Check for existing users that might cause conflicts
SELECT 
    id, 
    email, 
    created_at
FROM auth.users 
WHERE email LIKE '%@example.com'
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check if there are any RLS policies blocking inserts
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- Step 6: Check current permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND grantee IN ('authenticated', 'anon', 'service_role');

-- Step 7: Try to create a simple function (this might work)
-- If this fails, we'll need to use a different approach
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
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
      'user',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (auth_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create public.users record: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Check if we can create triggers (this might also fail)
-- If this fails, we'll need to use a different approach
SELECT 'Testing trigger creation...' AS status;

-- Step 9: Alternative approach - Check if we can insert directly
-- This will help us understand what's blocking the insert
SELECT 'Testing direct insert...' AS status;

-- Step 10: Check for any existing problematic data
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email IS NULL THEN 1 END) as null_emails,
    COUNT(CASE WHEN auth_id IS NULL THEN 1 END) as null_auth_ids
FROM public.users;

