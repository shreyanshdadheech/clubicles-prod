-- VIBGYOR Counter Increment Function and Trigger
-- This function increments the appropriate VIBGYOR counter based on user's professional role

-- Function to increment VIBGYOR counters when a booking is created
CREATE OR REPLACE FUNCTION public.increment_vibgyor_counter()
RETURNS TRIGGER AS $$
DECLARE
  user_professional_role public.professional_role;
BEGIN
  -- Get the user's professional role
  SELECT professional_role INTO user_professional_role
  FROM public.users 
  WHERE id = NEW.user_id;
  
  -- If user professional role is found, increment the appropriate counter
  IF user_professional_role IS NOT NULL THEN
    -- Update the space's VIBGYOR counter based on professional role
    CASE user_professional_role
      WHEN 'violet' THEN
        UPDATE public.spaces 
        SET violet = COALESCE(violet, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'indigo' THEN
        UPDATE public.spaces 
        SET indigo = COALESCE(indigo, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'blue' THEN
        UPDATE public.spaces 
        SET blue = COALESCE(blue, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'green' THEN
        UPDATE public.spaces 
        SET green = COALESCE(green, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'yellow' THEN
        UPDATE public.spaces 
        SET yellow = COALESCE(yellow, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'orange' THEN
        UPDATE public.spaces 
        SET orange = COALESCE(orange, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'red' THEN
        UPDATE public.spaces 
        SET red = COALESCE(red, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'grey' THEN
        UPDATE public.spaces 
        SET grey = COALESCE(grey, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'white' THEN
        UPDATE public.spaces 
        SET white = COALESCE(white, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      WHEN 'black' THEN
        UPDATE public.spaces 
        SET black = COALESCE(black, 0) + NEW.seats,
            updated_at = now()
        WHERE id = NEW.space_id;
        
      ELSE
        -- Default case - if professional role doesn't match any VIBGYOR color
        -- Log this for debugging but don't fail the booking
        RAISE NOTICE 'Unknown professional role: %', user_professional_role;
    END CASE;
    
    -- Log the increment for debugging
    RAISE NOTICE 'Incremented % counter by % seats for space % (user: %)', 
      user_professional_role, NEW.seats, NEW.space_id, NEW.user_id;
  ELSE
    -- User has no professional role set - increment grey as default
    UPDATE public.spaces 
    SET grey = COALESCE(grey, 0) + NEW.seats,
        updated_at = now()
    WHERE id = NEW.space_id;
    
    RAISE NOTICE 'User % has no professional role, defaulted to grey counter', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment VIBGYOR counters on booking creation
DROP TRIGGER IF EXISTS trigger_increment_vibgyor_on_booking ON public.bookings;

CREATE TRIGGER trigger_increment_vibgyor_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_vibgyor_counter();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.increment_vibgyor_counter() TO postgres, anon, authenticated, service_role;

-- Comment explaining the trigger
COMMENT ON FUNCTION public.increment_vibgyor_counter() IS 
'Automatically increments VIBGYOR counters in spaces table based on user professional role when a booking is created. Defaults to grey counter if user has no professional role set.';

COMMENT ON TRIGGER trigger_increment_vibgyor_on_booking ON public.bookings IS 
'Triggers VIBGYOR counter increment after each booking insertion to track professional role distribution in real-time.';
