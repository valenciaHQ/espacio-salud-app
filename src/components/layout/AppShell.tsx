import { Outlet, NavLink } from 'react-router-dom'
import { CalendarDays, Users, UserRound, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'

const mobileNavItems = [
  { to: '/', icon: CalendarDays, label: 'Agenda' },
  { to: '/profesionales', icon: Users, label: 'Profes' },
  { to: '/pacientes', icon: UserRound, label: 'Pacientes' },
  { to: '/configuracion', icon: Settings, label: 'Config' },
]

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-16 sm:pb-0">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white sm:hidden">
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-500'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
