import axios, { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'sonner'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/expensia'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  private clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // Auth endpoints
  async signIn(email: string, password: string) {
    const response = await this.client.post('/auth/signin', { email, password })
    return response.data
  }

  async signUp(data: { username: string; email: string; password: string }) {
    const response = await this.client.post('/auth/signup', {
      userName: data.username,
      email: data.email,
      password: data.password
    })
    return response.data
  }

  async verifyEmail(code: string) {
    const response = await this.client.get(`/auth/signup/verify?code=${code}`)
    return response.data
  }

  async resendVerificationCode(email: string) {
    const response = await this.client.get(`/auth/signup/resend?email=${email}`)
    return response.data
  }

  async verifyEmailForPasswordReset(email: string) {
    const response = await this.client.get(`/auth/forgotPassword/verifyEmail?email=${email}`)
    return response.data
  }

  async verifyPasswordResetCode(code: string) {
    const response = await this.client.get(`/auth/forgotPassword/verifyCode?code=${code}`)
    return response.data
  }

  async resetPassword(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/forgotPassword/resetPassword', data)
    return response.data
  }

  // Transaction endpoints
  async getTransactionsByUser(params: {
    email: string
    pageNumber: number
    pageSize: number
    searchKey?: string
    sortField?: string
    sortDirec?: string
    transactionType?: string
  }) {
    const response = await this.client.get('/transaction/getByUser', { params })
    return response.data
  }

  async getTransactionById(id: number) {
    const response = await this.client.get(`/transaction/getById?id=${id}`)
    return response.data
  }

  async addTransaction(data: any) {
    const response = await this.client.post('/transaction/new', data)
    return response.data
  }

  async updateTransaction(transactionId: number, data: any) {
    const response = await this.client.put(`/transaction/update?transactionId=${transactionId}`, data)
    return response.data
  }

  async deleteTransaction(transactionId: number) {
    const response = await this.client.delete(`/transaction/delete?transactionId=${transactionId}`)
    return response.data
  }

  async getAllTransactions(params: { pageNumber: number; pageSize: number; searchKey?: string }) {
    const response = await this.client.get('/transaction/getAll', { params })
    return response.data
  }

  // Category endpoints
  async getAllCategories() {
    const response = await this.client.get('/category/getAll')
    return response.data
  }

  async addCategory(data: { name: string; transactionTypeId: number }) {
    const response = await this.client.post('/category/new', {
      categoryName: data.name,
      transactionTypeId: data.transactionTypeId
    })
    return response.data
  }

  async updateCategory(categoryId: number, data: { name: string; transactionTypeId: number }) {
    const response = await this.client.put(`/category/update?categoryId=${categoryId}`, {
      categoryName: data.name,
      transactionTypeId: data.transactionTypeId
    })
    return response.data
  }

  async toggleCategoryStatus(categoryId: number) {
    const response = await this.client.delete(`/category/delete?categoryId=${categoryId}`)
    return response.data
  }

  // Report endpoints
  async getTotalIncomeOrExpense(params: {
    userId: number
    transactionTypeId: number
    month: number
    year: number
  }) {
    const response = await this.client.get('/report/getTotalIncomeOrExpense', { params })
    return response.data
  }

  async getTotalNoOfTransactions(params: { userId: number; month: number; year: number }) {
    const response = await this.client.get('/report/getTotalNoOfTransactions', { params })
    return response.data
  }

  async getTotalByCategory(params: {
    email: string
    categoryId: number
    month: number
    year: number
  }) {
    const response = await this.client.get('/report/getTotalByCategory', { params })
    return response.data
  }

  async getMonthlySummary(email: string) {
    const response = await this.client.get(`/report/getMonthlySummaryByUser?email=${email}`)
    return response.data
  }

  // Budget endpoints
  async createBudget(data: { amount: number; month: number; year: number; userId: number }) {
    const response = await this.client.post('/budget/create', data)
    return response.data
  }

  async getBudget(params: { userId: number; month: number; year: number }) {
    const response = await this.client.get('/budget/get', { params })
    return response.data
  }

  // Saved Transaction endpoints
  async createSavedTransaction(data: any) {
    const response = await this.client.post('/saved/create', data)
    return response.data
  }

  async getSavedTransactionsByUser(id: number) {
    const response = await this.client.get(`/saved/user?id=${id}`)
    return response.data
  }

  async getSavedTransactionsByMonth(id: number) {
    const response = await this.client.get(`/saved/month?id=${id}`)
    return response.data
  }

  async getSavedTransactionById(id: number) {
    const response = await this.client.get(`/saved/?id=${id}`)
    return response.data
  }

  async addSavedTransaction(id: number) {
    const response = await this.client.get(`/saved/add?id=${id}`)
    return response.data
  }

  async editSavedTransaction(id: number, data: any) {
    const response = await this.client.put(`/saved/?id=${id}`, data)
    return response.data
  }

  async deleteSavedTransaction(id: number) {
    const response = await this.client.delete(`/saved/?id=${id}`)
    return response.data
  }

  async skipSavedTransaction(id: number) {
    const response = await this.client.get(`/saved/skip?id=${id}`)
    return response.data
  }

  // User endpoints
  async getAllUsers(params: { pageNumber: number; pageSize: number; searchKey?: string }) {
    const response = await this.client.get('/user/getAll', { params })
    return response.data
  }

  async toggleUserStatus(userId: number, enable: boolean) {
    const endpoint = enable ? '/user/enable' : '/user/disable'
    const response = await this.client[enable ? 'put' : 'delete'](`${endpoint}?userId=${userId}`)
    return response.data
  }

  async changePassword(data: { email: string; currentPassword: string; newPassword: string }) {
    const response = await this.client.post('/user/settings/changePassword', {
      email: data.email,
      password: data.newPassword,
    })
    return response.data
  }

  async uploadProfileImage(email: string, file: File) {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('file', file)

    const response = await this.client.post('/user/settings/profileImg', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getProfileImage(email: string) {
    const response = await this.client.get(`/user/settings/profileImg?email=${email}`)
    return response.data
  }

  async deleteProfileImage(email: string) {
    const response = await this.client.delete(`/user/settings/profileImg?email=${email}`)
    return response.data
  }

  // Account endpoints
  async createAccount(data: { accountName: string; accountType: string; balance: number; email: string }) {
    const response = await this.client.post('/accounts/create', data)
    return response.data
  }

  async getAccountsByUser(email: string) {
    const response = await this.client.get(`/accounts/getByUser?email=${email}`)
    return response.data
  }

  async getAccountById(accountId: number, email: string) {
    const response = await this.client.get(`/accounts/getById?accountId=${accountId}&email=${email}`)
    return response.data
  }

  async updateAccount(accountId: number, data: { accountName: string; accountType: string; balance: number; email: string }) {
    const response = await this.client.put(`/accounts/update?accountId=${accountId}`, data)
    return response.data
  }

  async deleteAccount(accountId: number, email: string) {
    const response = await this.client.delete(`/accounts/delete?accountId=${accountId}&email=${email}`)
    return response.data
  }

  // Dashboard endpoints
  async getDashboardSummary(email: string) {
    const response = await this.client.get(`/report/getDashboardSummary?email=${email}`)
    return response.data
  }

  async getCategoryExpenseBreakdown(email: string, month: number, year: number) {
    const response = await this.client.get(`/report/getCategoryExpenseBreakdown?email=${email}&month=${month}&year=${year}`)
    return response.data
  }

  // Category Budget endpoints
  async createCategoryBudget(data: { amount: number; month: number; year: number; categoryId: number; email: string }) {
    const response = await this.client.post('/budgets/create', data)
    return response.data
  }

  async getCategoryBudgetsByUser(email: string, month: number, year: number) {
    const response = await this.client.get(`/budgets/getByUser?email=${email}&month=${month}&year=${year}`)
    return response.data
  }

  async getBudgetProgress(email: string, month: number, year: number) {
    const response = await this.client.get(`/budgets/progress?email=${email}&month=${month}&year=${year}`)
    return response.data
  }

  async updateCategoryBudget(budgetId: number, data: { amount: number; month: number; year: number; categoryId: number; email: string }) {
    const response = await this.client.put(`/budgets/update?budgetId=${budgetId}`, data)
    return response.data
  }

  async deleteCategoryBudget(budgetId: number, email: string) {
    const response = await this.client.delete(`/budgets/delete?budgetId=${budgetId}&email=${email}`)
    return response.data
  }

  // Admin endpoints
  async getSystemOverview() {
    const response = await this.client.get('/admin/system-overview')
    return response.data
  }

  // User Preferences endpoints
  async updateUserPreferences(data: { email: string; timezone?: string; currency?: string }) {
    const response = await this.client.put('/user/settings/preferences', data)
    return response.data
  }

  async getUserPreferences(email: string) {
    const response = await this.client.get(`/user/settings/preferences?email=${email}`)
    return response.data
  }
}

export const apiClient = new ApiClient()
