'use client'

import { useEffect, useState } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { Search, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface User {
  id: number
  username: string
  email: string
  enabled: boolean
  totalIncome: number
  totalExpense: number
  totalTransactions: number
  currency?: string
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchKey, setSearchKey] = useState('')
  const [pageNumber, setPageNumber] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchUsers()
  }, [searchKey, pageNumber])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getAllUsers({
        pageNumber,
        pageSize: 10,
        searchKey,
      })
      if (response?.response?.data && Array.isArray(response.response.data)) {
        setUsers(response.response.data)
        setTotalPages(response.response.totalNoOfPages || 0)
      } else {
        setUsers([])
        setTotalPages(0)
      }
    } catch (error: any) {
      setUsers([])
      setTotalPages(0)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await apiClient.toggleUserStatus(userId, !currentStatus)
      toast.success(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`)
      fetchUsers()
    } catch (error: any) {
      toast.error('Failed to update user status')
    }
  }

  return (
    <ProtectedLayout requireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all user accounts</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by username or email..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : users.length > 0 ? (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Income</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Expense</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Transactions</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={index !== users.length - 1 ? 'border-b' : ''}
                        >
                          <td className="px-4 py-3 text-sm">{user.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-right text-sm text-green-600">
                            {formatCurrency(user.totalIncome || 0, user.currency || 'USD')}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-red-600">
                            {formatCurrency(user.totalExpense || 0, user.currency || 'USD')}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {user.totalTransactions || 0}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                user.enabled
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {user.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant={user.enabled ? 'destructive' : 'default'}
                              onClick={() => handleToggleStatus(user.id, user.enabled)}
                            >
                              {user.enabled ? (
                                <>
                                  <UserX className="mr-1 h-3 w-3" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-1 h-3 w-3" />
                                  Enable
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPageNumber(Math.max(0, pageNumber - 1))}
                  disabled={pageNumber === 0}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {pageNumber + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPageNumber(Math.min(totalPages - 1, pageNumber + 1))}
                  disabled={pageNumber === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  )
}
