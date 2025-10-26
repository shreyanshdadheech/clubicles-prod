# Supabase Setup Guide - Fix for "Database error creating new user"

## Issue Identified
The space owner registration is failing because the Supabase environment variables are not configured correctly.

## Current Status
- ✅ Supabase URL is correct
- ❌ Service Role Key is incorrect format
- ❌ Anon Key is incorrect format

## How to Fix

### Step 1: Get Correct Keys from Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following keys:

#### Service Role Key (for server-side operations)
- Look for **service_role** key (starts with `eyJ` and contains `service_role`)
- This is used for admin operations like creating users

#### Anon Key (for client-side operations)  
- Look for **anon** key (starts with `eyJ` and contains `anon`)
- This is used for client-side operations

### Step 2: Update Environment Variables

Update your `.env.local` file with the correct keys:

```bash
# Replace with your actual Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Replace with your actual service_role key (starts with eyJ, contains service_role)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...service_role...

# Replace with your actual anon key (starts with eyJ, contains anon)  
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...anon...
```

### Step 3: Verify the Fix

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test the environment variables:
   ```bash
   curl http://localhost:3000/api/check-env
   ```

3. You should see:
   ```json
   {
     "serviceKeyFormat": true,
     "anonKeyFormat": true
   }
   ```

4. Test space owner registration:
   - Go to `/signup`
   - Try registering as a space owner
   - It should work without the "Database error creating new user" error

## Key Format Examples

### Correct Service Role Key Format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk4NzI0MCwiZXhwIjoyMDUwNTYzMjQwfQ.xxxxx
```

### Correct Anon Key Format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5ODcyNDAsImV4cCI6MjA1MDU2MzI0MH0.xxxxx
```

## What Was Wrong

The current environment variables appear to be:
- Using the wrong key type (possibly project API key instead of service role key)
- Missing the proper role specification in the JWT token

## After Fix

Once you update the environment variables with the correct keys:
1. Space owner registration will work
2. User creation will succeed
3. The platform will function normally

## Need Help?

If you're still having issues after updating the keys:
1. Check the Supabase project is active
2. Verify the keys are copied correctly (no extra spaces)
3. Restart the development server
4. Check the browser console and server logs for any remaining errors

