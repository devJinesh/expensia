// User Types
export interface User {
  id: number
  username: string
  email: string
  roles: string[]
  profileImage?: string
  timezone?: string
  currency?: string
}

export interface AuthResponse {
  id: number
  username: string
  email: string
  token: string
  roles: string[]
}

// Transaction Types
export interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  timestamp?: string
  category: Category
  user: User
  transactionType: TransactionType
  account?: Account
}

export interface TransactionRequest {
  description: string
  amount: number
  date: string
  categoryId: number
  email: string
  accountId?: number
}

export interface TransactionType {
  id: number
  name: string
}

// Category Types
export interface Category {
  id: number
  name: string
  transactionType: TransactionType
  enabled: boolean
}

export interface CategoryRequest {
  name: string
  transactionTypeId: number
}

// Budget Types
export interface Budget {
  id: number
  amount: number
  month: number
  year: number
  user: User
}

export interface BudgetRequest {
  amount: number
  month: number
  year: number
  userId: number
}

// Saved Transaction Types
export interface SavedTransaction {
  id: number
  description: string
  amount: number
  startDate?: string
  nextDueDate?: string
  frequency: string
  categoryName: string
  transactionType?: number
  dueInformation?: string
}

export interface SavedTransactionRequest {
  description: string
  amount: number
  startDate: string
  frequency: string
  categoryId: number
  userId: number
}

// Report Types
export interface MonthlySummary {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface CategoryExpense {
  categoryId: number
  categoryName: string
  amount: number
  percentage: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

// Form Types
export interface SignUpForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface SignInForm {
  email: string
  password: string
}

export interface ResetPasswordForm {
  email: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordForm {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Account Types
export interface Account {
  id: number
  accountName: string
  accountType: 'CASH' | 'BANK' | 'CREDIT_CARD'
  balance: number
}

export interface AccountRequest {
  accountName: string
  accountType: 'CASH' | 'BANK' | 'CREDIT_CARD'
  balance: number
  email: string
}

export interface AccountSummary {
  accountId: number
  accountName: string
  accountType: string
  balance: number
}

export interface DashboardSummary {
  consolidatedBalance: number
  accountSummaries: AccountSummary[]
}

// Category Budget Types
export interface CategoryBudget {
  id: number
  amount: number
  month: number
  year: number
  categoryId: number
  categoryName: string
}

export interface CategoryBudgetRequest {
  amount: number
  month: number
  year: number
  categoryId: number
  email: string
}

export interface BudgetProgress {
  budgetId: number
  categoryName: string
  budgetedAmount: number
  currentSpending: number
  percentageUsed: number
  isOverBudget: boolean
}

// Category Expense Breakdown
export interface CategoryExpenseBreakdown {
  categoryName: string
  totalAmount: number
}

// Admin Types
export interface AdminTransactionView {
  transactionId: number
  amount: number
  date: string
  categoryName: string
  transactionTypeName: string
}

export interface SystemOverview {
  totalUsers: number
  totalAdmins: number
  totalRegularUsers: number
  storageUsedMB: number
  recentLogs: string[]
}

// User Preferences
export interface UserPreferences {
  timezone: string
  currency: string
}

export interface UserSettingsRequest {
  email: string
  timezone?: string
  currency?: string
}
