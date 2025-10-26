-- QUICK FIX: Disable RLS on critical tables for payment processing
-- Run this in Supabase SQL Editor to immediately fix the payment issue

-- Disable RLS on bookings table
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- Disable RLS on payments table  
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on spaces table
ALTER TABLE public.spaces DISABLE ROW LEVEL SECURITY;

-- Optional: Check RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('bookings', 'payments', 'spaces')
ORDER BY tablename;

-- Note: This disables RLS completely on these tables
-- The service role will now be able to insert/update without issues
-- You can re-enable RLS later and create proper policies if needed
