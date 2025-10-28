'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Select } from '@/components/ui/select' // Using native select
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api-client'
import { formatCurrency, formatDate, formatTransactionType } from '@/lib/utils'
import { Plus, Check, SkipForward, Edit, Trash2, X, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { SavedTransaction, Category } from '@/types'

export default function SavedTransactionsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savedTransactions, setSavedTransactions] = useState<SavedTransaction[]>([])
  const [dueTransactions, setDueTransactions] = useState<SavedTransaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<SavedTransaction | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    frequency: 'monthly',
    categoryId: '',
    accountId: '',
  })

  useEffect(() => {
    if (user) {
      fetchSavedTransactions()
      fetchDueTransactions()
      fetchCategories()
      fetchAccounts()
    }
  }, [user])

  const fetchSavedTransactions = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await apiClient.getSavedTransactionsByUser(user.id)
      const savedTxns = response?.response || []
      if (Array.isArray(savedTxns)) {
        setSavedTransactions(savedTxns)
      } else {
        setSavedTransactions([])
      }
    } catch (error: any) {
      setSavedTransactions([])
      // Only show error if it's not a 404
      if (error?.response?.status !== 404) {
        toast.error('Failed to fetch saved transactions')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDueTransactions = async () => {
    if (!user) return

    try {
      const response = await apiClient.getSavedTransactionsByMonth(user.id)
      const dueTxns = response?.response || []
      if (Array.isArray(dueTxns)) {
        setDueTransactions(dueTxns)
      } else {
        setDueTransactions([])
      }
    } catch (error) {
      setDueTransactions([])
      // Silently handle
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getAllCategories()
      if (response?.response && Array.isArray(response.response)) {
        setCategories(response.response.filter((cat: Category) => cat.enabled))
      } else if (Array.isArray(response)) {
        setCategories(response.filter((cat: Category) => cat.enabled))
      } else {
        setCategories([])
      }
    } catch (error) {
      setCategories([])
      // Silently handle
    }
  }

  const fetchAccounts = async () => {
    if (!user?.email) return
    try {
      const response = await apiClient.getAccountsByUser(user.email)
      console.log('Accounts API response:', response)
      // ApiResponseDto structure: response.response contains the actual data
      const accountsData = response?.response
      if (Array.isArray(accountsData)) {
        console.log('Accounts loaded:', accountsData.length)
        setAccounts(accountsData)
      } else {
        console.log('No accounts array found in response')
        setAccounts([])
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setAccounts([])
      // Silently handle - accounts are optional
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.categoryId || !user) {
      toast.error('Please fill in all required fields (Amount and Category)')
      return
    }

    try {
      // Convert frequency to backend enum format
      const frequencyMap: { [key: string]: string } = {
        'one time': 'ONE_TIME',
        'daily': 'DAILY',
        'monthly': 'MONTHLY'
      }
      
      const data = {
        description: formData.description || '',
        amount: parseFloat(formData.amount),
        upcomingDate: formData.startDate,
        frequency: frequencyMap[formData.frequency] || formData.frequency.toUpperCase(),
        categoryId: parseInt(formData.categoryId),
        accountId: formData.accountId ? parseInt(formData.accountId) : null,
        userId: user.id,
      }
      
      console.log('Saved transaction data:', data)

      if (editingTransaction) {
        const result = await apiClient.editSavedTransaction(editingTransaction.id, data)
        console.log('Saved transaction update result:', result)
        toast.success('Saved transaction updated successfully')
      } else {
        const result = await apiClient.createSavedTransaction(data)
        console.log('Saved transaction creation result:', result)
        toast.success('Saved transaction created successfully')
      }

      setShowModal(false)
      setEditingTransaction(null)
      setFormData({
        description: '',
        amount: '',
        startDate: new Date().toISOString().split('T')[0],
        frequency: 'monthly',
        categoryId: '',
        accountId: '',
      })
      fetchSavedTransactions()
      fetchDueTransactions()
    } catch (error: any) {
      console.error('Save transaction error:', error)
      toast.error(error.response?.data?.message || 'Failed to save transaction')
    }
  }

  const handleConfirm = async (id: number) => {
    try {
      console.log('Confirming saved transaction with ID:', id)
      console.log('Current user:', user)
      console.log('Token exists:', !!localStorage.getItem('token'))
      
      const result = await apiClient.addSavedTransaction(id)
      console.log('Add saved transaction result:', result)
      toast.success('Transaction added successfully')
      // Refresh both lists to update the UI
      await Promise.all([fetchDueTransactions(), fetchSavedTransactions()])
    } catch (error: any) {
      console.error('Add saved transaction error:', error)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add transaction'
      toast.error(errorMessage)
      // Don't throw - handle gracefully
    }
  }

  const handleSkip = async (id: number) => {
    try {
      const result = await apiClient.skipSavedTransaction(id)
      console.log('Skip saved transaction result:', result)
      toast.success('Transaction skipped')
      // Refresh both lists to update the UI
      await Promise.all([fetchDueTransactions(), fetchSavedTransactions()])
    } catch (error: any) {
      console.error('Skip saved transaction error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to skip transaction'
      toast.error(errorMessage)
      // Don't throw - handle gracefully
    }
  }

  const handleEdit = (transaction: SavedTransaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      startDate: transaction.startDate || new Date().toISOString().split('T')[0],
      frequency: transaction.frequency.toLowerCase(),
      categoryId: '',  // Will need to be set from categoryName lookup if needed
      accountId: '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this saved transaction?')) return

    try {
      await apiClient.deleteSavedTransaction(id)
      toast.success('Saved transaction deleted successfully')
      fetchSavedTransactions()
      fetchDueTransactions()
    } catch (error: any) {
      toast.error('Failed to delete saved transaction')
    }
  }

  const getDueStatus = (transaction: SavedTransaction) => {
    if (!transaction.nextDueDate) {
      return { label: 'No Due Date', color: 'text-gray-600', icon: Clock }
    }
    
    const today = new Date()
    const dueDate = new Date(transaction.nextDueDate)
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < today) {
      return { label: 'Overdue', color: 'text-red-600', icon: AlertCircle }
    } else if (dueDate.getTime() === today.getTime()) {
      return { label: 'Due Today', color: 'text-orange-600', icon: Clock }
    } else {
      return { label: 'Upcoming', color: 'text-blue-600', icon: Clock }
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Saved Transactions</h1>
            <p className="text-muted-foreground">Manage recurring and planned transactions</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Saved Transaction
          </Button>
        </div>

        {/* Due Transactions */}
        {dueTransactions.length > 0 && (
          <div>
            <h2 className="mb-3 text-xl font-semibold">Due Transactions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {dueTransactions.map((transaction) => {
                const status = getDueStatus(transaction)
                const StatusIcon = status.icon
                return (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.categoryName || 'Unknown Category'}
                          </p>
                        </div>
                        <p className="text-lg font-semibold">
                          {formatCurrency(transaction.amount, user?.currency || 'USD')}
                        </p>
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.label}{transaction.nextDueDate && ` - ${formatDate(transaction.nextDueDate)}`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(transaction.id)}
                          className="flex-1"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSkip(transaction.id)}
                        >
                          <SkipForward className="mr-1 h-4 w-4" />
                          Skip
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* All Saved Transactions */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">All Saved Transactions</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : savedTransactions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                {savedTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 ${
                      index !== savedTransactions.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {transaction.categoryName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.categoryName || 'Unknown'} • {transaction.frequency}{transaction.nextDueDate && ` • Next: ${formatDate(transaction.nextDueDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold">
                        {formatCurrency(transaction.amount, user?.currency || 'USD')}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <p className="text-muted-foreground">No saved transactions found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingTransaction ? 'Edit Saved Transaction' : 'Add Saved Transaction'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTransaction(null)
                    setFormData({
                      description: '',
                      amount: '',
                      startDate: new Date().toISOString().split('T')[0],
                      frequency: 'monthly',
                      categoryId: '',
                      accountId: '',
                    })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={`category-${cat.id}`} value={cat.id}>
                        {cat.name} ({cat.transactionType ? formatTransactionType(cat.transactionType.name) : 'Unknown'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account (Optional)</Label>
                  <select
                    id="account"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">No account</option>
                    {accounts.map((acc) => (
                      <option key={`account-${acc.id}`} value={acc.id}>
                        {acc.accountName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="one time">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    type="text"
                    maxLength={50}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional (max 50 characters)"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTransaction ? 'Update' : 'Add'} Transaction
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingTransaction(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </ProtectedLayout>
  )
}
