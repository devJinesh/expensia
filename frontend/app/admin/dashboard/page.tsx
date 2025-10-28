'use client'

import { useEffect, useState } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Receipt, FolderKanban, TrendingUp, HardDrive } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [systemData, setSystemData] = useState<any>(null)

  useEffect(() => {
    fetchSystemOverview()
  }, [])

  const fetchSystemOverview = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getSystemOverview()
      setSystemData(response.response)
    } catch (error: any) {
      console.error('Error fetching system overview:', error)
      toast.error('Failed to load system overview')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedLayout requireAdmin>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </ProtectedLayout>
    )
  }
  return (
    <ProtectedLayout requireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemData?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemData?.totalTransactions || 0}</div>
              <p className="text-xs text-muted-foreground">All transactions in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemData?.totalCategories || 0}</div>
              <p className="text-xs text-muted-foreground">System categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemData?.storageUsedMB ? `${systemData.storageUsedMB.toFixed(2)} MB` : '0 MB'}
              </div>
              <p className="text-xs text-muted-foreground">Upload directory size</p>
            </CardContent>
          </Card>
        </div>

        {/* User Statistics */}
        {systemData && (
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Breakdown of users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{systemData.totalUsers || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Administrators</p>
                  <p className="text-3xl font-bold text-blue-600">{systemData.totalAdmins || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                  <p className="text-3xl font-bold text-green-600">{systemData.totalRegularUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Logs */}
        {systemData && systemData.recentLogs && systemData.recentLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>Last 50 log entries</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs max-h-[400px] overflow-y-auto">
                {systemData.recentLogs.join('\n')}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <a
                href="/admin/users"
                className="flex flex-col items-center justify-center rounded-lg border p-6 transition-colors hover:bg-accent"
              >
                <Users className="mb-2 h-8 w-8 text-primary" />
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-muted-foreground">View and manage user accounts</p>
              </a>
              <a
                href="/admin/categories"
                className="flex flex-col items-center justify-center rounded-lg border p-6 transition-colors hover:bg-accent"
              >
                <FolderKanban className="mb-2 h-8 w-8 text-primary" />
                <h3 className="font-semibold">Manage Categories</h3>
                <p className="text-sm text-muted-foreground">Add and edit categories</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
