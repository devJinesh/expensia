'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, AuthResponse } from '@/types'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: () => boolean
  isUser: () => boolean
  updateUser: (updates: Partial<User>) => void
  refreshUserPreferences: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        if (parsedUser?.email) {
          apiClient.getUserPreferences(parsedUser.email)
            .then(response => {
              if (response?.response) {
                const updatedUser = {
                  ...parsedUser,
                  timezone: response.response.timezone,
                  currency: response.response.currency
                }
                setUser(updatedUser)
                localStorage.setItem('user', JSON.stringify(updatedUser))
              }
            })
            .catch(() => {})
        }
      } catch (error) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await apiClient.signIn(email, password)
      
      const userData: User = {
        id: response.id,
        username: response.username,
        email: response.email,
        roles: response.roles,
      }

      try {
        const prefsResponse = await apiClient.getUserPreferences(response.email)
        if (prefsResponse?.response) {
          userData.timezone = prefsResponse.response.timezone
          userData.currency = prefsResponse.response.currency
        }
      } catch (error) {}

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)

      if (response.roles.includes('ROLE_ADMIN')) {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }

      toast.success('Login successful!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/auth/login')
    toast.success('Logged out successfully')
  }

  const isAdmin = () => {
    return user?.roles?.includes('ROLE_ADMIN') || false
  }

  const isUser = () => {
    return user?.roles?.includes('ROLE_USER') || false
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const refreshUserPreferences = async () => {
    if (!user) return
    try {
      const response = await apiClient.getUserPreferences(user.email)
      if (response?.response) {
        updateUser({
          timezone: response.response.timezone,
          currency: response.response.currency
        })
      }
    } catch (error) {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isUser, updateUser, refreshUserPreferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
