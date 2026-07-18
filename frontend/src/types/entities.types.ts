// Base Types
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

// Enums
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum KOTStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum ExpenseCategory {
  ELECTRICITY = 'ELECTRICITY',
  GAS = 'GAS',
  RENT = 'RENT',
  MAINTENANCE = 'MAINTENANCE',
  MARKETING = 'MARKETING',
  PETTY_CASH = 'PETTY_CASH',
  SALARY = 'SALARY',
  TRANSPORTATION = 'TRANSPORTATION',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentTerm {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
  NET_7 = 'NET_7',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
}

export enum SettingCategory {
  GENERAL = 'GENERAL',
  BUSINESS = 'BUSINESS',
  POS = 'POS',
  PAYMENT = 'PAYMENT',
  TAX = 'TAX',
  NOTIFICATION = 'NOTIFICATION',
  SECURITY = 'SECURITY',
  INTEGRATION = 'INTEGRATION',
}

export enum SettingDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  DATE = 'DATE',
}

// User & Auth
export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  role_id: string;
  branch_id?: string;
  last_login_at?: Date;
  role?: Role;
  branch?: Branch;
}

export interface Role extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  level: number;
  parent_role_id?: string;
  permissions?: Permission[];
}

export enum PermissionType {
  PAGE = 'page',
  BUTTON = 'button',
  API = 'api',
  FIELD = 'field',
  RECORD = 'record',
  BRANCH = 'branch',
  KITCHEN = 'kitchen',
}

export interface Permission extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  type: PermissionType;
  resource: string;
  action: string;
  permission_group_id?: string;
}

// Restaurant & Branches
export interface Restaurant extends BaseEntity {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
}

export interface Branch extends BaseEntity {
  restaurant_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  restaurant?: Restaurant;
}

// Menu & Categories
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem extends BaseEntity {
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost_price?: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergens?: string;
  category?: Category;
  recipe?: Recipe;
}

export interface Recipe extends BaseEntity {
  menu_item_id: string;
  version: number;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  instructions?: string;
  total_cost: number;
  cost_per_serving: number;
  ingredients: RecipeIngredient[];
  menu_item?: MenuItem;
}

export interface RecipeIngredient {
  raw_material_id: string;
  quantity: number;
  unit: string;
  notes?: string;
  raw_material?: RawMaterial;
}

// Tables & Kitchens
export interface Table extends BaseEntity {
  branch_id: string;
  table_number: string;
  capacity: number;
  floor?: string;
  section?: string;
  table_status: TableStatus;
  qr_code?: string;
  branch?: Branch;
}

export interface Kitchen extends BaseEntity {
  branch_id: string;
  name: string;
  code: string;
  description?: string;
  printer_ip?: string;
  printer_port?: number;
  sort_order: number;
  branch?: Branch;
}

// Customers
export interface Customer extends BaseEntity {
  first_name: string;
  last_name?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: Date;
  loyalty_points: number;
  notes?: string;
}

// Orders
export interface Order extends BaseEntity {
  order_number: string;
  branch_id: string;
  table_id?: string;
  customer_id?: string;
  order_type: string;
  order_status: OrderStatus;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  branch?: Branch;
  table?: Table;
  customer?: Customer;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  menu_item?: MenuItem;
}

// KOT
export interface KOT extends BaseEntity {
  kot_number: string;
  order_id: string;
  kitchen_id: string;
  kot_status: KOTStatus;
  items: any[];
  notes?: string;
  prepared_at?: Date;
  ready_at?: Date;
  served_at?: Date;
  order?: Order;
  kitchen?: Kitchen;
}

// Payments & Invoices
export interface Payment extends BaseEntity {
  payment_number: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_date: Date;
  transaction_id?: string;
  reference_number?: string;
  notes?: string;
  order?: Order;
}

export interface Invoice extends BaseEntity {
  invoice_number: string;
  order_id: string;
  customer_id?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  invoice_date: Date;
  due_date?: Date;
  notes?: string;
  order?: Order;
  customer?: Customer;
}

// Inventory
export interface RawMaterial extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  category?: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  branch_id?: string;
  branch?: Branch;
}

// Vendors
export interface Vendor extends BaseEntity {
  name: string;
  vendor_code: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_person?: string;
  payment_term: PaymentTerm;
  current_balance: number;
  total_purchases: number;
  total_payments: number;
  rating?: number;
  notes?: string;
}

// Purchase Orders
export interface PurchaseOrder extends BaseEntity {
  po_number: string;
  vendor_id: string;
  branch_id?: string;
  order_date: Date;
  expected_delivery_date?: Date;
  po_status: PurchaseOrderStatus;
  payment_term: PaymentTerm;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  notes?: string;
  delivery_address?: string;
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
  vendor?: Vendor;
  branch?: Branch;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  raw_material_id: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  notes?: string;
  raw_material?: RawMaterial;
}

// Expenses
export interface Expense extends BaseEntity {
  expense_number: string;
  branch_id?: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: Date;
  description?: string;
  approval_status: ExpenseStatus;
  approved_by?: string;
  approved_at?: Date;
  payment_method?: PaymentMethod;
  payment_reference?: string;
  is_recurring: boolean;
  attachments?: string;
  branch?: Branch;
}

// Reservations
export interface Reservation extends BaseEntity {
  reservation_number: string;
  branch_id: string;
  customer_id?: string;
  table_id?: string;
  reservation_date: Date;
  party_size: number;
  reservation_status: ReservationStatus;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  special_requests?: string;
  notes?: string;
  branch?: Branch;
  customer?: Customer;
  table?: Table;
}

// Employees
export interface Employee extends BaseEntity {
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  date_of_birth?: Date;
  date_of_joining: Date;
  designation?: string;
  department?: string;
  branch_id?: string;
  salary?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  is_active: boolean;
  branch?: Branch;
}

// Audit Logs
export interface AuditLog extends BaseEntity {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  user?: User;
}

// Settings
export interface Setting extends BaseEntity {
  setting_key: string;
  setting_value: string;
  data_type: SettingDataType;
  category: SettingCategory;
  description?: string;
  is_public: boolean;
  is_editable: boolean;
  branch_id?: string;
}
