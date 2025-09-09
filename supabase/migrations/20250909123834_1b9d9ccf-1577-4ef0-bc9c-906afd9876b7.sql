-- Function to create the first admin user automatically
CREATE OR REPLACE FUNCTION public.create_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
  first_user_id UUID;
BEGIN
  -- Check if there are any admin users
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin'::app_role;
  
  -- If no admins exist, make the first registered user an admin
  IF admin_count = 0 THEN
    SELECT id INTO first_user_id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (first_user_id, 'admin'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
      
      RAISE NOTICE 'First user has been automatically promoted to admin';
    END IF;
  END IF;
END;
$$;

-- Function to get system information for admin dashboard
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow admins to call this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  SELECT json_build_object(
    'total_users', (
      SELECT COUNT(DISTINCT user_id) 
      FROM public.user_roles
    ),
    'total_students', (
      SELECT COUNT(*) 
      FROM public.students
    ),
    'admin_users', (
      SELECT COUNT(*) 
      FROM public.user_roles 
      WHERE role = 'admin'::app_role
    ),
    'today_registrations', (
      SELECT COUNT(*) 
      FROM public.students 
      WHERE created_at >= CURRENT_DATE
    )
  ) INTO result;
  
  RETURN result;
END;
$$;