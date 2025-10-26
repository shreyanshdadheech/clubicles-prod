
# Auth Trigger Fix Guide

## Problem Identified
The "Database error creating new user" is caused by a **trigger on `auth.users`** that's trying to insert into `public.users` and failing due to constraint violations.

## Step-by-Step Fix

### Step 1: Run Diagnostic Queries
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the queries from `diagnose-auth-triggers.sql`
4. Look for triggers that reference `public.users` or `public` tables

### Step 2: Identify the Problematic Trigger
Look for triggers that:
- Reference `public.users` in their definition
- Try to insert into `public.users` when a new auth user is created
- Don't have proper error handling

### Step 3: Apply the Fix

#### Option A: Quick Fix (Disable Trigger Temporarily)
If you find a problematic trigger, disable it temporarily:
```sql
-- Replace 'trigger_name_here' with the actual trigger name
ALTER TABLE auth.users DISABLE TRIGGER trigger_name_here;
```

#### Option B: Proper Fix (Create Safe Trigger)
Run the queries from `fix-auth-triggers.sql` to create a safe trigger function.

### Step 4: Test the Fix
1. Try creating a user via your API:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register-owner \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testowner2@example.com",
       "password": "TestPassword123!",
       "first_name": "Test",
       "last_name": "Owner"
     }'
   ```

2. Or test directly with the debug script:
   ```bash
   node test-supabase-direct.js
   ```

### Step 5: Common Issues and Solutions

#### Issue 1: NOT NULL Constraint Violation
If `public.users` has NOT NULL constraints that auth users don't satisfy:
```sql
-- Make columns nullable or provide defaults
ALTER TABLE public.users ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN roles SET DEFAULT 'user';
```

#### Issue 2: Unique Constraint Violation
If there are unique constraints causing conflicts:
```sql
-- Check for existing users
SELECT id, email FROM auth.users WHERE email = 'testowner@example.com';

-- If user exists, delete it first
DELETE FROM auth.users WHERE email = 'testowner@example.com';
```

#### Issue 3: RLS Policy Blocking Inserts
If Row Level Security is blocking inserts:
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Temporarily disable RLS if needed
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

#### Issue 4: Missing Permissions
If the auth role doesn't have permission to insert:
```sql
-- Grant necessary permissions
GRANT INSERT, UPDATE ON public.users TO auth;
GRANT USAGE ON SCHEMA public TO auth;
```

### Step 6: Verify the Fix
After applying the fix, test again:
1. The `test-supabase-direct.js` script should show "✅ createUser successful"
2. Space owner registration should work without the database error

## Expected Results
- ✅ `createUser` API calls should succeed
- ✅ Space owner registration should work
- ✅ Users should be created in both `auth.users` and `public.users`
- ✅ No more "Database error creating new user" errors

## If Issues Persist
1. Check the Supabase logs for more detailed error messages
2. Verify that all constraints in `public.users` are properly configured
3. Ensure the `roles` enum includes all necessary values
4. Check for any custom functions that might be interfering

## Prevention
To prevent this issue in the future:
1. Always use proper error handling in database triggers
2. Test user creation after any schema changes
3. Use `ON CONFLICT` clauses in trigger functions
4. Avoid complex logic in auth triggers

