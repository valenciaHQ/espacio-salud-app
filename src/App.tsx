import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { useAuth } from '@/hooks/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { ProfessionalsPage } from '@/pages/ProfessionalsPage'
import { PatientsPage } from '@/pages/PatientsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { GoogleSheetsProvider, NoopGoogleSheetsProvider } from '@/context/GoogleSheetsContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

function AuthGuard() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/profesionales" element={<ProfessionalsPage />} />
            <Route path="/pacientes" element={<PatientsPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  const core = (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )

  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <GoogleSheetsProvider>{core}</GoogleSheetsProvider>
      </GoogleOAuthProvider>
    )
  }

  return <NoopGoogleSheetsProvider>{core}</NoopGoogleSheetsProvider>
}
