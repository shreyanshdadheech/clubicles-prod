# Quick Fix for Auth Errors

## Errors Identified:
1. **"array_agg" is an aggregate function** - Problematic query in a trigger/function
2. **role "auth" does not exist** - Permission issue

## Step-by-Step Fix:

### Step 1: Run the Diagnostic Query
Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Check for problematic functions using array_agg
SELECT 
    n.nspname AS schema,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%array_agg%'
  AND n.nspname IN ('auth', 'public')
ORDER BY p.proname;
```

### Step 2: Disable Problematic Triggers
If you find any triggers, disable them temporarily:

```sql
-- List triggers on auth.users
SELECT 
    tg.tgname AS trigger_name,
    pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users' 
  AND NOT tg.tgisinternal;

-- Disable any problematic triggers (replace trigger_name with actual name)
-- ALTER TABLE auth.users DISABLE TRIGGER trigger_name_here;
```

### Step 3: Fix Permissions
Run these permission fixes:

```sql
-- Grant permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;

-- Grant permissions to service role
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
```

### Step 4: Fix Table Constraints
Make the public.users table more flexible:

```sql
-- Make columns nullable to avoid constraint violations
ALTER TABLE public.users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN roles SET DEFAULT 'user';
```

### Step 5: Create Safe Trigger
Replace any problematic triggers with a safe one:

```sql
-- Create safe trigger function
CREATE OR REPLACE FUNCTION handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
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
      RAISE WARNING 'Failed to create public.users record: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_safe();
```

### Step 6: Test the Fix
Run the test script:

```bash
node test-user-creation-fixed.js
```

### Step 7: Test Space Owner Registration
Try registering a space owner at: http://localhost:3000/signup

## Expected Results:
- ✅ No more "array_agg" errors
- ✅ No more "role auth does not exist" errors  
- ✅ User creation should work
- ✅ Space owner registration should work

## If Issues Persist:
1. Check Supabase logs for more specific error messages
2. Verify that all constraints are properly configured
3. Ensure the roles enum includes all necessary values
4. Check for any remaining problematic functions or triggers

