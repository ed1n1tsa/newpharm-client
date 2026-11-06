'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

export type AuthTab = 'login' | 'register'

type AuthContextType = {
  isAuthOpen: boolean
  authTab: AuthTab
  openAuth: (tab?: AuthTab) => void
  closeAuth: () => void
  setAuthTab: (tab: AuthTab) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider/>')
  return ctx
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<AuthTab>('login')

  const openAuth = useCallback((tab: AuthTab = 'login') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
  }, [])

  const closeAuth = useCallback(() => {
    setIsAuthOpen(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthOpen, authTab, openAuth, closeAuth, setAuthTab }),
    [isAuthOpen, authTab, openAuth, closeAuth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
