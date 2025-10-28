'use client'

import { useEffect, useState } from 'react'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Select } from '@/components/ui/select' // Using native select
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api-client'
import { formatTransactionType } from '@/lib/utils'
import { Plus, Edit, Power, X } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Category } from '@/types'

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    transactionTypeId: '1',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getAllCategories()
      if (response?.response && Array.isArray(response.response)) {
        setCategories(response.response)
      } else if (Array.isArray(response)) {
        setCategories(response)
      } else {
        setCategories([])
      }
    } catch (error: any) {
      setCategories([])
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error('Please enter a category name')
      return
    }

    try {
      const data = {
        name: formData.name,
        transactionTypeId: parseInt(formData.transactionTypeId),
      }

      if (editingCategory) {
        await apiClient.updateCategory(editingCategory.id, data)
        toast.success('Category updated successfully')
      } else {
        await apiClient.addCategory(data)
        toast.success('Category created successfully')
      }

      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', transactionTypeId: '1' })
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      transactionTypeId: category.transactionType.id.toString(),
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (categoryId: number) => {
    try {
      await apiClient.toggleCategoryStatus(categoryId)
      toast.success('Category status updated successfully')
      fetchCategories()
    } catch (error: any) {
      toast.error('Failed to update category status')
    }
  }

  return (
    <ProtectedLayout requireAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">Manage transaction categories</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatTransactionType(category.transactionType.name)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        category.enabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {category.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={category.enabled ? 'destructive' : 'default'}
                      onClick={() => handleToggleStatus(category.id)}
                    >
                      <Power className="mr-1 h-3 w-3" />
                      {category.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <p className="text-muted-foreground">No categories found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    setFormData({ name: '', transactionTypeId: '1' })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Food, Transport, Salary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <select
                    id="type"
                    value={formData.transactionTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionTypeId: e.target.value })
                    }
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option key="expense" value="1">Expense</option>
                    <option key="income" value="2">Income</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? 'Update' : 'Add'} Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCategory(null)
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
