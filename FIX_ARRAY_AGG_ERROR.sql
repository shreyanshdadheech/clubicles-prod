-- ========================================
-- FIX FOR "array_agg" ERROR
-- ========================================

-- Step 1: Find the problematic function using array_agg
-- This will show us exactly which function is causing the issue
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%array_agg%'
  AND n.nspname IN ('auth', 'public')
ORDER BY p.proname;

-- Step 2: Find triggers that might be calling the problematic function
SELECT 
    tg.tgname AS trigger_name,
    pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users' 
  AND NOT tg.tgisinternal;

-- Step 3: Check for any custom functions that might be using array_agg
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition ILIKE '%array_agg%';

-- Step 4: Look for any functions that might be called during user creation
-- These are the most likely culprits
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (pg_get_functiondef(p.oid) ILIKE '%user%' 
       OR pg_get_functiondef(p.oid) ILIKE '%auth%'
       OR pg_get_functiondef(p.oid) ILIKE '%insert%')
  AND n.nspname IN ('auth', 'public')
  AND pg_get_functiondef(p.oid) ILIKE '%array_agg%'
ORDER BY p.proname;

-- Step 5: Check for any views that might be using array_agg incorrectly
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE definition ILIKE '%array_agg%'
  AND schemaname IN ('auth', 'public');

-- Step 6: Look for any materialized views using array_agg
SELECT 
    schemaname,
    matviewname,
    definition
FROM pg_matviews
WHERE definition ILIKE '%array_agg%'
  AND schemaname IN ('auth', 'public');

-- Step 7: Check for any policies that might be using array_agg
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE (qual ILIKE '%array_agg%' OR with_check ILIKE '%array_agg%')
  AND schemaname IN ('auth', 'public');

-- Step 8: If we find the problematic function, we can try to fix it
-- But first, let's see what we're dealing with
SELECT 'Run the queries above to identify the problematic function' AS instruction;

-- Step 9: Common fix for array_agg errors
-- If you find a function using array_agg incorrectly, here's how to fix it:

-- WRONG (causes the error):
-- SELECT array_agg(column_name) FROM table_name WHERE condition;

-- CORRECT (use within a subquery or proper aggregate context):
-- SELECT (SELECT array_agg(column_name) FROM table_name WHERE condition) AS result;

-- OR use array_agg with GROUP BY:
-- SELECT some_column, array_agg(column_name) FROM table_name GROUP BY some_column;

-- Step 10: Check if there are any default values using array_agg
SELECT 
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_default ILIKE '%array_agg%';

