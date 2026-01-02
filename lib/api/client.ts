// API Client - Placeholder for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || 'An error occurred',
      response.status,
      errorData
    )
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
}

// Type definitions
export interface Listing {
  id: string
  title: string
  description: string
  metalType: string
  price: number
  quantity: number
  unit: string
  location: string
  images: string[]
  seller: {
    id: string
    name: string
    verified: boolean
    premium: boolean
  }
  createdAt: string
  updatedAt: string
  views: number
  inquiries: number
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'buyer' | 'seller' | 'admin'
  membership: 'free' | 'silver' | 'gold'
  verified: boolean
}

export interface MembershipPlan {
  id: string
  name: string
  price: number
  features: string[]
  recommended?: boolean
}

