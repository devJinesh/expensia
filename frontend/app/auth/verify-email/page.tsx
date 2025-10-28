'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code) {
      toast.error('Please enter the verification code')
      return
    }

    setLoading(true)
    try {
      await apiClient.verifyEmail(code)
      setVerified(true)
      toast.success('Email verified successfully!')
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Countdown timer for OTP expiration
    if (timeRemaining > 0 && !verified) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, verified])

  useEffect(() => {
    // Cooldown timer for resend rate limit
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found')
      return
    }

    setResending(true)
    try {
      await apiClient.resendVerificationCode(email)
      toast.success('Verification code resent to your email')
      // Reset timer and set cooldown
      setTimeRemaining(600)
      setCanResend(false)
      setResendCooldown(120) // 2 minutes cooldown
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend code'
      toast.error(errorMessage)
      
      // Handle rate limiting
      if (errorMessage.includes('wait')) {
        const match = errorMessage.match(/(\d+)/)
        if (match) {
          const seconds = parseInt(match[1])
          setCanResend(false)
          setResendCooldown(seconds)
        }
      }
      
      // Handle max attempts exceeded
      if (errorMessage.includes('exceeded') || errorMessage.includes('Maximum')) {
        setCanResend(false)
      }
    } finally {
      setResending(false)
    }
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>
              Your account has been successfully verified. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification code to <strong>{email}</strong>
          </CardDescription>
          {timeRemaining > 0 ? (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Code expires in: <strong>{formatTime(timeRemaining)}</strong></span>
            </div>
          ) : (
            <p className="text-sm text-red-600 mt-2">Code has expired. Please request a new one.</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Button
              variant="link"
              onClick={handleResend}
              disabled={resending || !canResend || resendCooldown > 0}
              className="text-sm"
            >
              {resending ? 'Resending...' : 
               resendCooldown > 0 ? `Wait ${formatTime(resendCooldown)} to resend` :
               !canResend ? 'Maximum attempts reached' :
               "Didn't receive code? Resend"}
            </Button>
            {resendCooldown > 0 && (
              <p className="text-xs text-muted-foreground">
                You can resend the code in {formatTime(resendCooldown)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
