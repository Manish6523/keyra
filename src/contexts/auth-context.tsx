"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { clearCryptoCache } from "@/lib/crypto"
import { checkAndGeneratePKI, clearProjectKeyCache } from "@/lib/pki"
import { useVaultStore } from "@/store/vault"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
      const session = res.data?.session || null
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session) {
        checkAndGeneratePKI().catch(console.error)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session)
      
      // If user ID changed (e.g. they logged out or switched accounts), clear the vault immediately
      if (session?.user?.id !== user?.id) {
        useVaultStore.getState().clearVault()
      }
      
      setUser(session?.user ?? null)
      setLoading(false)
      if (session) {
        checkAndGeneratePKI().catch(console.error)
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      clearCryptoCache()
      clearProjectKeyCache()
      useVaultStore.getState().clearVault()
    } catch (err) {
      console.error("Sign out failed", err)
    } finally {
      setUser(null)
      setSession(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
