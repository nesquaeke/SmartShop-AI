import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'właśnie teraz'
  if (diffInMinutes < 60) return `${diffInMinutes} min temu`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} godz. temu`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} dni temu`
  
  return formatDate(date)
}

export function calculateSavings(originalPrice: number, discountedPrice: number): {
  amount: number
  percentage: number
} {
  const amount = originalPrice - discountedPrice
  const percentage = (amount / originalPrice) * 100
  return { amount, percentage }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+48|48)?[1-9]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function downloadFile(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  )
}

export function getStoreLogo(storeName: string): string {
  const logos: Record<string, string> = {
    lidl: '/logos/lidl.png',
    biedronka: '/logos/biedronka.png',
    auchan: '/logos/auchan.png',
    ceneo: '/logos/ceneo.png',
    allegro: '/logos/allegro.png',
  }
  return logos[storeName.toLowerCase()] || '/logos/default.png'
}

export function getStoreColor(storeName: string): string {
  const colors: Record<string, string> = {
    lidl: '#0050aa',
    biedronka: '#e31e24',
    auchan: '#ff6900',
    ceneo: '#ff6b35',
    allegro: '#ff5a00',
  }
  return colors[storeName.toLowerCase()] || '#6b7280'
}

export function sortProducts(products: any[], sortBy: string): any[] {
  switch (sortBy) {
    case 'price-asc':
      return [...products].sort((a, b) => a.price - b.price)
    case 'price-desc':
      return [...products].sort((a, b) => b.price - a.price)
    case 'name-asc':
      return [...products].sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return [...products].sort((a, b) => b.name.localeCompare(a.name))
    case 'discount-desc':
      return [...products].sort((a, b) => (b.discount || 0) - (a.discount || 0))
    default:
      return products
  }
} 