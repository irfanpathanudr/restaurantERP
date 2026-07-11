// Request DTOs for API calls

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id: string;
  branch_id?: string;
}

export interface UpdateUserDto {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id?: string;
  branch_id?: string;
  status?: string;
}

export interface ChangePasswordDto {
  old_password: string;
  new_password: string;
}

// Restaurant & Branch DTOs
export interface CreateRestaurantDto {
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
}

export interface CreateBranchDto {
  restaurant_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
}

// Menu DTOs
export interface CreateCategoryDto {
  name: string;
  description?: string;
  sort_order?: number;
}

export interface CreateMenuItemDto {
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost_price?: number;
  category_id: string;
  image_url?: string;
  preparation_time?: number;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  allergens?: string;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {}

// Recipe DTOs
export interface CreateRecipeDto {
  menu_item_id: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  instructions?: string;
  ingredients: {
    raw_material_id: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
}

export interface UpdateRecipeDto extends Partial<CreateRecipeDto> {}

// Table DTOs
export interface CreateTableDto {
  branch_id: string;
  table_number: string;
  capacity: number;
  floor?: string;
  section?: string;
}

export interface UpdateTableDto extends Partial<CreateTableDto> {
  table_status?: string;
}

// Kitchen DTOs
export interface CreateKitchenDto {
  branch_id: string;
  name: string;
  code: string;
  description?: string;
  printer_ip?: string;
  printer_port?: number;
  sort_order?: number;
}

export interface UpdateKitchenDto extends Partial<CreateKitchenDto> {}

// Customer DTOs
export interface CreateCustomerDto {
  first_name: string;
  last_name?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// Order DTOs
export interface CreateOrderDto {
  branch_id: string;
  table_id?: string;
  customer_id?: string;
  order_type: string;
  items: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    special_instructions?: string;
  }[];
  discount_amount?: number;
  notes?: string;
}

export interface UpdateOrderDto {
  order_status?: string;
  items?: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    special_instructions?: string;
  }[];
  discount_amount?: number;
  notes?: string;
}

// KOT DTOs
export interface CreateKOTDto {
  order_id: string;
  kitchen_id: string;
  items: any[];
  notes?: string;
}

export interface UpdateKOTDto {
  kot_status?: string;
  notes?: string;
}

// Payment DTOs
export interface CreatePaymentDto {
  order_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  reference_number?: string;
  notes?: string;
}

// Invoice DTOs
export interface CreateInvoiceDto {
  order_id: string;
  customer_id?: string;
  notes?: string;
}

// Inventory DTOs
export interface CreateRawMaterialDto {
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
}

export interface UpdateRawMaterialDto extends Partial<CreateRawMaterialDto> {}

export interface AdjustStockDto {
  quantity: number;
  type: 'ADD' | 'REMOVE';
  reason?: string;
}

// Vendor DTOs
export interface CreateVendorDto {
  name: string;
  vendor_code: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_person?: string;
  payment_term?: string;
  notes?: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface UpdateVendorRatingDto {
  rating: number;
}

// Purchase Order DTOs
export interface CreatePurchaseOrderDto {
  po_number: string;
  vendor_id: string;
  branch_id?: string;
  order_date: string;
  expected_delivery_date?: string;
  payment_term: string;
  items: {
    raw_material_id: string;
    quantity: number;
    unit: string;
    unit_price: number;
    notes?: string;
  }[];
  tax_percentage?: number;
  discount_amount?: number;
  shipping_cost?: number;
  notes?: string;
  delivery_address?: string;
}

export interface UpdatePurchaseOrderDto extends Partial<CreatePurchaseOrderDto> {}

export interface ReceiveItemsDto {
  received_items: {
    item_id: string;
    received_quantity: number;
  }[];
}

export interface RejectPurchaseOrderDto {
  reason: string;
}

// Expense DTOs
export interface CreateExpenseDto {
  expense_number: string;
  branch_id?: string;
  category: string;
  amount: number;
  expense_date: string;
  description?: string;
  payment_method?: string;
  payment_reference?: string;
  is_recurring?: boolean;
  attachments?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ApproveExpenseDto {
  approved_by: string;
}

export interface RejectExpenseDto {
  reason?: string;
}

// Reservation DTOs
export interface CreateReservationDto {
  branch_id: string;
  customer_id?: string;
  table_id?: string;
  reservation_date: string;
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  special_requests?: string;
  notes?: string;
}

export interface UpdateReservationDto extends Partial<CreateReservationDto> {}

export interface AssignTableDto {
  table_id: string;
}

// Employee DTOs
export interface CreateEmployeeDto {
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  date_of_birth?: string;
  date_of_joining: string;
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
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

// Setting DTOs
export interface CreateSettingDto {
  setting_key: string;
  setting_value: string;
  data_type?: string;
  category?: string;
  description?: string;
  is_public?: boolean;
  is_editable?: boolean;
  branch_id?: string;
}

export interface UpdateSettingDto extends Partial<CreateSettingDto> {}

export interface BulkUpdateSettingsDto {
  settings: {
    key: string;
    value: string;
  }[];
  branchId?: string;
}

// Report Query DTOs
export interface ReportQueryDto {
  startDate: string;
  endDate: string;
  branchId?: string;
}

export interface TopSellingItemsQueryDto extends ReportQueryDto {
  limit?: number;
}

// Dashboard Query DTOs
export interface DashboardQueryDto {
  branchId?: string;
}

export interface RevenueAnalyticsQueryDto extends DashboardQueryDto {
  days?: number;
}
