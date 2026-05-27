const PBKDF2_ITERATIONS = 600000
const KEY_LENGTH = 256
const SALT_LENGTH = 32
const IV_LENGTH = 12

let memoizedKey: string | null = null

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  )
}

async function deriveKey(
  keyMaterial: CryptoKey,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  )
}

function getEncryptionPassword(): string {
  if (typeof window === 'undefined') throw new Error('Cannot access encryption key on server')
  if (memoizedKey) return memoizedKey

  const stored = sessionStorage.getItem("keyra_encryption_key")
  if (stored) {
    memoizedKey = stored
    return stored
  }

  throw new Error("Vault encryption key is not initialized. Please log in to decrypt your keys.")
}

export function clearCryptoCache() {
  memoizedKey = null
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem("keyra_encryption_key")
  }
}

export async function initializeEncryptionKey(password: string): Promise<void> {
  if (typeof window === 'undefined') return
  const enc = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(password))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  sessionStorage.setItem("keyra_encryption_key", hashHex)
  memoizedKey = hashHex
}

export async function encrypt(
  plaintext: string,
  password: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const keyMaterial = await getKeyMaterial(password)
  const key = await deriveKey(keyMaterial, salt)
  const enc = new TextEncoder()
  let ciphertext: ArrayBuffer
  try {
    ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      enc.encode(plaintext)
    )
  } catch (err) {
    throw new Error("Encryption failed: " + (err instanceof Error ? err.message : String(err)))
  }
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length)
  return btoa(Array.from(combined, (b) => String.fromCharCode(b)).join(""))
}

export async function decrypt(
  ciphertext: string,
  password: string
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const data = combined.slice(SALT_LENGTH + IV_LENGTH)
  const keyMaterial = await getKeyMaterial(password)

  // 1. Try decrypting using default/current iterations (600,000)
  try {
    const key = await deriveKey(keyMaterial, salt, PBKDF2_ITERATIONS)
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      data as BufferSource
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    // 2. Fall back to 100,000 iterations for existing/legacy keys
    try {
      const legacyKey = await deriveKey(keyMaterial, salt, 100000)
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        legacyKey,
        data as BufferSource
      )
      return new TextDecoder().decode(decrypted)
    } catch (legacyErr) {
      throw new Error("Decryption failed: " + (legacyErr instanceof Error ? legacyErr.message : String(legacyErr)))
    }
  }
}

export async function encryptWithStore(
  plaintext: string
): Promise<string> {
  return encrypt(plaintext, getEncryptionPassword())
}

export async function decryptWithStore(
  ciphertext: string
): Promise<string> {
  return decrypt(ciphertext, getEncryptionPassword())
}

export function generateKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  const sections = [8, 4, 4, 12]
  return sections
    .map((len) => {
      const arr = new Uint32Array(len)
      crypto.getRandomValues(arr)
      return Array.from(arr, (val) => chars[val % chars.length]).join("")
    })
    .join("-")
}

export function generateSymmetricKey(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode.apply(null, Array.from(arr)))
}
