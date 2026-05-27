import { createClient } from "./supabase/client"
import type { ApiKey, Project } from "@/store/vault"
import { encrypt, decrypt, encryptWithStore, decryptWithStore, initializeEncryptionKey } from "./crypto"
import { generateSymmetricKey } from "./crypto"

// =========== AUTH ===========

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (!error && data.user) {
    await initializeEncryptionKey(password)
  }
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error && data.user) {
    await initializeEncryptionKey(password)
  }
  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// =========== API KEYS ===========

export async function fetchKeys(validProjectIds?: Set<string>): Promise<ApiKey[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  const keys: ApiKey[] = (data || []).map(mapKeyFromDB)
  
  if (validProjectIds) {
    return keys.filter((k) => !k.projectId || validProjectIds.has(k.projectId))
  }

  // Fallback: fetch projects to filter
  const projects = await fetchProjects()
  const ids = new Set(projects.map((p) => p.id))
  return keys.filter((k) => !k.projectId || ids.has(k.projectId))
}

export async function createKey(key: Omit<ApiKey, "id" | "createdAt" | "updatedAt">) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const encryptedValue = await encryptKeyValue(key.encryptedValue, key.projectId)

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: user.id,
      project_id: key.projectId || null,
      service_name: key.serviceName,
      service_logo_url: key.serviceLogoUrl || null,
      label: key.label,
      encrypted_value: encryptedValue,
      environment: key.environment,
      tags: key.tags,
      description: key.description || null,
      docs_url: key.docsUrl || null,
      expiry_date: key.expiryDate || null,
      archived: key.archived,
    })
    .select()
    .single()

  if (error) throw error
  return mapKeyFromDB(data)
}

export async function updateKeyInDB(id: string, updates: Partial<ApiKey>) {
  const supabase = createClient()
  const dbUpdates: Record<string, unknown> = {}
  if (updates.label !== undefined) dbUpdates.label = updates.label
  if (updates.serviceName !== undefined) dbUpdates.service_name = updates.serviceName
  if (updates.encryptedValue !== undefined) {
    let projectId = updates.projectId
    if (projectId === undefined) {
      const { data: keyRow } = await supabase
        .from("api_keys")
        .select("project_id")
        .eq("id", id)
        .single()
      projectId = keyRow?.project_id || undefined
    }
    dbUpdates.encrypted_value = await encryptKeyValue(updates.encryptedValue, projectId)
  }
  if (updates.environment !== undefined) dbUpdates.environment = updates.environment
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.docsUrl !== undefined) dbUpdates.docs_url = updates.docsUrl
  if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate
  if (updates.archived !== undefined) dbUpdates.archived = updates.archived
  if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite
  if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId

  const { data, error } = await supabase
    .from("api_keys")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return mapKeyFromDB(data)
}

export async function deleteKeyFromDB(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("api_keys").delete().eq("id", id)
  if (error) throw error
}

// =========== PROJECTS ===========

export async function fetchProjects(): Promise<Project[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      project_members (
        user_id,
        status
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error

  const projectsData = (data as unknown) as Array<{
    user_id: string;
    project_members?: Array<{ user_id: string; status: string }> | { user_id: string; status: string };
  }> || []

  const filtered = projectsData.filter((p) => {
    if (p.user_id === user.id) return true
    const membershipsData = p.project_members as unknown;
    const memberships = Array.isArray(membershipsData)
      ? (membershipsData as Array<{ user_id: string; status: string }>)
      : membershipsData
      ? [membershipsData as { user_id: string; status: string }]
      : []
    return memberships.some(
      (m) => m.user_id === user.id && m.status === "accepted"
    )
  })

  return (filtered as unknown as Record<string, unknown>[]).map(mapProjectFromDB)
}

export async function createProjectInDB(name: string, color = "#7C5CFC", icon = "folder") {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const projectKey = generateSymmetricKey()
  const encryptedProjectKey = await encryptWithStore(projectKey)

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, color, icon, encrypted_project_key: encryptedProjectKey })
    .select()
    .single()

  if (error) throw error
  return mapProjectFromDB(data)
}

export async function deleteProjectFromDB(id: string) {
  const supabase = createClient()
  
  // First, delete all keys associated with this project (cascade delete)
  const { error: keysError } = await supabase.from("api_keys").delete().eq("project_id", id)
  if (keysError) throw keysError

  // Then delete the project itself
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) throw error
}

// =========== TEAM MANAGEMENT ===========

export async function fetchProjectMembers(projectId: string) {
  const supabase = createClient()
  
  // Get owner from project (no join on users to avoid PostgREST errors)
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single()
    
  if (projectError) throw projectError
  
  // Get members
  const { data: members, error: membersError } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", projectId)
    
  if (membersError && membersError.code !== "42P01") {
    // 42P01 means table does not exist (user didn't run migration)
    throw membersError
  }
  
  // Try to fetch emails separately using RPC (bypasses RLS select restriction)
  // Collect all user IDs
  const userIds = [project.user_id]
  if (members) {
    members.forEach((m: Record<string, unknown>) => userIds.push(m.user_id))
  }
  
  const { data: usersData } = await supabase
    .rpc("get_user_emails", { user_ids: userIds })
    
  const emailMap: Record<string, string> = {}
  if (usersData) {
    usersData.forEach((u: { id: string, email: string }) => {
      emailMap[u.id] = u.email
    })
  }
  
  const allMembers = []
  
  if (project) {
    allMembers.push({
      id: project.user_id,
      user_id: project.user_id,
      email: emailMap[project.user_id] || "Owner (You)",
      role: "owner",
      status: "accepted",
      created_at: new Date().toISOString()
    })
  }
  
  if (members) {
    members.forEach((m: Record<string, unknown>) => {
      allMembers.push({
        id: m.id as string,
        user_id: m.user_id as string,
        email: emailMap[m.user_id as string] || "Team Member",
        role: m.role as string,
        status: (m.status as string) || "accepted",
        created_at: m.created_at as string
      })
    })
  }
  
  return allMembers
}

export async function fetchPendingInvitations() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("project_members")
    .select(`
      id,
      project_id,
      role,
      created_at,
      encrypted_project_key,
      projects (
        name,
        color
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "pending")

  if (error && error.code !== "42P01") throw error // Ignore missing table error
  return data || []
}

export async function debugInvitations() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No user logged in" }

  const pmQuery = await supabase
    .from("project_members")
    .select("*")
  
  const userQuery = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  return {
    currentUser: {
      id: user.id,
      email: user.email,
      publicUserTable: userQuery.data
    },
    projectMembersRows: pmQuery.data,
    projectMembersError: pmQuery.error
  }
}

export async function acceptInvitation(memberId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("project_members")
    .update({ status: "accepted" })
    .eq("id", memberId)

  if (error) throw error
}

export async function rejectInvitation(memberId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId)

  if (error) throw error
}

export async function updateMemberRole(projectId: string, userId: string, newRole: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("project_members")
    .update({ role: newRole })
    .eq("project_id", projectId)
    .eq("user_id", userId)
    
  if (error) throw error
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId)
    
  if (error) throw error
}

// =========== ACTIVITY LOG ===========

export async function logActivity(keyId: string, action: string, metadata = {}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase.from("activity_log").insert({
    user_id: user.id,
    key_id: keyId,
    action,
    metadata,
  })
  if (error) {
    console.error("Failed to log activity:", error)
  }
}

export async function fetchActivity(limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("activity_log")
    .select("*, api_keys(label, service_name)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Failed to fetch activity:", error)
    return []
  }

  return (data || []).map((a: Record<string, unknown>) => ({
    action: a.action as string,
    keyLabel: (a.api_keys as Record<string, unknown> | null)?.label as string || "",
    serviceName: (a.api_keys as Record<string, unknown> | null)?.service_name as string || "",
    createdAt: a.created_at as string,
  }))
}

// =========== MAPPERS ===========

function mapKeyFromDB(db: Record<string, unknown>): ApiKey {
  return {
    id: db.id as string,
    projectId: (db.project_id as string) || "",
    serviceName: db.service_name as string,
    serviceLogoUrl: db.service_logo_url as string | undefined,
    label: db.label as string,
    encryptedValue: db.encrypted_value as string,
    environment: db.environment as "development" | "staging" | "production",
    tags: (db.tags as string[]) || [],
    description: db.description as string | undefined,
    docsUrl: db.docs_url as string | undefined,
    expiryDate: db.expiry_date as string | undefined,
    lastCopiedAt: db.last_copied_at as string | undefined,
    createdAt: db.created_at as string,
    updatedAt: db.updated_at as string,
    archived: db.archived as boolean,
    favorite: (db.favorite as boolean) || false,
  }
}

function mapProjectFromDB(db: Record<string, unknown>): Project {
  return {
    id: db.id as string,
    name: db.name as string,
    color: (db.color as string) || "#7C5CFC",
    icon: (db.icon as string) || "folder",
    createdAt: db.created_at as string,
    encryptedProjectKey: db.encrypted_project_key as string | undefined,
  }
}

export async function encryptKeyValue(value: string, projectId?: string): Promise<string> {
  if (projectId) {
    const { getOrDecryptProjectKey } = await import("./pki")
    const projectKey = await getOrDecryptProjectKey(projectId)
    return encrypt(value, projectKey)
  }
  return encryptWithStore(value)
}

export async function decryptKeyValue(value: string, projectId?: string): Promise<string> {
  if (projectId) {
    const { getOrDecryptProjectKey } = await import("./pki")
    const projectKey = await getOrDecryptProjectKey(projectId)
    try {
      return await decrypt(value, projectKey)
    } catch (projectDecError) {
      // Auto-migrate: If project-key decryption fails, try store-key decryption
      try {
        const plaintext = await decryptWithStore(value)
        const encryptedWithProject = await encrypt(plaintext, projectKey)
        const supabase = createClient()
        // Save back the key encrypted with project key (non-blocking)
        (async () => {
          try {
            const { error } = await supabase
              .from("api_keys")
              .update({ encrypted_value: encryptedWithProject })
              .eq("encrypted_value", value)
            if (error) console.error("Key auto-migration failed:", error)
            else console.log("Key auto-migrated successfully to project-key E2EE encryption!")
          } catch (e) {
            console.error("Key auto-migration failed:", e)
          }
        })()
        return plaintext
      } catch {
        throw projectDecError
      }
    }
  }
  return decryptWithStore(value)
}
