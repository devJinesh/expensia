'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import {
  LayoutDashboard,
  Receipt,
  Calendar,
  BarChart3,
  Settings,
  Users,
  FolderKanban,
  Wallet,
  PiggyBank,
  CreditCard,
} from 'lucide-react'

const userNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/accounts', label: 'Accounts', icon: CreditCard },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/saved-transactions', label: 'Saved Transactions', icon: Calendar },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderKanban },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin, user } = useAuth()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  
  // Don't render sidebar if no user
  if (!user) return null
  
  const navItems = isAdmin() ? adminNavItems : userNavItems

  useEffect(() => {
    if (user?.email) {
      fetchProfileImage()
    }
  }, [user])

  const fetchProfileImage = async () => {
    if (!user?.email) return
    try {
      const response = await apiClient.getProfileImage(user.email)
      if (response?.response) {
        setProfileImage(`data:image/jpeg;base64,${response.response}`)
      }
    } catch (error) {
      // Silently handle - user may not have uploaded an image
      setProfileImage(null)
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--color-border)] bg-[var(--color-card)] shadow-lg">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
          <Link href={isAdmin() ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="rounded-lg bg-[var(--color-primary)] p-2">
              <Wallet className="h-5 w-5 text-[var(--color-primary-foreground)]" />
            </div>
            <span className="text-xl font-bold">Expensia</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm'
                    : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info Footer */}
        <div className="border-t border-[var(--color-border)] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[var(--color-muted)]/50 px-3 py-2">
            {profileImage ? (
              <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-[var(--color-primary)]">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.username}</p>
              <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                {isAdmin() ? 'Administrator' : 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
