-- ========================================
-- DIAGNOSTIC QUERIES FOR AUTH.USERS TRIGGERS
-- ========================================

-- 1. List non-internal triggers on auth.users
SELECT 
    tg.tgname AS trigger_name,
    pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users' 
  AND NOT tg.tgisinternal;

-- 2. Show auth schema functions that might be used by triggers
SELECT 
    n.nspname AS schema, 
    p.proname AS function_name, 
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth'
ORDER BY p.proname;

-- 3. Recent auth audit log entries (look for errors)
SELECT 
    id, 
    created_at, 
    payload::text AS payload
FROM auth.audit_log_entries
ORDER BY created_at DESC
LIMIT 50;

-- 4. Indexes on auth.users (check for unique constraints)
SELECT 
    indexname, 
    indexdef
FROM pg_indexes
WHERE schemaname = 'auth' 
  AND tablename = 'users';

-- 5. FK constraints on public.users referencing auth.users
SELECT 
    conname, 
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- 6. Search for auth functions that reference public.users
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%public.users%'
   OR pg_get_functiondef(p.oid) ILIKE '%public%users%'
ORDER BY p.proname;

-- 7. Check if there are any triggers that reference public tables
SELECT 
    tg.tgname AS trigger_name,
    c.relname AS table_name,
    n.nspname AS schema_name,
    pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE pg_get_triggerdef(tg.oid) ILIKE '%public%'
  AND NOT tg.tgisinternal;

-- 8. Check for existing users with the test email
SELECT 
    id, 
    email, 
    phone, 
    deleted_at,
    created_at
FROM auth.users 
WHERE email = 'testowner@example.com' 
   OR email = 'debug-test-*@example.com'
   OR email LIKE '%@example.com';

-- 9. Check public.users table structure and constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 10. Check for any custom functions that might be called during user creation
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition ILIKE '%auth%'
  AND routine_definition ILIKE '%user%';

