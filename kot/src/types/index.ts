export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  role?: {
    id?: string;
    code: string;
    name: string;
    permissions?: { code: string; name?: string }[] | string[];
  };
  roles?: { code: string; name: string }[];
  permissions?: string[];
  branch_id?: string;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  code?: string;
}

export interface Table {
  id: string;
  name: string;
  table_number: string;
  branch_id: string;
  capacity: number;
  table_status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string | null;
  dining_area?: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number | string;
  category_id: string;
  is_available: boolean;
  food_type?: string;
  description?: string | null;
  sku?: string;
  kitchens?: { id: string; name: string }[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Kitchen {
  id: string;
  name: string;
  code: string;
  branch_id: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  price: number | string;
  quantity: number;
  total: number | string;
  special_instructions?: string | null;
  menu_item?: MenuItem;
}

export interface Order {
  id: string;
  order_number: string;
  branch_id: string;
  table_id?: string | null;
  order_type: string;
  order_status: string;
  payment_status: string;
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  grand_total: number | string;
  due_amount?: number | string;
  special_instructions?: string | null;
  table?: Table | null;
  order_items?: OrderItem[];
}

export interface KotItem {
  menu_item_id?: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  special_instructions?: string | null;
  specialInstructions?: string | null;
  price?: number;
}

export interface Kot {
  id: string;
  kot_number: string;
  order_id: string;
  kitchen_id: string;
  kot_status: 'pending' | 'in_progress' | 'ready' | 'served' | 'cancelled';
  priority?: string;
  items: KotItem[];
  special_instructions?: string | null;
  print_count: number;
  created_at: string;
  started_at?: string | null;
  ready_at?: string | null;
  order?: Order;
  kitchen?: Kitchen;
}

export interface CartLine {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
}

export type AppRole = 'waiter' | 'chef' | 'manager' | 'cashier' | 'admin';
