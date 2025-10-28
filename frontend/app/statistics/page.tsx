'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Spinner } from '@/components/ui/spinner'

export default function StatisticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (user?.email) {
      fetchMonthlySummary()
      fetchCategoryBreakdown()
    }
  }, [user, selectedMonth, selectedYear])

  const fetchMonthlySummary = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await apiClient.getMonthlySummary(user.email)
      const summaries = response?.response || []

      if (!Array.isArray(summaries)) {
        setChartData([])
        return
      }

      const data = summaries.map((summary: any) => ({
        month: `${getMonthName(summary.month)} ${summary.year}`,
        income: summary.totalIncome || 0,
        expense: summary.totalExpense || 0,
      }))

      setChartData(data.reverse().slice(0, 12))
    } catch (error: any) {
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryBreakdown = async () => {
    if (!user) return

    try {
      const response = await apiClient.getCategoryExpenseBreakdown(user.email, selectedMonth, selectedYear)
      const breakdown = response?.response || []
      
      if (!Array.isArray(breakdown)) {
        setCategoryBreakdown([])
        return
      }
      
      const formattedData = breakdown
        .filter((item: any) => item.totalAmount && item.totalAmount > 0)
        .map((item: any) => ({
          name: item.categoryName,
          value: item.totalAmount
        }))
      setCategoryBreakdown(formattedData)
    } catch (error: any) {
      setCategoryBreakdown([])
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    return months[month - 1] || ''
  }

  const getFullMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || ''
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">
            View your financial trends over the past 12 months
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Income vs Expense Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value, user?.currency || 'USD')}
                    width={100}
                  />
                  <Tooltip formatter={(value: any) => formatCurrency(value, user?.currency || 'USD')} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Expense"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {chartData.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Monthly Income</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    chartData.reduce((sum, item) => sum + item.income, 0) / chartData.length,
                    user?.currency || 'USD'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Monthly Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    chartData.reduce((sum, item) => sum + item.expense, 0) / chartData.length,
                    user?.currency || 'USD'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    chartData.reduce((sum, item) => sum + (item.income - item.expense), 0) /
                      chartData.length,
                    user?.currency || 'USD'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Expense by Category
              </CardTitle>
              <select
                value={selectedMonth.toString()}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {getFullMonthName(month)} {selectedYear}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value, user?.currency || 'USD')} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No expense data for this month</p>
                  <p className="text-sm">Add some transactions to see the breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
