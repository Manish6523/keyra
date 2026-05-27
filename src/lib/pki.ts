import { createClient } from "./supabase/client"
import { encryptWithStore } from "./crypto"

// --- PKI (Public Key Infrastructure) for Team Sharing ---

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  )
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key)
  const exportedAsString = String.fromCharCode.apply(null, Array.from(new Uint8Array(exported)))
  return btoa(exportedAsString)
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key)
  const exportedAsString = String.fromCharCode.apply(null, Array.from(new Uint8Array(exported)))
  return btoa(exportedAsString)
}

export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const binaryDerString = atob(pem)
  const binaryDer = new Uint8Array(binaryDerString.length)
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i)
  }
  return crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  )
}

export async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const binaryDerString = atob(pem)
  const binaryDer = new Uint8Array(binaryDerString.length)
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i)
  }
  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  )
}

export async function encryptWithPublicKey(publicKeyPem: string, plaintext: string): Promise<string> {
  const publicKey = await importPublicKey(publicKeyPem)
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    enc.encode(plaintext)
  )
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(ciphertext))))
}

export async function decryptWithPrivateKey(privateKeyPem: string, ciphertext: string): Promise<string> {
  const privateKey = await importPrivateKey(privateKeyPem)
  const binaryString = atob(ciphertext)
  const binaryData = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    binaryData[i] = binaryString.charCodeAt(i)
  }
  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    binaryData
  )
  return new TextDecoder().decode(decrypted)
}

export async function checkAndGeneratePKI() {
  if (typeof window === "undefined") return
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Check if user already has PKI
  const { data: profile } = await supabase
    .from("users")
    .select("public_key, private_key_encrypted")
    .eq("id", user.id)
    .single()

  if (profile && profile.public_key && profile.private_key_encrypted) {
    try {
      const { decryptWithStore } = await import("./crypto")
      await decryptWithStore(profile.private_key_encrypted)
      return
    } catch (err) {
      console.error("PKI private key cannot be decrypted. The session encryption key is missing or invalid:", err)
      return // Do NOT overwrite existing keys!
    }
  }

  // Generate new PKI pair
  const keyPair = await generateKeyPair()
  const pubPem = await exportPublicKey(keyPair.publicKey)
  const privPem = await exportPrivateKey(keyPair.privateKey)

  // Encrypt the private key with the user's master password (via crypto store)
  const encryptedPriv = await encryptWithStore(privPem)

  // Save to database
  await supabase
    .from("users")
    .update({
      public_key: pubPem,
      private_key_encrypted: encryptedPriv,
    })
    .eq("id", user.id)
}

export async function checkPkiStatus(): Promise<"ok" | "corrupted" | "missing"> {
  if (typeof window === "undefined") return "missing"
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "missing"

  const { data: profile } = await supabase
    .from("users")
    .select("public_key, private_key_encrypted")
    .eq("id", user.id)
    .single()

  if (!profile || !profile.public_key || !profile.private_key_encrypted) {
    return "missing"
  }

  try {
    const { decryptWithStore } = await import("./crypto")
    await decryptWithStore(profile.private_key_encrypted)
    return "ok"
  } catch {
    return "corrupted"
  }
}

export async function regenerateUserPKI() {
  if (typeof window === "undefined") return
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const keyPair = await generateKeyPair()
  const pubPem = await exportPublicKey(keyPair.publicKey)
  const privPem = await exportPrivateKey(keyPair.privateKey)

  const { encryptWithStore } = await import("./crypto")
  const encryptedPriv = await encryptWithStore(privPem)

  const { error } = await supabase
    .from("users")
    .update({
      public_key: pubPem,
      private_key_encrypted: encryptedPriv,
    })
    .eq("id", user.id)

  if (error) throw error
  clearProjectKeyCache()
}

export async function inviteUserToProject(projectId: string, inviteeEmail: string, role: string) {
  if (typeof window === "undefined") throw new Error("Cannot run PKI logic on server")
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // 1. Find Invitee using RPC (bypasses RLS on users table)
  const { data: inviteeData, error: inviteeError } = await supabase
    .rpc('get_user_public_key_by_email', { lookup_email: inviteeEmail })

  if (inviteeError) {
    throw new Error(`Failed to lookup user: ${inviteeError.message}`)
  }

  const invitee = inviteeData && inviteeData.length > 0 ? inviteeData[0] : null;

  if (!invitee) {
    throw new Error(`User ${inviteeEmail} not found. They must sign up for Keyra first.`)
  }
  if (!invitee.public_key) {
    throw new Error(`User ${inviteeEmail} has not set up their encryption keys yet. They need to log in at least once.`)
  }

  // 2. Check if already invited or a member
  const { data: existingMember } = await supabase
    .from("project_members")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("user_id", invitee.id)
    .maybeSingle()
    
  if (existingMember) {
    if (existingMember.status === "pending") {
      throw new Error("This user already has a pending invitation.")
    } else {
      throw new Error("This user is already a member of the project.")
    }
  }

  // 3. Get Project to find the encrypted project key
  // Only the Owner has it in the `projects` table for now. 
  // Admin support would require decrypting it from their own `project_members` row.
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, encrypted_project_key")
    .eq("id", projectId)
    .single()
    
  if (!project) throw new Error("Project not found")
  
  if (project.user_id !== user.id) {
    // Current user is not the owner. Check if they are an admin.
    const { data: adminRow } = await supabase
      .from("project_members")
      .select("encrypted_project_key, role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single()
      
    if (!adminRow || adminRow.role !== "admin") {
      throw new Error("You do not have permission to invite users.")
    }
    
    // Admin inviting: They must decrypt their PKI encrypted copy
    const { data: currentProfile } = await supabase
      .from("users")
      .select("private_key_encrypted")
      .eq("id", user.id)
      .single()
      
    if (!currentProfile?.private_key_encrypted) throw new Error("Your PKI keys are missing.")
    
    // Decrypt the admin's private key using AES
    const { decryptWithStore } = await import("./crypto")
    const privateKeyPem = await decryptWithStore(currentProfile.private_key_encrypted)
    
    // Decrypt the project key using the admin's RSA private key
    const rawProjectKey = await decryptWithPrivateKey(privateKeyPem, adminRow.encrypted_project_key)
    
    // Encrypt the project key using the invitee's RSA public key
    const encryptedForInvitee = await encryptWithPublicKey(invitee.public_key, rawProjectKey)
    
    // Insert pending row
    const { error: insertError } = await supabase.from("project_members").insert({
      project_id: projectId,
      user_id: invitee.id,
      role: role,
      encrypted_project_key: encryptedForInvitee,
      status: "pending"
    })
    if (insertError) throw insertError
    return
  }

  // Owner inviting: Owner's key is symmetrically encrypted in projects table
  const { decryptWithStore } = await import("./crypto")
  const rawProjectKey = await decryptWithStore(project.encrypted_project_key)
  
  // Encrypt for invitee using their public key
  const encryptedForInvitee = await encryptWithPublicKey(invitee.public_key, rawProjectKey)
  
  // Insert pending row
  const { error: insertError } = await supabase.from("project_members").insert({
    project_id: projectId,
    user_id: invitee.id,
    role: role,
    encrypted_project_key: encryptedForInvitee,
    status: "pending" // The new column!
  })
  if (insertError) throw insertError
}

let projectKeyCache: Record<string, string> = {}

export function clearProjectKeyCache() {
  projectKeyCache = {}
}

export async function getOrDecryptProjectKey(projectId: string): Promise<string> {
  if (projectKeyCache[projectId]) {
    return projectKeyCache[projectId]
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // 1. First check if we are the owner of the project
  const { data: project } = await supabase
    .from("projects")
    .select("user_id, encrypted_project_key")
    .eq("id", projectId)
    .single()

  if (project) {
    if (project.user_id === user.id) {
      // We are the owner! Decrypt using our store key
      const { decryptWithStore } = await import("./crypto")
      if (!project.encrypted_project_key) {
        throw new Error("Project key is missing")
      }
      const projectKey = await decryptWithStore(project.encrypted_project_key)
      projectKeyCache[projectId] = projectKey
      return projectKey
    }
  }

  // 2. If not the owner, we must be a member. Fetch our member row
  const { data: memberRow } = await supabase
    .from("project_members")
    .select("encrypted_project_key")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single()

  if (!memberRow) {
    throw new Error("You do not have access to this project")
  }

  // Fetch our encrypted private key
  const { data: profile } = await supabase
    .from("users")
    .select("private_key_encrypted")
    .eq("id", user.id)
    .single()

  if (!profile?.private_key_encrypted) {
    throw new Error("Your encryption keys are missing. Please log out and log back in.")
  }

  // Decrypt our private key using our store key
  const { decryptWithStore } = await import("./crypto")
  const privateKeyPem = await decryptWithStore(profile.private_key_encrypted)

  // Decrypt the project key using our private key
  const projectKey = await decryptWithPrivateKey(privateKeyPem, memberRow.encrypted_project_key)
  projectKeyCache[projectId] = projectKey
  return projectKey
}
