-- Function to allow users to lookup another user's public key by exact email
-- This is required for PKI invitations since RLS prevents reading other users' rows.

CREATE OR REPLACE FUNCTION get_user_public_key_by_email(lookup_email TEXT)
RETURNS TABLE (id UUID, public_key TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT users.id, users.public_key
  FROM users
  WHERE users.email = lookup_email;
END;
$$;
