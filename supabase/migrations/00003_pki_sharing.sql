-- Migration to support End-to-End Encrypted (E2EE) Team Sharing using Public Key Infrastructure (PKI)

-- 1. Add PKI columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS private_key_encrypted TEXT;

-- 2. Add project key columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS encrypted_project_key TEXT;

-- 3. Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_project_key TEXT NOT NULL, -- The project key encrypted with this user's public key
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- 4. Enable RLS on project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see members of projects they are in"
  ON project_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ) OR
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins and owners can manage members"
  ON project_members FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Update RLS on projects to allow members to read
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Members can read shared projects"
  ON projects FOR SELECT
  USING (
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

-- 6. Update RLS on api_keys to allow members to read/write depending on role
DROP POLICY IF EXISTS "Users can manage own keys" ON api_keys;

CREATE POLICY "Users can manage own keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Members can read shared api keys"
  ON api_keys FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Editors and admins can edit shared api keys"
  ON api_keys FOR UPDATE
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
  );

CREATE POLICY "Editors and admins can insert shared api keys"
  ON api_keys FOR INSERT
  WITH CHECK (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
  );

CREATE POLICY "Admins can delete shared api keys"
  ON api_keys FOR DELETE
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'admin')
  );
