import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date, timezone?: string): string {
  if (!date) return 'Invalid Date'
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  
  if (timezone) {
    options.timeZone = timezone
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

export function getMonthName(month: number): string | undefined {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1]
}

export function formatTransactionType(type: string): string {
  if (!type) return 'Unknown'
  if (type === 'TYPE_INCOME' || type === 'INCOME') return 'Income'
  if (type === 'TYPE_EXPENSE' || type === 'EXPENSE') return 'Expense'
  const cleaned = type.replace('TYPE_', '')
  return cleaned.charAt(0) + cleaned.slice(1).toLowerCase()
}

export function getRelativeDate(date: string | Date): string {
  if (!date) return 'Invalid Date'
  
  const today = new Date()
  const targetDate = new Date(date)
  
  if (isNaN(targetDate.getTime())) {
    return 'Invalid Date'
  }
  
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - targetDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays === -1) return 'Tomorrow'
  
  return formatDate(date)
}
