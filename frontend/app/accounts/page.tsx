'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { apiClient } from '@/lib/api-client'
import { Account, AccountRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Wallet, CreditCard, Banknote, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'

export default function AccountsPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState<AccountRequest>({
    accountName: '',
    accountType: 'CASH',
    balance: 0,
    email: user?.email || ''
  })

  useEffect(() => {
    if (user?.email) {
      fetchAccounts()
    }
  }, [user])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAccountsByUser(user!.email)
      setAccounts(response.response || [])
    } catch (error: any) {
      toast.error('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingAccount) {
        await apiClient.updateAccount(editingAccount.id, formData)
        toast.success('Account updated successfully')
      } else {
        await apiClient.createAccount({ ...formData, email: user!.email })
        toast.success('Account created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save account')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    
    try {
      await apiClient.deleteAccount(id, user!.email)
      toast.success('Account deleted successfully')
      fetchAccounts()
    } catch (error: any) {
      toast.error('Failed to delete account')
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance,
      email: user!.email
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingAccount(null)
    setFormData({
      accountName: '',
      accountType: 'CASH',
      balance: 0,
      email: user!.email
    })
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return <Wallet className="h-8 w-8" />
      case 'BANK':
        return <Banknote className="h-8 w-8" />
      case 'CREDIT_CARD':
        return <CreditCard className="h-8 w-8" />
      default:
        return <Wallet className="h-8 w-8" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD'
    }).format(amount)
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center min-h-screen">Loading...</div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open: boolean) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Edit Account' : 'Create New Account'}</DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Update your account details' : 'Add a new account to track your finances'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="e.g., Main Checking"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value: string) => setFormData({ ...formData, accountType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK">Bank Account</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Initial Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccount ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Across all accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No accounts yet. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getAccountIcon(account.accountType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.accountName}</CardTitle>
                      <CardDescription>
                        {account.accountType.replace('_', ' ')}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-4">{formatCurrency(account.balance)}</p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(account)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </ProtectedLayout>
  )
}
