-- Admin User Setup for Clubicles
-- Run this in your Supabase SQL editor to create admin user

-- Create admin user in auth.users table
-- You can run this multiple times safely (it will update if user exists)

-- ADMIN CREDENTIALS:
-- Email: admin@clubicles.com
-- Password: ClubiclesAdmin2025!

-- First, create the auth user (this should be done via Supabase Auth UI or API)
-- This SQL is for reference - use the credentials above in Supabase Auth

-- Step 1: Create admin user via Supabase Dashboard
-- Go to Authentication > Users > Invite User
-- Email: admin@clubicles.com  
-- Password: ClubiclesAdmin2025!
-- Send invitation: No (create directly)

-- Step 2: Run this SQL to set admin role and create database records

-- Update user metadata to set admin role (replace YOUR_ADMIN_USER_ID with the actual ID)
-- Get the user ID from Authentication > Users in Supabase Dashboard

-- Example of updating user metadata (run after getting the actual user ID):
/*
UPDATE auth.users 
SET 
  raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'role', 'admin',
    'full_name', 'Admin User',
    'phone', '+91 9876543210'
  )
WHERE email = 'admin@clubicles.com';
*/

-- Create admin record in admins table (run after creating the auth user)
-- This should be run after you get the actual auth user ID
/*
INSERT INTO admins (auth_id, is_active)
SELECT id, true
FROM auth.users 
WHERE email = 'admin@clubicles.com'
ON CONFLICT (auth_id) DO UPDATE SET
  is_active = true,
  updated_at = now();
*/

-- Create admin user in users table (for general user operations)
/*
INSERT INTO users (auth_id, email, first_name, last_name, phone)
SELECT 
  auth_users.id,
  'admin@clubicles.com',
  'Admin',
  'User',
  '+91 9876543210'
FROM auth.users
WHERE email = 'admin@clubicles.com'
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  updated_at = now();
*/

-- Verification queries to check if admin user is set up correctly:

-- Check if auth user exists with admin role
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users 
WHERE email = 'admin@clubicles.com';

-- Check if admin record exists
SELECT a.*, u.email 
FROM admins a
LEFT JOIN auth.users u ON a.auth_id = u.id
WHERE u.email = 'admin@clubicles.com';

-- Check if user record exists  
SELECT u.*, au.email as auth_email
FROM users u
LEFT JOIN auth.users au ON u.auth_id = au.id
WHERE au.email = 'admin@clubicles.com';

-- ADMIN ACCESS CREDENTIALS:
-- ========================
-- URL: http://localhost:3000/admin
-- Email: admin@clubicles.com
-- Password: ClubiclesAdmin2025!
-- 
-- Features:
-- - Full dashboard access
-- - User management
-- - Booking management  
-- - Space management
-- - Analytics and reports
-- - Support ticket management (once schema is deployed)

-- SETUP INSTRUCTIONS:
-- ===================
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Invite User" or "Create User"
-- 4. Enter Email: admin@clubicles.com
-- 5. Enter Password: ClubiclesAdmin2025!
-- 6. Make sure "Send invitation email" is UNCHECKED
-- 7. Click Create User
-- 8. Copy the user ID from the users list
-- 9. Replace 'YOUR_ADMIN_USER_ID' in the SQL below and run it

-- Replace YOUR_ADMIN_USER_ID with the actual UUID from step 8
-- Then uncomment and run these queries:

/*
-- Set admin role in user metadata
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'role', 'admin',
  'full_name', 'Admin User', 
  'phone', '+91 9876543210'
)
WHERE id = 'YOUR_ADMIN_USER_ID';

-- Create admin record
INSERT INTO admins (auth_id, is_active)
VALUES ('YOUR_ADMIN_USER_ID', true)
ON CONFLICT (auth_id) DO UPDATE SET
  is_active = true,
  updated_at = now();

-- Create user record  
INSERT INTO users (auth_id, email, first_name, last_name, phone)
VALUES (
  'YOUR_ADMIN_USER_ID',
  'admin@clubicles.com',
  'Admin',
  'User', 
  '+91 9876543210'
)
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name, 
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  updated_at = now();
*/

-- Success message
SELECT 'Admin user setup instructions ready! Follow the steps above.' as message;
