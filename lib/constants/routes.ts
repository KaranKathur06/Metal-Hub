/**
 * Metal Hub — Route Constants
 *
 * Centralized route definitions for consistent navigation
 * across components, middleware, and API routes.
 */

// ── Public Routes ──
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  MARKETPLACE: '/marketplace',
  PRODUCTS: '/products',
  ABOUT: '/about',
  CONTACT: '/contact',
  BLOG: '/blog',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

// ── Auth Routes ──
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const;

// ── Dashboard Routes ──
export const DASHBOARD_ROUTES = {
  MAIN: '/dashboard',
  SELLER: '/seller/dashboard',
  BUYER: '/buyer/dashboard',
} as const;

// ── Admin Routes ──
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  VERIFY: '/admin/verify',
  USERS: '/admin/users',
  SELLERS: '/admin/sellers',
  LISTINGS: '/admin/listings',
  RFQS: '/admin/rfqs',
  BANNERS: '/admin/banners',
  CAPABILITIES: '/admin/capabilities',
  ANALYTICS: '/admin/analytics',
  REVENUE: '/admin/revenue',
  MEDIA: '/admin/media',
  LOGS: '/admin/logs',
  NOTIFICATIONS: '/admin/notifications',
  CMS: '/admin/cms',
  SETTINGS: '/admin/settings',
  SECURITY: '/admin/security',
} as const;

// ── Ops Routes ──
export const OPS_ROUTES = {
  ROOT: '/ops',
  ADMIN_MODE: '/ops/admin',
  CRM_MODE: '/ops/crm',
  CRM_PIPELINE: '/ops/crm/pipeline',
  CRM_LEADS: '/ops/crm/leads',
  CRM_DEALS: '/ops/crm/deals',
  CRM_ANALYTICS: '/ops/crm/analytics',
} as const;

// ── Settings Routes ──
export const SETTINGS_ROUTES = {
  PROFILE: '/settings/profile',
  SECURITY: '/settings/security',
  NOTIFICATIONS: '/settings/notifications',
  PRIVACY: '/settings/privacy',
  BILLING: '/settings/billing',
} as const;

// ── Seller Settings Routes ──
export const SELLER_SETTINGS_ROUTES = {
  STORE: '/seller/settings/store',
  PRODUCTS: '/seller/settings/products',
  TEAM: '/seller/settings/team',
} as const;

// ── API Routes ──
export const API_ROUTES = {
  // Auth
  AUTH_SESSION: '/api/auth/session',
  AUTH_PROFILE: '/api/auth/profile',

  // OTP
  OTP_SEND: '/api/otp/send',
  OTP_VERIFY: '/api/otp/verify',

  // Products
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (slug: string) => `/api/products/${slug}`,

  // Uploads
  UPLOADS: '/api/uploads',
  UPLOAD_DETAIL: (id: string) => `/api/uploads/${id}`,

  // Settings
  SETTINGS_USER: '/api/settings/user',
  SETTINGS_PLATFORM: '/api/settings/platform',
  SETTINGS_COMPANY: (id: string) => `/api/settings/company/${id}`,

  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_LOGS: '/api/admin/logs',

  // CRM
  CRM_LEADS: '/api/crm/leads',
  CRM_LEAD_DETAIL: (id: string) => `/api/crm/leads/${id}`,
  CRM_PIPELINE: '/api/crm/pipeline',

  // Notifications
  NOTIFICATIONS: '/api/notifications',
} as const;
