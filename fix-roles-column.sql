-- Add roles column as alias to professional_role in users table
-- This fixes the "column roles does not exist" error

-- Add the roles column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS roles public.professional_role;

-- Update existing data to sync roles with professional_role
UPDATE public.users 
SET roles = professional_role 
WHERE professional_role IS NOT NULL;

-- Create a trigger to keep roles and professional_role in sync
CREATE OR REPLACE FUNCTION sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync from professional_role to roles
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.professional_role IS DISTINCT FROM OLD.professional_role THEN
      NEW.roles = NEW.professional_role;
    END IF;
    
    -- Sync from roles to professional_role  
    IF NEW.roles IS DISTINCT FROM OLD.roles THEN
      NEW.professional_role = NEW.roles;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep columns in sync
DROP TRIGGER IF EXISTS trigger_sync_user_roles ON public.users;
CREATE TRIGGER trigger_sync_user_roles
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_roles();
