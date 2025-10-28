'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedLayout({ children, requireAdmin = false }: ProtectedLayoutProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
      } else if (requireAdmin && !isAdmin()) {
        router.push('/unauthorized')
      }
    }
  }, [user, loading, requireAdmin, isAdmin, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user || (requireAdmin && !isAdmin())) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
