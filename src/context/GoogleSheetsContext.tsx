import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'

type GoogleSheetsCtx = {
  token: string | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

const Ctx = createContext<GoogleSheetsCtx>({
  token: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
})

const TOKEN_KEY = 'gs_token'
const EXPIRY_KEY = 'gs_expiry'

function loadStoredToken(): string | null {
  try {
    const t = localStorage.getItem(TOKEN_KEY)
    const exp = Number(localStorage.getItem(EXPIRY_KEY) ?? 0)
    return t && Date.now() < exp ? t : null
  } catch {
    return null
  }
}

export function GoogleSheetsProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(loadStoredToken)

  const saveToken = useCallback((accessToken: string, expiresIn: number) => {
    const expiry = Date.now() + (expiresIn - 60) * 1000
    setToken(accessToken)
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(EXPIRY_KEY, String(expiry))
  }, [])

  const disconnect = useCallback(() => {
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRY_KEY)
  }, [])

  const login = useGoogleLogin({
    onSuccess: (res) => saveToken(res.access_token, res.expires_in),
    onError: () => console.warn('Google auth failed'),
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  })

  // Auto-expire
  useEffect(() => {
    if (!token) return
    const exp = Number(localStorage.getItem(EXPIRY_KEY) ?? 0)
    const ms = exp - Date.now()
    if (ms <= 0) { disconnect(); return }
    const t = setTimeout(disconnect, ms)
    return () => clearTimeout(t)
  }, [token, disconnect])

  return (
    <Ctx.Provider value={{ token, isConnected: !!token, connect: login, disconnect }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGoogleSheets() {
  return useContext(Ctx)
}
