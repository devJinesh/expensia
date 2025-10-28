'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')
      const error = searchParams.get('error')

      if (error) {
        toast.error('OAuth authentication failed: ' + error)
        router.push('/auth/login')
        return
      }

      if (token && email) {
        try {
          // Store token and fetch user details
          localStorage.setItem('token', token)
          
          // Fetch user details using the token
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/settings/preferences?email=${email}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const userData = await response.json()
            
            // Store user data
            const user = {
              email: email,
              username: email.split('@')[0],
              roles: ['ROLE_USER'],
              timezone: userData.data?.timezone || 'UTC',
              currency: userData.data?.currency || 'USD'
            }
            
            localStorage.setItem('user', JSON.stringify(user))
            
            toast.success('Successfully logged in with Google!')
            router.push('/dashboard')
          } else {
            throw new Error('Failed to fetch user details')
          }
        } catch (error) {
          toast.error('Failed to fetch user details')
          router.push('/auth/login')
        }
      } else {
        toast.error('Invalid OAuth callback')
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Completing authentication...</p>
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
