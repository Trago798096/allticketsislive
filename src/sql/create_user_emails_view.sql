
-- This is a SQL script that needs to be executed in Supabase SQL Editor
-- It creates a view that allows admins to see user emails while maintaining security

-- Create a secure view for user emails
CREATE OR REPLACE VIEW user_emails AS
SELECT 
  p.id,
  (
    SELECT email 
    FROM auth.users 
    WHERE id = p.id
  ) as email
FROM 
  profiles p;

-- Apply RLS to the view so only admins can access it
ALTER VIEW user_emails ENABLE ROW LEVEL SECURITY;

-- Create policy that only allows admins to access the view
CREATE POLICY "Only admins can view user emails" 
  ON user_emails 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Create a secure function to retrieve user emails that can be called from the frontend
CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  RETURN QUERY 
    SELECT json_agg(
      json_build_object(
        'id', u.id,
        'email', u.email
      )
    )
    FROM (
      SELECT id, email FROM user_emails
    ) u;
END;
$$;
