'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, Receipt, PieChart, Wallet, AlertTriangle, Target } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    cashInHand: 0,
    totalTransactions: 0,
  })
  const [dashboardSummary, setDashboardSummary] = useState<any>(null)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [budget, setBudget] = useState<any>(null)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetProgress, setBudgetProgress] = useState<any[]>([])

  useEffect(() => {
    if (user?.id && user?.email) {
      fetchDashboardData()
    } else if (user) {
      setLoading(false)
      toast.error('User data is incomplete. Please log in again.')
    }
  }, [user, selectedMonth, selectedYear])

  const fetchDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const incomeRes = await apiClient.getTotalIncomeOrExpense({
        userId: user.id,
        transactionTypeId: 2,
        month: selectedMonth,
        year: selectedYear,
      })

      const expenseRes = await apiClient.getTotalIncomeOrExpense({
        userId: user.id,
        transactionTypeId: 1,
        month: selectedMonth,
        year: selectedYear,
      })

      const countRes = await apiClient.getTotalNoOfTransactions({
        userId: user.id,
        month: selectedMonth,
        year: selectedYear,
      })

      try {
        const budgetRes = await apiClient.getBudget({
          userId: user.id,
          month: selectedMonth,
          year: selectedYear,
        })
        setBudget(budgetRes?.response || null)
      } catch (error) {
        setBudget(null)
      }

      const incomeValue = incomeRes?.response ?? 0
      const expenseValue = expenseRes?.response ?? 0
      const countValue = countRes?.response ?? 0

      setStats({
        totalIncome: incomeValue,
        totalExpense: expenseValue,
        cashInHand: incomeValue - expenseValue,
        totalTransactions: countValue,
      })

      await fetchCategoryExpenses()
      await fetchBudgetProgress()
      await fetchDashboardSummary()
    } catch (error: any) {
      toast.error('Failed to load dashboard data. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgetProgress = async () => {
    if (!user) return

    try {
      const response = await apiClient.getBudgetProgress(user.email, selectedMonth, selectedYear)
      const progressData = response?.response || []
      setBudgetProgress(progressData)
    } catch (error) {
      setBudgetProgress([])
    }
  }

  const fetchDashboardSummary = async () => {
    if (!user) return

    try {
      const response = await apiClient.getDashboardSummary(user.email)
      setDashboardSummary(response?.response || null)
    } catch (error) {
      setDashboardSummary(null)
    }
  }

  const fetchCategoryExpenses = async () => {
    if (!user) return

    try {
      const response = await apiClient.getAllCategories()
      const categoriesArray = response?.response || []
      
      if (!Array.isArray(categoriesArray)) {
        setCategoryData([])
        return
      }
      
      const expenseCategories = categoriesArray.filter(
        (cat: any) => cat.transactionType?.id === 1 && cat.enabled
      )

      const categoryExpenses = await Promise.all(
        expenseCategories.map(async (cat: any) => {
          try {
            const res = await apiClient.getTotalByCategory({
              email: user.email,
              categoryId: cat.id,
              month: selectedMonth,
              year: selectedYear,
            })
            return {
              name: cat.name,
              value: res.response || res.data || res || 0,
            }
          } catch (error) {
            return { name: cat.name, value: 0 }
          }
        })
      )

      setCategoryData(categoryExpenses.filter((item) => item.value > 0))
    } catch (error) {
      setCategoryData([])
    }
  }

  const handleCreateBudget = async () => {
    if (!user || !budgetAmount) {
      toast.error('Please enter a budget amount')
      return
    }

    try {
      const budgetData = {
        amount: parseFloat(budgetAmount),
        month: selectedMonth,
        year: selectedYear,
        userId: user.id,
      }
      await apiClient.createBudget(budgetData)
      toast.success('Budget created successfully')
      setShowBudgetForm(false)
      setBudgetAmount('')
      await fetchDashboardData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create budget')
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthName = getMonthName(i + 1)
    return {
      value: i + 1,
      label: typeof monthName === 'string' ? monthName : `Month ${i + 1}`,
    }
  })

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  const hasNoData = stats.totalIncome === 0 && stats.totalExpense === 0 && stats.totalTransactions === 0

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your financial activity</p>
          </div>
          <select
            value={selectedMonth.toString()}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label} {selectedYear}
              </option>
            ))}
          </select>
        </div>

        {hasNoData && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Welcome to Expensia!</h3>
              <p className="mb-4 text-sm text-muted-foreground max-w-md">
                Start tracking your finances by adding your first transaction. Click the "Add Transaction" button in the Transactions page to get started.
              </p>
              <Button onClick={() => router.push('/transactions')}>
                Go to Transactions
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome, user?.currency || 'USD')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense, user?.currency || 'USD')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash in Hand</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardSummary ? formatCurrency(dashboardSummary.consolidatedBalance, user?.currency || 'USD') : formatCurrency(stats.cashInHand, user?.currency || 'USD')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Expense by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value, user?.currency || 'USD')} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <PieChart className="mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No expense data</p>
                  <p className="text-xs text-muted-foreground">
                    Add transactions to see your spending breakdown
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Budget Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budget ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent</span>
                      <span className="font-medium">
                        {formatCurrency(stats.totalExpense, user?.currency || 'USD')} / {formatCurrency(budget.amount, user?.currency || 'USD')}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min((stats.totalExpense / budget.amount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-xl font-bold">{formatCurrency(budget.amount, user?.currency || 'USD')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(Math.max(budget.amount - stats.totalExpense, 0), user?.currency || 'USD')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : showBudgetForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Budget Amount</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateBudget}>Create Budget</Button>
                    <Button variant="outline" onClick={() => setShowBudgetForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center gap-4">
                  <p className="text-muted-foreground">No budget set for this month</p>
                  <Button onClick={() => setShowBudgetForm(true)}>Set Budget</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {dashboardSummary && dashboardSummary.accountSummaries && dashboardSummary.accountSummaries.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Balances</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardSummary.accountSummaries.map((account: any) => (
                <Card key={account.accountId}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{account.accountName}</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(account.balance, user?.currency || 'USD')}</div>
                    <p className="text-xs text-muted-foreground mt-1">{account.accountType}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {budgetProgress.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Category Budget Progress
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/budgets')}>
                  Manage Budgets
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {budgetProgress.map((progress: any, index: number) => {
                const currentSpending = progress.currentSpending || 0
                const budgetAmount = progress.budgetedAmount || 0
                const percentage = budgetAmount > 0 ? Math.min((currentSpending / budgetAmount) * 100, 100) : 0
                const isOverBudget = percentage >= 100
                const isNearLimit = percentage >= 90
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{progress.categoryName}</span>
                        {isNearLimit && (
                          <AlertTriangle className={`h-4 w-4 ${isOverBudget ? 'text-red-500' : 'text-yellow-500'}`} />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(currentSpending, user?.currency || 'USD')} / {formatCurrency(budgetAmount, user?.currency || 'USD')}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>
                        {budgetAmount - currentSpending >= 0
                          ? `${formatCurrency(budgetAmount - currentSpending, user?.currency || 'USD')} remaining`
                          : `${formatCurrency(Math.abs(budgetAmount - currentSpending), user?.currency || 'USD')} over budget`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  )
}
