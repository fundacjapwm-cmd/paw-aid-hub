-- Update handle_new_user function to support invited users with organization_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile with role from raw_user_meta_data if present, otherwise default to USER
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'USER'::app_role),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
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