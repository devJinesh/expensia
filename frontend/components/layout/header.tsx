'use client'

import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  onMenuClick?: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/accounts': 'Accounts',
  '/budgets': 'Budgets',
  '/saved-transactions': 'Saved Transactions',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/categories': 'Category Management',
  '/admin/settings': 'Admin Settings',
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const pageTitle = pageTitles[pathname] || 'Dashboard'

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {user?.username} • {user?.email}
          </p>
        </div>
        <div className="sm:hidden">
          <h2 className="text-base font-semibold">{pageTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="relative"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout}
          aria-label="Logout"
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
