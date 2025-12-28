
-- Update handle_new_user function to also create user_roles entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Determine role from raw_user_meta_data or default to USER
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'USER'::app_role);
  
  -- Insert profile with role
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    _role,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Insert user_roles entry (this is what the system actually checks for permissions)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  -- If organization_id is present in metadata, link user to organization
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    INSERT INTO public.organization_users (user_id, organization_id, is_owner)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'organization_id')::uuid,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;
