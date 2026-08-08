import { api } from './api';
import type {
  Branch,
  CartLine,
  Category,
  Kitchen,
  Kot,
  MenuItem,
  Order,
  Table,
  User,
} from '@/types';

export async function login(email: string, password: string) {
  const res = await api.post<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>('/auth/login', { email, password });
  return res.data.data;
}

export async function getMe() {
  const res = await api.get<User>('/auth/me');
  return res.data.data;
}

export async function getBranches() {
  const res = await api.get<Branch[]>('/branches');
  return res.data.data || [];
}

export async function getTables(branchId?: string) {
  const res = await api.get<Table[]>('/tables', branchId ? { branchId } : undefined);
  return res.data.data || [];
}

export async function getMenuItems() {
  const res = await api.get<MenuItem[]>('/menu-items');
  return (res.data.data || []).filter((m) => m.is_available !== false);
}

export async function getCategories() {
  const res = await api.get<Category[]>('/categories');
  return res.data.data || [];
}

export async function getKitchens(branchId?: string) {
  const res = await api.get<Kitchen[]>('/kitchens', branchId ? { branchId } : undefined);
  return res.data.data || [];
}

export async function getActiveOrderByTable(tableId: string) {
  const res = await api.get<Order | null>(`/orders/table/${tableId}/active`);
  return res.data.data;
}

export async function createOrder(payload: {
  branchId: string;
  tableId: string;
  orderType: 'dine_in';
  items: { menuItemId: string; quantity: number; unitPrice: number; specialInstructions?: string }[];
  kitchenId?: string;
  notes?: string;
  createKot?: boolean;
}) {
  const res = await api.post<Order>('/orders', payload);
  return res.data.data;
}

export async function addOrderItems(
  orderId: string,
  payload: {
    items: { menuItemId: string; quantity: number; unitPrice: number; specialInstructions?: string }[];
    kitchenId?: string;
    notes?: string;
    createKot?: boolean;
  }
) {
  const res = await api.post<{ order: Order; kot?: Kot }>(`/orders/${orderId}/items`, payload);
  return res.data.data;
}

export async function updateItemQuantity(orderId: string, itemId: string, quantity: number) {
  const res = await api.patch<Order>(`/orders/${orderId}/items/${itemId}`, { quantity });
  return res.data.data;
}

export async function removeOrderItem(orderId: string, itemId: string) {
  const res = await api.delete<Order>(`/orders/${orderId}/items/${itemId}`);
  return res.data.data;
}

export async function getOrder(orderId: string) {
  const res = await api.get<Order>(`/orders/${orderId}`);
  return res.data.data;
}

export async function getKots(params?: {
  kitchenId?: string;
  status?: string;
  orderId?: string;
  branchId?: string;
  activeOnly?: boolean;
}) {
  const res = await api.get<Kot[]>('/kot', params as Record<string, unknown>);
  return res.data.data || [];
}

export async function changeKotStatus(id: string, status: string) {
  const res = await api.patch<Kot>(`/kot/${id}/status`, { status });
  return res.data.data;
}

export async function printKot(id: string) {
  const res = await api.post<{
    kot: Kot;
    printPayload: {
      kotNumber: string;
      tableNumber: string;
      kitchen: string;
      printCount: number;
      isReprint: boolean;
      specialInstructions?: string | null;
      items: { name: string; quantity: number; specialInstructions?: string | null }[];
    };
  }>(`/kot/${id}/print`);
  return res.data.data;
}

export async function createInvoice(orderId: string, notes?: string) {
  const res = await api.post('/invoices', { orderId, notes });
  return res.data.data;
}

export async function updateOrderDetails(orderId: string, data: {
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountReason?: string;
  taxPercentage?: number;
  serviceCharge?: number;
}) {
  const res = await api.patch(`/orders/${orderId}`, data);
  return res.data.data;
}

export function cartToPayload(cart: CartLine[]) {
  return cart.map((c) => ({
    menuItemId: c.menuItemId,
    quantity: c.quantity,
    unitPrice: c.unitPrice,
    specialInstructions: c.specialInstructions,
  }));
}
