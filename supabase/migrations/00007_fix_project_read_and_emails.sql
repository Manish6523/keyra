-- Migration 00007: Fix project read permission for pending invitations, get user emails RPC, and fix project_members RLS recursion

-- 1. Allow pending members to read project metadata so the invitation banner shows the project name
DROP POLICY IF EXISTS "Members can read shared projects" ON projects;

CREATE POLICY "Members can read shared projects"
  ON projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- 2. Create RPC function to fetch emails by user IDs securely (bypassing RLS on users table select)
CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT users.id, users.email
  FROM users
  WHERE users.id = ANY(user_ids);
END;
$$;

-- 3. Fix project_members SELECT RLS policy recursion by utilizing SECURITY DEFINER is_project_member helper
DROP POLICY IF EXISTS "Users can see members of projects they are in" ON project_members;

CREATE POLICY "Users can see members of projects they are in"
  ON project_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_project_member(project_id)
  );

-- 4. Create missing UPDATE and DELETE policies for accepting/rejecting invitations
DROP POLICY IF EXISTS "Invitees can accept own invitation" ON project_members;
CREATE POLICY "Invitees can accept own invitation"
  ON project_members FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'accepted');

DROP POLICY IF EXISTS "Invitees can reject own invitation" ON project_members;
CREATE POLICY "Invitees can reject own invitation"
  ON project_members FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');
