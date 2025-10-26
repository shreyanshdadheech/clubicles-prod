-- Fix RLS policies for reviews table to allow authenticated and anonymous users to read reviews

-- First, let's check current policies on reviews table (for reference)
-- SELECT * FROM pg_policies WHERE tablename = 'reviews';

-- Grant basic SELECT privileges to anon and authenticated roles
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.reviews TO authenticated;

-- Create permissive SELECT policy for anonymous users (public reviews viewing)
CREATE POLICY "Allow anon select reviews" ON public.reviews
FOR SELECT
TO anon
USING (true);

-- Create permissive SELECT policy for authenticated users (public reviews viewing)
CREATE POLICY "Allow authenticated select reviews" ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- Optional: Create policy for authenticated users to insert their own reviews
-- (This allows authenticated users to leave reviews)
CREATE POLICY "Allow authenticated insert own reviews" ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Optional: Create policy for authenticated users to update their own reviews
CREATE POLICY "Allow authenticated update own reviews" ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: Create policy for authenticated users to delete their own reviews
CREATE POLICY "Allow authenticated delete own reviews" ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
