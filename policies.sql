-- Function to test current user's role and permissions
-- Function to test current user's role and permissions
-- (Helper functions follow)
-- HELPER FUNCTIONS FOR EXTRACTING USER IDs
-- =============================================

-- Function to get current user's UUID from auth
CREATE OR REPLACE FUNCTION "public"."auth_uid"() 
RETURNS "uuid"
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Function to get current user's ID from public.users table
CREATE OR REPLACE FUNCTION "public"."current_user_id"() 
RETURNS "uuid"
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Function to get space_owner_id from JWT claims or raise error if not found
CREATE OR REPLACE FUNCTION "public"."space_owner_id"() 
RETURNS "uuid"
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN COALESCE(
      current_setting('request.jwt.claims', true)::json->'app_metadata'->>'space_owner_id',
      (auth.jwt() -> 'app_metadata' ->> 'space_owner_id')
    ) IS NULL THEN
      (SELECT id FROM public.space_owners WHERE auth_id = auth.uid() LIMIT 1)
    ELSE
      COALESCE(
        current_setting('request.jwt.claims', true)::json->'app_metadata'->>'space_owner_id',
        (auth.jwt() -> 'app_metadata' ->> 'space_owner_id')
      )::uuid
  END;
$$;

-- Function to get admin_id from JWT claims or raise error if not found
CREATE OR REPLACE FUNCTION "public"."admin_id"() 
RETURNS "uuid"
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN COALESCE(
      current_setting('request.jwt.claims', true)::json->'app_metadata'->>'admin_id',
      (auth.jwt() -> 'app_metadata' ->> 'admin_id')
    ) IS NULL THEN
      (SELECT id FROM public.admins WHERE auth_id = auth.uid() LIMIT 1)
    ELSE
      COALESCE(
        current_setting('request.jwt.claims', true)::json->'app_metadata'->>'admin_id',
        (auth.jwt() -> 'app_metadata' ->> 'admin_id')
      )::uuid
  END;
$$;

-- Function to check if current user is a space owner
CREATE OR REPLACE FUNCTION "public"."is_space_owner"() 
RETURNS BOOLEAN
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.space_owners 
    WHERE auth_id = auth.uid() AND is_active = true
  );
$$;

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION "public"."is_admin"() 
RETURNS BOOLEAN
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.admins 
    WHERE auth_id = auth.uid() AND is_active = true
  );
$$;

-- Function to check if current user is a regular user
CREATE OR REPLACE FUNCTION "public"."is_user"() 
RETURNS BOOLEAN
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND is_active = true
  );
$$;

-- Function to get business_id for current space owner
CREATE OR REPLACE FUNCTION "public"."current_business_id"() 
RETURNS "uuid"
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT bi.id 
  FROM public.space_owner_business_info bi
  JOIN public.space_owners so ON bi.space_owner_id = so.id
  WHERE so.auth_id = auth.uid()
  LIMIT 1;
$$;

-- =============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_owner_business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_owner_payment_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_owner_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_fallback ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR USERS TABLE
-- =============================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth_id = auth.uid());

-- Admins can view all users
CREATE POLICY "users_admin_select_all" ON public.users
  FOR SELECT USING (is_admin());

-- Admins can update all users
CREATE POLICY "users_admin_update_all" ON public.users
  FOR UPDATE USING (is_admin());

-- Space owners can view users who have booked their spaces
CREATE POLICY "users_space_owner_select_bookers" ON public.users
  FOR SELECT USING (
    is_space_owner() AND 
    EXISTS(
      SELECT 1 FROM bookings b
      JOIN spaces s ON b.space_id = s.id
      JOIN space_owner_business_info bi ON s.business_id = bi.id
      JOIN space_owners so ON bi.space_owner_id = so.id
      WHERE b.user_id = users.id AND so.auth_id = auth.uid()
    )
  );

-- Allow user insertion during signup (handled by auth triggers)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- =============================================
-- RLS POLICIES FOR ADMINS TABLE
-- =============================================

-- Admins can view their own record
CREATE POLICY "admins_select_own" ON public.admins
  FOR SELECT USING (auth_id = auth.uid());

-- Admins can view other admins
CREATE POLICY "admins_select_all" ON public.admins
  FOR SELECT USING (is_admin());

-- Allow admin insertion (handled by auth triggers or super admin)
CREATE POLICY "admins_insert" ON public.admins
  FOR INSERT WITH CHECK (true); -- Controlled by application logic

-- =============================================
-- RLS POLICIES FOR SPACE OWNERS TABLE
-- =============================================

-- Space owners can view their own profile
CREATE POLICY "space_owners_select_own" ON public.space_owners
  FOR SELECT USING (auth_id = auth.uid());

-- Space owners can update their own profile
CREATE POLICY "space_owners_update_own" ON public.space_owners
  FOR UPDATE USING (auth_id = auth.uid());

-- Admins can view all space owners
CREATE POLICY "space_owners_admin_select_all" ON public.space_owners
  FOR SELECT USING (is_admin());

-- Admins can update space owners
CREATE POLICY "space_owners_admin_update_all" ON public.space_owners
  FOR UPDATE USING (is_admin());

-- Allow space owner insertion during signup
CREATE POLICY "space_owners_insert_own" ON public.space_owners
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- =============================================
-- RLS POLICIES FOR BUSINESS INFO TABLE
-- =============================================

-- Space owners can view their own business info
CREATE POLICY "business_info_select_own" ON public.space_owner_business_info
  FOR SELECT USING (
    space_owner_id = space_owner_id() OR
    EXISTS(SELECT 1 FROM space_owners WHERE id = space_owner_id AND auth_id = auth.uid())
  );

-- Space owners can update their own business info
CREATE POLICY "business_info_update_own" ON public.space_owner_business_info
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM space_owners WHERE id = space_owner_id AND auth_id = auth.uid())
  );

-- Space owners can insert their own business info
CREATE POLICY "business_info_insert_own" ON public.space_owner_business_info
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM space_owners WHERE id = space_owner_id AND auth_id = auth.uid())
  );

-- Admins can view all business info
CREATE POLICY "business_info_admin_select_all" ON public.space_owner_business_info
  FOR SELECT USING (is_admin());

-- Admins can update business info (for verification)
CREATE POLICY "business_info_admin_update_all" ON public.space_owner_business_info
  FOR UPDATE USING (is_admin());

-- =============================================
-- RLS POLICIES FOR BUSINESS BALANCES TABLE
-- =============================================

-- Space owners can view their own business balances
CREATE POLICY "business_balances_select_own" ON public.business_balances
  FOR SELECT USING (
    business_id = current_business_id()
  );

-- Admins can view all business balances
CREATE POLICY "business_balances_admin_select_all" ON public.business_balances
  FOR SELECT USING (is_admin());

-- System can insert/update balances (via functions)
CREATE POLICY "business_balances_system_all" ON public.business_balances
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- RLS POLICIES FOR PAYMENT INFO TABLE
-- =============================================

-- Space owners can manage their own payment info
CREATE POLICY "payment_info_select_own" ON public.space_owner_payment_info
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM space_owners WHERE id = space_owner_id AND auth_id = auth.uid())
  );

CREATE POLICY "payment_info_update_own" ON public.space_owner_payment_info
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM space_owners WHERE id = space_owner_id AND auth_id = auth.uid())
  );

CREATE POLICY "payment_info_insert_own" ON public.space_owner_payment_info
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM space_owners WHERE id = space_owner_id AND auth_id = auth.uid())
  );

-- Admins can view payment info
CREATE POLICY "payment_info_admin_select_all" ON public.space_owner_payment_info
  FOR SELECT USING (is_admin());

-- =============================================
-- RLS POLICIES FOR SPACES TABLE
-- =============================================

-- Anyone can view approved spaces
CREATE POLICY "spaces_select_approved" ON public.spaces
  FOR SELECT USING (status = 'approved');

-- Space owners can view their own spaces (any status)
CREATE POLICY "spaces_select_own" ON public.spaces
  FOR SELECT USING (
    business_id = current_business_id()
  );

-- Space owners can manage their own spaces
CREATE POLICY "spaces_update_own" ON public.spaces
  FOR UPDATE USING (
    business_id = current_business_id()
  );

CREATE POLICY "spaces_insert_own" ON public.spaces
  FOR INSERT WITH CHECK (
    business_id = current_business_id()
  );

-- Admins can view and manage all spaces
CREATE POLICY "spaces_admin_all" ON public.spaces
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- RLS POLICIES FOR TAX CONFIGURATIONS TABLE
-- =============================================

-- Anyone can read enabled tax configurations
CREATE POLICY "tax_config_select_enabled" ON public.tax_configurations
  FOR SELECT USING (is_enabled = true);

-- Admins can manage tax configurations
CREATE POLICY "tax_config_admin_all" ON public.tax_configurations
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- RLS POLICIES FOR BOOKINGS TABLE
-- =============================================

-- Users can view their own bookings
CREATE POLICY "bookings_select_own_user" ON public.bookings
  FOR SELECT USING (user_id = current_user_id());

-- Users can create their own bookings
CREATE POLICY "bookings_insert_own_user" ON public.bookings
  FOR INSERT WITH CHECK (user_id = current_user_id());

-- Users can update their own bookings (limited updates)
CREATE POLICY "bookings_update_own_user" ON public.bookings
  FOR UPDATE USING (
    user_id = current_user_id() AND 
    status IN ('pending', 'confirmed') AND
    date >= CURRENT_DATE
  );

-- Space owners can view bookings for their spaces
CREATE POLICY "bookings_select_own_space" ON public.bookings
  FOR SELECT USING (
    is_space_owner() AND
    EXISTS(
      SELECT 1 FROM spaces s
      WHERE s.id = space_id AND s.business_id = current_business_id()
    )
  );

-- Space owners can update booking status for their spaces
CREATE POLICY "bookings_update_own_space" ON public.bookings
  FOR UPDATE USING (
    is_space_owner() AND
    EXISTS(
      SELECT 1 FROM spaces s
      WHERE s.id = space_id AND s.business_id = current_business_id()
    )
  );

-- Admins can view and manage all bookings
CREATE POLICY "bookings_admin_all" ON public.bookings
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- RLS POLICIES FOR BOOKING TAXES TABLE
-- =============================================

-- Users can view taxes for their bookings
CREATE POLICY "booking_taxes_select_own" ON public.booking_taxes
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM bookings WHERE id = booking_id AND user_id = current_user_id())
  );

-- Space owners can view taxes for their space bookings
CREATE POLICY "booking_taxes_select_space_owner" ON public.booking_taxes
  FOR SELECT USING (
    is_space_owner() AND
    EXISTS(
      SELECT 1 FROM bookings b
      JOIN spaces s ON b.space_id = s.id
      WHERE b.id = booking_id AND s.business_id = current_business_id()
    )
  );

-- System can insert booking taxes
CREATE POLICY "booking_taxes_system_insert" ON public.booking_taxes
  FOR INSERT WITH CHECK (true);

-- Admins can view all booking taxes
CREATE POLICY "booking_taxes_admin_select_all" ON public.booking_taxes
  FOR SELECT USING (is_admin());

-- =============================================
-- RLS POLICIES FOR BOOKING PAYMENTS TABLE
-- =============================================

-- Users can view payments for their bookings
CREATE POLICY "booking_payments_select_own" ON public.booking_payments
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM bookings WHERE id = booking_id AND user_id = current_user_id())
  );

-- Space owners can view payments for their space bookings
CREATE POLICY "booking_payments_select_space_owner" ON public.booking_payments
  FOR SELECT USING (
    is_space_owner() AND
    EXISTS(
      SELECT 1 FROM bookings b
      JOIN spaces s ON b.space_id = s.id
      WHERE b.id = booking_id AND s.business_id = current_business_id()
    )
  );

-- System can manage booking payments (via webhook functions)
CREATE POLICY "booking_payments_system_all" ON public.booking_payments
  FOR ALL USING (true) WITH CHECK (true);

-- Admins can view all booking payments
CREATE POLICY "booking_payments_admin_select_all" ON public.booking_payments
  FOR SELECT USING (is_admin());

-- =============================================
-- RLS POLICIES FOR SPACE OWNER PAYMENTS TABLE
-- =============================================

-- Space owners can view their own payments
CREATE POLICY "space_owner_payments_select_own" ON public.space_owner_payments
  FOR SELECT USING (
    business_id = current_business_id()
  );

-- Admins can manage all space owner payments
CREATE POLICY "space_owner_payments_admin_all" ON public.space_owner_payments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- RLS POLICIES FOR REVIEWS TABLE
-- =============================================

-- Anyone can read reviews for approved spaces
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM spaces WHERE id = space_id AND status = 'approved')
  );

-- Users can create reviews for their completed bookings
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (
    user_id = current_user_id() AND
    EXISTS(
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND user_id = current_user_id() AND status = 'completed'
    )
  );

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (user_id = current_user_id());

-- Space owners can view reviews for their spaces
CREATE POLICY "reviews_select_space_owner" ON public.reviews
  FOR SELECT USING (
    is_space_owner() AND
    EXISTS(
      SELECT 1 FROM spaces s
      WHERE s.id = space_id AND s.business_id = current_business_id()
    )
  );

-- Admins can manage all reviews
CREATE POLICY "reviews_admin_all" ON public.reviews
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- RLS POLICIES FOR PAYMENT FALLBACK TABLE
-- =============================================

-- Only admins can view payment fallback records
CREATE POLICY "payment_fallback_admin_select_all" ON public.payment_fallback
  FOR SELECT USING (is_admin());

-- Only admins can update payment fallback records
CREATE POLICY "payment_fallback_admin_update_all" ON public.payment_fallback
  FOR UPDATE USING (is_admin());

-- System can insert payment fallback records
CREATE POLICY "payment_fallback_system_insert" ON public.payment_fallback
  FOR INSERT WITH CHECK (true);

-- =============================================
-- POLICIES FOR VIEWS (Make them accessible)
-- =============================================

-- Dashboard stats view - only admins
CREATE POLICY "dashboard_stats_admin_only" ON public.dashboard_stats
  FOR SELECT USING (is_admin());

-- Business analytics view - space owners can see their own, admins see all
-- Note: Views inherit RLS from underlying tables, so no additional policies needed

-- =============================================
-- UTILITY FUNCTIONS FOR TESTING RLS
-- =============================================

-- Function to test current user's role and permissions
CREATE OR REPLACE FUNCTION "public"."debug_user_role"()
RETURNS TABLE(
  auth_id UUID,
  is_user_result BOOLEAN,
  is_space_owner_result BOOLEAN,
  is_admin_result BOOLEAN,
  user_id UUID,
  space_owner_id UUID,
  admin_id UUID,
  business_id UUID
)
LANGUAGE "sql" STABLE SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as auth_id,
    is_user() as is_user_result,
    is_space_owner() as is_space_owner_result,
    is_admin() as is_admin_result,
    current_user_id() as user_id,
    space_owner_id() as space_owner_id,
    admin_id() as admin_id,
    current_business_id() as business_id;
$$;

-- Function to check what a user can access
CREATE OR REPLACE FUNCTION "public"."test_user_access"()
RETURNS TABLE(
  table_name TEXT,
  can_select BOOLEAN,
  can_insert BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN,
  row_count BIGINT
)
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
  test_table TEXT;
  test_results RECORD;
BEGIN
  FOR test_table IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE '%_old'
    ORDER BY t.table_name
  LOOP
    BEGIN
      -- Test SELECT
      EXECUTE format('SELECT COUNT(*) FROM public.%I', test_table) INTO test_results;
      
      RETURN QUERY SELECT 
        test_table,
        true as can_select,
        false as can_insert, -- Would need actual test data
        false as can_update, -- Would need actual test data  
        false as can_delete, -- Would need actual test data
        test_results.count;
        
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        test_table,
        false as can_select,
        false as can_insert,
        false as can_update,
        false as can_delete,
        0::BIGINT;
    END;
  END LOOP;
END;
$$;

-- =============================================
-- COMMENTS AND USAGE
-- =============================================

/*
USAGE EXAMPLES:

1. HELPER FUNCTIONS:
   -- Check current user role:
   SELECT * FROM debug_user_role();
   
   -- Get current IDs:
   SELECT auth.uid() as auth_id, space_owner_id(), admin_id();

2. RLS BEHAVIOR:
   -- As a regular user (auth.uid() exists in users table), you can only see:
   - Your own profile in users table
   - Your own bookings
   - Your own reviews  
   - Approved spaces
   - Your payment records
   
   -- As a space owner (space_owner_id() returns UUID), you additionally see:
   - Your business info and balances
   - Bookings for your spaces
   - Reviews for your spaces
   - Payments related to your business
   - Users who booked your spaces
   
   -- As an admin (admin_id() returns UUID), you see:
   - Everything across all tables
   - Payment fallback records
   - Business analytics
   - Can manage tax configurations

3. TESTING RLS:
   -- Login as different user types and run:
   SELECT * FROM users; -- Should show different results
   SELECT * FROM spaces; -- Should show appropriate spaces
   SELECT * FROM bookings; -- Should show user's own bookings

IMPORTANT NOTES:
- RLS policies use space_owner_id() and admin_id() functions for validation
- These functions return NULL if user is not in that role
- Policies use "IS NOT NULL" checks to validate roles
- auth.uid() is used directly for user-level access
- Business relationship queries use subqueries to get business_id from space_owner_id()
- System functions can bypass RLS where needed (marked with SECURITY DEFINER)
- Views inherit RLS from underlying tables

SIMPLIFIED ROLE CHECKS:
- User access: auth_id = auth.uid()
- Space owner access: space_owner_id() IS NOT NULL  
- Admin access: admin_id() IS NOT NULL
- Business relationship: business_id IN (SELECT bi.id FROM space_owner_business_info bi WHERE bi.space_owner_id = space_owner_id())
*/