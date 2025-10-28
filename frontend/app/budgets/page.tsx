'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface Category {
  id: number
  name: string
  transactionType: {
    id: number
    name: string
  }
  enabled: boolean
}

interface CategoryBudget {
  id: number
  amount: number
  month: number
  year: number
  categoryId: number
  categoryName: string
  alertSent?: boolean
}

interface BudgetProgress {
  categoryName: string
  budgetedAmount: number
  currentSpending: number
  percentage: number
}

export default function BudgetsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: selectedMonth,
    year: selectedYear,
  })

  useEffect(() => {
    if (user?.email) {
      fetchData()
    }
  }, [user, selectedMonth, selectedYear])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchBudgets(),
        fetchBudgetProgress(),
        fetchCategories(),
      ])
    } catch (error) {
      console.error('Error fetching budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgets = async () => {
    try {
      const response = await apiClient.getCategoryBudgetsByUser(user!.email, selectedMonth, selectedYear)
      console.log('Budgets API response:', response)
      setBudgets(response?.response || [])
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load budgets')
      }
      setBudgets([])
    }
  }

  const fetchBudgetProgress = async () => {
    try {
      const response = await apiClient.getBudgetProgress(user!.email, selectedMonth, selectedYear)
      console.log('Budget Progress API response:', response)
      const progressData = response?.response || []
      console.log('Budget Progress data:', progressData)
      if (progressData.length > 0) {
        console.log('Sample progress item:', progressData[0])
      }
      setBudgetProgress(progressData)
    } catch (error: any) {
      console.error('Error fetching budget progress:', error)
      setBudgetProgress([])
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getAllCategories()
      const categoriesData = response.response || response
      // Filter only expense categories (TYPE_EXPENSE has id 1)
      const expenseCategories = categoriesData.filter(
        (cat: Category) => cat.transactionType?.id === 1 && cat.enabled
      )
      setCategories(expenseCategories)
    } catch (error) {
      setCategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.categoryId || !formData.amount) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const data = {
        amount: parseFloat(formData.amount),
        month: formData.month,
        year: formData.year,
        categoryId: parseInt(formData.categoryId),
        email: user!.email,
      }
      
      console.log('Category budget data:', data)

      if (editingBudget) {
        const result = await apiClient.updateCategoryBudget(editingBudget.id, data)
        console.log('Budget update result:', result)
        toast.success('Budget updated successfully')
      } else {
        const result = await apiClient.createCategoryBudget(data)
        console.log('Budget creation result:', result)
        toast.success('Budget created successfully')
      }

      setDialogOpen(false)
      resetForm()
      await fetchData()
    } catch (error: any) {
      console.error('Budget save error:', error)
      toast.error(error.response?.data?.message || 'Failed to save budget')
    }
  }

  const handleEdit = (budget: CategoryBudget) => {
    setEditingBudget(budget)
    setFormData({
      categoryId: budget.categoryId.toString(),
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (budgetId: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      await apiClient.deleteCategoryBudget(budgetId, user!.email)
      toast.success('Budget deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error('Failed to delete budget')
    }
  }

  const resetForm = () => {
    setEditingBudget(null)
    setFormData({
      categoryId: '',
      amount: '',
      month: selectedMonth,
      year: selectedYear,
    })
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 90) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 90) return 'text-yellow-600'
    return 'text-green-600'
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading budgets...</p>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Category Budgets</h1>
            <p className="text-muted-foreground">Set monthly spending limits for each category</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
                <DialogDescription>
                  Set a spending limit for a specific category
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Budget Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={formData.month.toString()}
                      onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index + 1} value={(index + 1).toString()}>
                            {month} {selectedYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBudget ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label>View Month:</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month} {selectedYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budget Progress Section */}
        {budgetProgress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Budget Progress
              </CardTitle>
              <CardDescription>Track your spending against set budgets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {budgetProgress.map((progress, index) => {
                const currentSpending = progress.currentSpending || 0
                const budgetAmount = progress.budgetedAmount || 0
                const percentage = budgetAmount > 0 ? Math.min((currentSpending / budgetAmount) * 100, 100) : 0
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{progress.categoryName}</span>
                        {percentage >= 90 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${getProgressTextColor(percentage)}`}>
                        {formatCurrency(currentSpending, user?.currency || 'USD')} / {formatCurrency(budgetAmount, user?.currency || 'USD')}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(percentage)}`}
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

        {/* Budgets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Budgets</CardTitle>
            <CardDescription>Manage your category budgets for {months[selectedMonth - 1]} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No budgets set for this month</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Budget
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{budget.categoryName || 'Unknown Category'}</p>
                      <p className="text-sm text-muted-foreground">
                        Budget: {formatCurrency(budget.amount, user?.currency || 'USD')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
