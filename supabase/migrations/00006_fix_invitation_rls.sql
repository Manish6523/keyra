-- ============================================================================
-- Migration 00006: Fix invitation RLS policies
-- 
-- Problems fixed:
--   1. Invitees cannot accept (UPDATE) their own pending row
--   2. Invitees cannot reject (DELETE) their own pending row
--   3. Pending members get full project/key access before accepting (security leak)
--   4. is_project_member() / is_project_admin() helper functions are dead code
-- ============================================================================

-- ==============================
-- 1. INVITATION ACCEPT / REJECT
-- ==============================

-- Allow invitees to accept their own pending invitation
-- USING: they can only target their own pending rows
-- WITH CHECK: they can only set status to 'accepted'
CREATE POLICY "Invitees can accept own invitation"
  ON project_members FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'accepted');

-- Allow invitees to reject (delete) their own pending invitation
CREATE POLICY "Invitees can reject own invitation"
  ON project_members FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');


-- ============================================================
-- 2. FIX PROJECTS RLS — only accepted members can read projects
-- ============================================================

DROP POLICY IF EXISTS "Members can read shared projects" ON projects;

CREATE POLICY "Members can read shared projects"
  ON projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );


-- =============================================================
-- 3. FIX API_KEYS RLS — only accepted members can read/write keys
-- =============================================================

DROP POLICY IF EXISTS "Members can read shared api keys" ON api_keys;
CREATE POLICY "Members can read shared api keys"
  ON api_keys FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Editors and admins can edit shared api keys" ON api_keys;
CREATE POLICY "Editors and admins can edit shared api keys"
  ON api_keys FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role IN ('editor', 'admin') AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Editors and admins can insert shared api keys" ON api_keys;
CREATE POLICY "Editors and admins can insert shared api keys"
  ON api_keys FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role IN ('editor', 'admin') AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Admins can delete shared api keys" ON api_keys;
CREATE POLICY "Admins can delete shared api keys"
  ON api_keys FOR DELETE
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'accepted'
    )
  );


-- =====================================================================
-- 4. FIX PROJECT_MEMBERS SELECT — cross-member visibility needs status check
-- =====================================================================

DROP POLICY IF EXISTS "Users can see members of projects they are in" ON project_members;
CREATE POLICY "Users can see members of projects they are in"
  ON project_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND status = 'accepted'
    )
    OR project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
