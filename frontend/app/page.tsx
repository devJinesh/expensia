'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Shield, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/context/auth-context'

export default function Home() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (user) {
      if (isAdmin()) {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, isAdmin, router])
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center lg:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Image 
                src="/logo.svg"
                alt="Expensia Logo"
                width={64}
                height={64}
                className="h-16 w-16"
                priority
              />
            </div>
          </div>
          
          {/* App Name - Primary Focus */}
          <div className="mb-4">
            <h1 className="mb-2 text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              <span className="text-primary">Expensia</span>
            </h1>
            <p className="text-xl text-muted-foreground sm:text-2xl font-medium">
              Your Personal Finance Manager
            </p>
          </div>

          {/* Tagline - Secondary */}
          <p className="mb-8 mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            Take control of your financial future. Track expenses, manage budgets, 
            and gain valuable insights into your spending habits.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything You Need to Manage Your Money
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Track Transactions</h3>
              <p className="text-muted-foreground">
                Easily add, edit, and categorize your income and expenses in real-time.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Visual Analytics</h3>
              <p className="text-muted-foreground">
                Get detailed insights with charts and reports to understand your spending patterns.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your financial data is encrypted and protected with industry-standard security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users who are already managing their finances smarter.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Create Your Free Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.svg"
                alt="Expensia Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="text-xl font-bold">Expensia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted personal finance manager
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Expensia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
