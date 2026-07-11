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
    CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
  },

  // Roles & Permissions
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    GET: (id: string) => `/roles/${id}`,
    ASSIGN_PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
  },
  PERMISSIONS: {
    LIST: '/permissions',
    CREATE: '/permissions',
    UPDATE: (id: string) => `/permissions/${id}`,
    DELETE: (id: string) => `/permissions/${id}`,
    GET: (id: string) => `/permissions/${id}`,
  },

  // Restaurants
  RESTAURANTS: {
    LIST: '/restaurants',
    CREATE: '/restaurants',
    UPDATE: (id: string) => `/restaurants/${id}`,
    DELETE: (id: string) => `/restaurants/${id}`,
    GET: (id: string) => `/restaurants/${id}`,
  },

  // Branches
  BRANCHES: {
    LIST: '/branches',
    CREATE: '/branches',
    UPDATE: (id: string) => `/branches/${id}`,
    DELETE: (id: string) => `/branches/${id}`,
    GET: (id: string) => `/branches/${id}`,
    BY_RESTAURANT: (restaurantId: string) => `/branches/restaurant/${restaurantId}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
    GET: (id: string) => `/categories/${id}`,
  },

  // Menu Items
  MENU_ITEMS: {
    LIST: '/menu-items',
    CREATE: '/menu-items',
    UPDATE: (id: string) => `/menu-items/${id}`,
    DELETE: (id: string) => `/menu-items/${id}`,
    GET: (id: string) => `/menu-items/${id}`,
    BY_CATEGORY: (categoryId: string) => `/menu-items/category/${categoryId}`,
    TOGGLE_AVAILABILITY: (id: string) => `/menu-items/${id}/toggle-availability`,
  },

  // Tables
  TABLES: {
    LIST: '/tables',
    CREATE: '/tables',
    UPDATE: (id: string) => `/tables/${id}`,
    DELETE: (id: string) => `/tables/${id}`,
    GET: (id: string) => `/tables/${id}`,
    LAYOUT: '/tables/layout',
    BY_BRANCH: (branchId: string) => `/tables/branch/${branchId}`,
    AVAILABLE: '/tables/available',
  },

  // Kitchens
  KITCHENS: {
    LIST: '/kitchens',
    CREATE: '/kitchens',
    UPDATE: (id: string) => `/kitchens/${id}`,
    DELETE: (id: string) => `/kitchens/${id}`,
    GET: (id: string) => `/kitchens/${id}`,
    BY_BRANCH: (branchId: string) => `/kitchens/branch/${branchId}`,
    BY_CODE: (code: string) => `/kitchens/code/${code}`,
  },

  // Customers
  CUSTOMERS: {
    LIST: '/customers',
    CREATE: '/customers',
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
    GET: (id: string) => `/customers/${id}`,
    BY_PHONE: (phone: string) => `/customers/phone/${phone}`,
    LOYALTY: (id: string) => `/customers/${id}/loyalty`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
    GET: (id: string) => `/orders/${id}`,
    BY_TABLE: (tableId: string) => `/orders/table/${tableId}`,
    ACTIVE: '/orders/active',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
  },

  // KOT (Kitchen Order Tickets)
  KOT: {
    LIST: '/kot',
    CREATE: '/kot',
    UPDATE: (id: string) => `/kot/${id}`,
    GET: (id: string) => `/kot/${id}`,
    BY_KITCHEN: (kitchenId: string) => `/kot/kitchen/${kitchenId}`,
    BY_STATUS: (status: string) => `/kot/status/${status}`,
    UPDATE_STATUS: (id: string) => `/kot/${id}/status`,
  },

  // Payments
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    GET: (id: string) => `/payments/${id}`,
    BY_ORDER: (orderId: string) => `/payments/order/${orderId}`,
    REFUND: (id: string) => `/payments/${id}/refund`,
  },

  // Invoices
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices',
    GET: (id: string) => `/invoices/${id}`,
    BY_NUMBER: (invoiceNumber: string) => `/invoices/number/${invoiceNumber}`,
    GENERATE_PDF: (id: string) => `/invoices/${id}/pdf`,
    SEND_EMAIL: (id: string) => `/invoices/${id}/send-email`,
  },

  // Inventory (Raw Materials)
  INVENTORY: {
    LIST: '/inventory',
    CREATE: '/inventory',
    UPDATE: (id: string) => `/inventory/${id}`,
    DELETE: (id: string) => `/inventory/${id}`,
    GET: (id: string) => `/inventory/${id}`,
    BY_BRANCH: (branchId: string) => `/inventory/branch/${branchId}`,
    LOW_STOCK: '/inventory/low-stock',
    ADJUST_STOCK: (id: string) => `/inventory/${id}/adjust-stock`,
  },

  // Recipes
  RECIPES: {
    LIST: '/recipes',
    CREATE: '/recipes',
    UPDATE: (id: string) => `/recipes/${id}`,
    DELETE: (id: string) => `/recipes/${id}`,
    GET: (id: string) => `/recipes/${id}`,
    BY_MENU_ITEM: (menuItemId: string) => `/recipes/menu-item/${menuItemId}`,
    CALCULATE_COST: (id: string) => `/recipes/${id}/calculate-cost`,
  },

  // Vendors
  VENDORS: {
    LIST: '/vendors',
    CREATE: '/vendors',
    UPDATE: (id: string) => `/vendors/${id}`,
    DELETE: (id: string) => `/vendors/${id}`,
    GET: (id: string) => `/vendors/${id}`,
    BY_CODE: (code: string) => `/vendors/code/${code}`,
    TOP: '/vendors/top',
    OUTSTANDING: '/vendors/outstanding',
    UPDATE_RATING: (id: string) => `/vendors/${id}/rating`,
    STATEMENT: (id: string) => `/vendors/${id}/statement`,
  },

  // Purchase Orders
  PURCHASE_ORDERS: {
    LIST: '/purchase-orders',
    CREATE: '/purchase-orders',
    UPDATE: (id: string) => `/purchase-orders/${id}`,
    DELETE: (id: string) => `/purchase-orders/${id}`,
    GET: (id: string) => `/purchase-orders/${id}`,
    BY_PO_NUMBER: (poNumber: string) => `/purchase-orders/po-number/${poNumber}`,
    SUBMIT: (id: string) => `/purchase-orders/${id}/submit`,
    APPROVE: (id: string) => `/purchase-orders/${id}/approve`,
    REJECT: (id: string) => `/purchase-orders/${id}/reject`,
    MARK_ORDERED: (id: string) => `/purchase-orders/${id}/order`,
    RECEIVE_ITEMS: (id: string) => `/purchase-orders/${id}/receive`,
    CANCEL: (id: string) => `/purchase-orders/${id}/cancel`,
  },

  // Expenses
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
    UPDATE: (id: string) => `/expenses/${id}`,
    DELETE: (id: string) => `/expenses/${id}`,
    GET: (id: string) => `/expenses/${id}`,
    BY_CATEGORY: (category: string) => `/expenses/category/${category}`,
    CATEGORY_TOTALS: '/expenses/category-totals',
    APPROVE: (id: string) => `/expenses/${id}/approve`,
    REJECT: (id: string) => `/expenses/${id}/reject`,
    MARK_PAID: (id: string) => `/expenses/${id}/mark-paid`,
  },

  // Reservations
  RESERVATIONS: {
    LIST: '/reservations',
    CREATE: '/reservations',
    UPDATE: (id: string) => `/reservations/${id}`,
    DELETE: (id: string) => `/reservations/${id}`,
    GET: (id: string) => `/reservations/${id}`,
    BY_NUMBER: (reservationNumber: string) => `/reservations/number/${reservationNumber}`,
    UPCOMING: '/reservations/upcoming',
    CONFIRM: (id: string) => `/reservations/${id}/confirm`,
    CANCEL: (id: string) => `/reservations/${id}/cancel`,
    CHECK_IN: (id: string) => `/reservations/${id}/check-in`,
    NO_SHOW: (id: string) => `/reservations/${id}/no-show`,
    ASSIGN_TABLE: (id: string) => `/reservations/${id}/assign-table`,
  },

  // Employees
  EMPLOYEES: {
    LIST: '/employees',
    CREATE: '/employees',
    UPDATE: (id: string) => `/employees/${id}`,
    DELETE: (id: string) => `/employees/${id}`,
    GET: (id: string) => `/employees/${id}`,
    BY_CODE: (code: string) => `/employees/code/${code}`,
    BY_BRANCH: (branchId: string) => `/employees/branch/${branchId}`,
  },

  // Audit Logs
  AUDIT_LOGS: {
    LIST: '/audit-logs',
    GET: (id: string) => `/audit-logs/${id}`,
    USER_ACTIVITY: (userId: string) => `/audit-logs/user/${userId}/activity`,
    ENTITY_HISTORY: (entityType: string, entityId: string) => 
      `/audit-logs/entity/${entityType}/${entityId}/history`,
    ACTION_SUMMARY: '/audit-logs/action-summary',
  },

  // Reports
  REPORTS: {
    SALES: '/reports/sales',
    PAYMENTS: '/reports/payments',
    EXPENSES: '/reports/expenses',
    PROFIT_LOSS: '/reports/profit-loss',
    TOP_SELLING_ITEMS: '/reports/top-selling-items',
    EMPLOYEE_PERFORMANCE: '/reports/employee-performance',
    VENDOR_PERFORMANCE: '/reports/vendor-performance',
    DAILY_SALES_SUMMARY: '/reports/daily-sales-summary',
  },

  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    RECENT_ORDERS: '/dashboard/recent-orders',
    REVENUE_ANALYTICS: '/dashboard/revenue-analytics',
    ORDER_STATUS_DISTRIBUTION: '/dashboard/order-status-distribution',
    PAYMENT_METHOD_DISTRIBUTION: '/dashboard/payment-method-distribution',
    LOW_STOCK_ALERTS: '/dashboard/low-stock-alerts',
    UPCOMING_RESERVATIONS: '/dashboard/upcoming-reservations',
    TOP_CUSTOMERS: '/dashboard/top-customers',
  },

  // Settings
  SETTINGS: {
    LIST: '/settings',
    CREATE: '/settings',
    UPDATE: (id: string) => `/settings/${id}`,
    DELETE: (id: string) => `/settings/${id}`,
    GET: (id: string) => `/settings/${id}`,
    BY_KEY: (key: string) => `/settings/key/${key}`,
    VALUE: (key: string) => `/settings/value/${key}`,
    UPDATE_BY_KEY: (key: string) => `/settings/key/${key}`,
    BY_CATEGORY: (category: string) => `/settings/category/${category}`,
    BULK_UPDATE: '/settings/bulk-update',
    INITIALIZE: '/settings/initialize',
  },
};
