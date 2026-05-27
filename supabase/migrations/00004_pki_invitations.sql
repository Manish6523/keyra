-- 1. Add status column to project_members
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted'));

-- 2. Update security functions to only allow accepted members
CREATE OR REPLACE FUNCTION is_project_member(check_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members WHERE project_id = check_project_id AND user_id = auth.uid() AND status = 'accepted'
  ) OR EXISTS (
    SELECT 1 FROM projects WHERE id = check_project_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_project_admin(check_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects WHERE id = check_project_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members WHERE project_id = check_project_id AND user_id = auth.uid() AND role = 'admin' AND status = 'accepted'
  );
$$;
