'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api-client'
import { formatCurrency, formatDate, getRelativeDate } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, X, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Transaction, Category } from '@/types'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [searchKey, setSearchKey] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [pageNumber, setPageNumber] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    categoryId: '',
    accountId: '',
  })

  useEffect(() => {
    if (user) {
      fetchTransactions()
      fetchCategories()
      fetchAccounts()
    }
  }, [user, searchKey, filterType, pageNumber])

  const fetchTransactions = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await apiClient.getTransactionsByUser({
        email: user.email,
        pageNumber,
        pageSize: 10,
        searchKey,
        sortField: 'date',
        sortDirec: 'desc',
        transactionType: filterType === 'all' ? '' : filterType,
      })
      
      const pageData = response?.response
      let transactionsArray = []
      if (Array.isArray(pageData?.data)) {
        transactionsArray = pageData.data
      } else if (pageData?.data && typeof pageData.data === 'object') {
        transactionsArray = Object.values(pageData.data).flat()
      } else if (Array.isArray(pageData)) {
        transactionsArray = pageData
      }
      
      setTransactions(Array.isArray(transactionsArray) ? transactionsArray : [])
      setTotalPages(pageData?.totalNoOfPages || pageData?.totalPages || 0)
    } catch (error: any) {
      setTransactions([])
      setTotalPages(0)
      if (error?.response?.status !== 404) {
        toast.error('Failed to fetch transactions')
      }
    } finally {
      setLoading(false)
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
    }
  }

  const fetchAccounts = async () => {
    if (!user) return
    try {
      const response = await apiClient.getAccountsByUser(user.email)
      const accountsData = response?.response || []
      if (Array.isArray(accountsData)) {
        setAccounts(accountsData)
      } else {
        setAccounts([])
      }
    } catch (error) {
      setAccounts([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.categoryId || !user) {
      toast.error('Please fill in all required fields (Amount and Category)')
      return
    }

    try {
      const timestamp = `${formData.date}T${formData.time}:00`
      
      const data = {
        description: formData.description || '',
        amount: parseFloat(formData.amount),
        date: formData.date,
        timestamp: timestamp,
        categoryId: parseInt(formData.categoryId),
        accountId: formData.accountId ? parseInt(formData.accountId) : null,
        userEmail: user.email,
      }

      if (editingTransaction) {
        await apiClient.updateTransaction(editingTransaction.id, data)
        toast.success('Transaction updated successfully')
      } else {
        await apiClient.addTransaction(data)
        toast.success('Transaction added successfully')
      }

      setShowModal(false)
      setEditingTransaction(null)
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        categoryId: '',
        accountId: '',
      })
      await fetchTransactions()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save transaction')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      date: transaction.date,
      time: transaction.timestamp ? new Date(transaction.timestamp).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5),
      categoryId: transaction.category.id.toString(),
      accountId: transaction.account?.id?.toString() || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await apiClient.deleteTransaction(id)
      toast.success('Transaction deleted successfully')
      fetchTransactions()
    } catch (error: any) {
      toast.error('Failed to delete transaction')
    }
  }

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {}
    transactions.forEach((transaction) => {
      if (!transaction.date) {
        return
      }
      
      const dateKey = getRelativeDate(transaction.date)
      
      if (dateKey === 'Invalid Date') {
        return
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(transaction)
    })
    return grouped
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
          <Button onClick={() => {
            setFormData({
              description: '',
              amount: '',
              date: new Date().toISOString().split('T')[0],
              time: new Date().toTimeString().slice(0, 5),
              categoryId: '',
              accountId: '',
            })
            setShowModal(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="flex h-10 w-full sm:w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Transactions</option>
                <option value="TYPE_INCOME">Income</option>
                <option value="TYPE_EXPENSE">Expense</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : Object.keys(groupedTransactions).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txns]) => (
              <div key={date}>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{date}</h3>
                <Card>
                  <CardContent className="p-0">
                    {txns.map((transaction, index) => (
                      <div
                        key={`${date}-${transaction.id}-${index}`}
                        className={`flex items-center justify-between p-4 ${
                          index !== txns.length - 1 ? 'border-b' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              transaction.transactionType?.name === 'INCOME'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900'
                                : 'bg-red-100 text-red-600 dark:bg-red-900'
                            }`}
                          >
                            {transaction.category?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.category?.name || 'Unknown Category'}
                              {transaction.account && ` • ${transaction.account.accountName}`}
                              {' • '}{formatDate(transaction.date)}
                              {transaction.timestamp && ` at ${new Date(transaction.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p
                            className={`text-lg font-semibold ${
                              transaction.transactionType?.name === 'INCOME'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.transactionType?.name === 'INCOME' ? '+' : '-'}
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
              </div>
            ))}

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
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Receipt className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">No transactions yet</h3>
              <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                {searchKey || filterType !== 'all' 
                  ? 'No transactions match your search criteria. Try adjusting your filters.'
                  : 'Start tracking your finances by adding your first transaction.'
                }
              </p>
              {!searchKey && filterType === 'all' && (
                <Button onClick={() => {
                  setFormData({
                    description: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().slice(0, 5),
                    categoryId: '',
                    accountId: '',
                  })
                  setShowModal(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Transaction
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
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
                      date: new Date().toISOString().split('T')[0],
                      time: new Date().toTimeString().slice(0, 5),
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
                      <option key={`cat-${cat.id}`} value={cat.id}>
                        {cat.name} ({cat.transactionType.name.replace('TYPE_', '').toLowerCase().replace(/^\w/, c => c.toUpperCase())})
                      </option>
                    ))}
                  </select>
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
                    {accounts.map((account) => (
                      <option key={`acc-${account.id}`} value={account.id}>
                        {account.accountName} ({account.accountType})
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
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
