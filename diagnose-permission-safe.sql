-- ========================================
-- DIAGNOSTIC QUERIES (PERMISSION SAFE)
-- ========================================
-- These queries only read data and don't require owner permissions

-- 1. Check for triggers on auth.users (read-only)
SELECT 
    tg.tgname AS trigger_name,
    pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users' 
  AND NOT tg.tgisinternal;

-- 2. Check for functions using array_agg (read-only)
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%array_agg%'
  AND n.nspname IN ('auth', 'public')
ORDER BY p.proname;

-- 3. Check table structure (read-only)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check for existing test users (read-only)
SELECT 
    id, 
    email, 
    created_at
FROM auth.users 
WHERE email LIKE '%@example.com'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check RLS status (read-only)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
  AND table_name = 'users';

-- 6. Check permissions (read-only)
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND grantee IN ('authenticated', 'anon', 'service_role');

-- 7. Check for constraints (read-only)
SELECT 
    conname,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- 8. Check for indexes (read-only)
SELECT 
    indexname, 
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 9. Check for any existing data issues (read-only)
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email IS NULL THEN 1 END) as null_emails,
    COUNT(CASE WHEN auth_id IS NULL THEN 1 END) as null_auth_ids,
    COUNT(CASE WHEN roles IS NULL THEN 1 END) as null_roles
FROM public.users;

-- 10. Check recent auth audit logs (read-only)
SELECT 
    id, 
    created_at, 
    payload::text AS payload
FROM auth.audit_log_entries
ORDER BY created_at DESC
LIMIT 20;

