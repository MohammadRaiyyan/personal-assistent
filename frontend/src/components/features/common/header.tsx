import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthContext } from '@/context/auth-context'
import { Link } from '@tanstack/react-router'
import {
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PenBox,
  Settings,
} from 'lucide-react'

const NAV = [
  { to: '/app', label: 'Insights', icon: LayoutDashboard, exact: true },
  { to: '/app/resume', label: 'Resume', icon: FileText, exact: true },
  {
    to: '/app/cover-letters',
    label: 'Cover Letters',
    icon: PenBox,
    exact: true,
  },
  {
    to: '/app/interview',
    label: 'Interview Prep',
    icon: GraduationCap,
    exact: false,
  },
]

function Header() {
  const { session, logout } = useAuthContext()

  const initials =
    session?.user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?'

  const handleLogout = async () => {
    await logout()
    // Hard redirect resets all React/auth state so the landing page's
    // beforeLoad doesn't see a stale isAuthenticated:true and loop back to /app.
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60">
      <nav className=" px-4 h-14 flex items-center justify-between">
        <Link to="/app" className="text-xl font-bold gradient-title">
          TrajectAI
        </Link>

        <div className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              activeProps={{
                className: 'bg-secondary text-secondary-foreground',
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm hover:bg-secondary/50 transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:block">{label}</span>
            </Link>
          ))}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium truncate">
                  {session?.user.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {session?.user.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/app/settings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}

export default Header
