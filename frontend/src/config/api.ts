export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    ME: '/auth/me',
  },
  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    GET: (id: string) => `/users/${id}`,
  },
  // Roles & Permissions
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
  },
  PERMISSIONS: {
    LIST: '/permissions',
    CREATE: '/permissions',
    UPDATE: (id: string) => `/permissions/${id}`,
  },
  // Branches
  BRANCHES: {
    LIST: '/branches',
    CREATE: '/branches',
    UPDATE: (id: string) => `/branches/${id}`,
    DELETE: (id: string) => `/branches/${id}`,
    GET: (id: string) => `/branches/${id}`,
  },
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },
  // Menu Items
  MENU_ITEMS: {
    LIST: '/menu-items',
    CREATE: '/menu-items',
    UPDATE: (id: string) => `/menu-items/${id}`,
    DELETE: (id: string) => `/menu-items/${id}`,
    GET: (id: string) => `/menu-items/${id}`,
  },
  // Customers
  CUSTOMERS: {
    LIST: '/customers',
    CREATE: '/customers',
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
    GET: (id: string) => `/customers/${id}`,
  },
  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
    GET: (id: string) => `/orders/${id}`,
  },
  // Tables
  TABLES: {
    LIST: '/tables',
    CREATE: '/tables',
    UPDATE: (id: string) => `/tables/${id}`,
    DELETE: (id: string) => `/tables/${id}`,
    LAYOUT: '/tables/layout',
  },
  // KOT
  KOT: {
    LIST: '/kot',
    CREATE: '/kot',
    UPDATE: (id: string) => `/kot/${id}`,
    GET: (id: string) => `/kot/${id}`,
  },
  // Inventory
  INVENTORY: {
    RAW_MATERIALS: '/inventory/raw-materials',
    STOCK: '/inventory/stock',
    TRANSACTIONS: '/inventory/transactions',
  },
  // Vendors
  VENDORS: {
    LIST: '/vendors',
    CREATE: '/vendors',
    UPDATE: (id: string) => `/vendors/${id}`,
    DELETE: (id: string) => `/vendors/${id}`,
  },
  // Employees
  EMPLOYEES: {
    LIST: '/employees',
    CREATE: '/employees',
    UPDATE: (id: string) => `/employees/${id}`,
    DELETE: (id: string) => `/employees/${id}`,
  },
  // Attendance
  ATTENDANCE: {
    LIST: '/attendance',
    CREATE: '/attendance',
    UPDATE: (id: string) => `/attendance/${id}`,
  },
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    SALES: '/dashboard/sales',
    CHARTS: '/dashboard/charts',
  },
  // Reports
  REPORTS: {
    SALES: '/reports/sales',
    INVENTORY: '/reports/inventory',
    EXPENSES: '/reports/expenses',
  },
};
