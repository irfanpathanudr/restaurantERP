import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { orderService, OrderStatusValue } from '@/services/order.service';
import { paymentService, Payment } from '@/services/payment.service';
import { apiService } from '@/services/api.service';
import { useAuth } from '@/hooks/useAuth';
import PrintableOrderReceipt from '@/components/common/PrintableOrderReceipt';
import { PrinterSettings } from '@/components/settings/PrinterSettings';
import { getThermalPrinter, OrderPrintData } from '@/utils/thermalPrinter';
import { printBillBluetooth, printBillFallback } from '@/utils/escpos';
import { useReactToPrint } from 'react-to-print';
import {
  Plus,
  Search,
  Minus,
  ShoppingCart,
  X,
  UtensilsCrossed,
  Eye,
  RefreshCw,
  Ban,
  CheckCircle2,
  Printer,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface MenuItem {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number | string;
  image?: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  category?: { id: string; name: string };
}

interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
}

interface TableOption {
  id: string;
  table_number: string;
  name?: string;
  floor?: string;
  dining_area?: string;
  table_status: string;
}

interface BranchOption {
  id: string;
  name: string;
}

interface OrderItemRow {
  id: string;
  item_name: string;
  price: number | string;
  quantity: number;
  total: number | string;
  special_instructions?: string | null;
  menu_item?: MenuItem;
}

interface OrderRow {
  id: string;
  order_number: string;
  order_type: string;
  order_status: string;
  payment_status: string;
  subtotal: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  grand_total: number | string;
  paid_amount?: number | string;
  due_amount?: number | string;
  special_instructions?: string | null;
  is_locked?: boolean;
  created_at?: string;
  ordered_at?: string;
  table?: { id: string; table_number: string; name?: string } | null;
  customer?: { id: string; name?: string; first_name?: string; last_name?: string } | null;
  order_items?: OrderItemRow[];
  branch?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    gst_number?: string;
    restaurant?: {
      id: string;
      name: string;
      logo?: string;
      phone?: string;
      gst_number?: string;
    };
  };
  payments?: Payment[];
}

const ORDER_STATUSES: OrderStatusValue[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'completed',
  'cancelled',
];

const money = (value: number | string | undefined | null) =>
  `₹${Number(value || 0).toFixed(2)}`;

const formatStatus = (status: string) =>
  (status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    preparing: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    ready: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    served: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  return map[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
};

const paymentColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    partial: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    refunded: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  };
  return map[status] || map.pending;
};

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [orderPayments, setOrderPayments] = useState<Payment[]>([]);
  const [printSource, setPrintSource] = useState<{
    order: OrderRow;
    payments: Payment[];
  } | null>(null);
  const [printLoading, setPrintLoading] = useState<string | null>(null);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Create order state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [orderNotes, setOrderNotes] = useState('');
  const [kitchens, setKitchens] = useState<{ id: string; name: string }[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState('');

  const categories = [
    { id: 'all', name: 'All Items' },
    ...Array.from(new Set(menuItems.map((item) => item.category?.name).filter(Boolean))).map(
      (name) => ({
        id: (name as string).toLowerCase().replace(/\s+/g, '-'),
        name: name as string,
      })
    ),
  ];

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (statusFilter !== 'all' && statusFilter !== 'active') {
        params.status = statusFilter;
      }
      if (user?.branch_id) {
        params.branchId = user.branch_id;
      }
      let data = await orderService.list(params);
      if (statusFilter === 'active') {
        data = data.filter(
          (o: OrderRow) => !['completed', 'cancelled'].includes(o.order_status)
        );
      }
      setOrders(data);
    } catch (error: any) {
      if (axios.isCancel(error) || error?.response?.status === 401) return;
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user?.branch_id, isAuthenticated]);

  useEffect(() => {
    dispatch(setPageTitle('Orders'));
    if (!isAuthenticated) return;

    fetchOrders();
    const timer = setInterval(fetchOrders, 15000);
    return () => clearInterval(timer);
  }, [dispatch, fetchOrders, isAuthenticated]);

  useEffect(() => {
    let filtered = menuItems.filter((item) => item.is_available !== false);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q) ||
          item.category?.name.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (item) =>
          item.category?.name.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }
    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, menuItems]);

  const fetchCreateData = async () => {
    try {
      setMenuLoading(true);
      const [menuRes, tablesRes, branchesRes, kitchensRes] = await Promise.all([
        apiService.get('/menu-items', { params: { isAvailable: true } }),
        apiService.get('/tables'),
        apiService.get('/branches'),
        apiService.get('/kitchens').catch(() => ({ data: { data: [] } })),
      ]);
      setMenuItems(menuRes.data.data || []);
      setTables(tablesRes.data.data || []);
      const branchList = branchesRes.data.data || [];
      setBranches(branchList);
      const defaultBranch = user?.branch_id || branchList[0]?.id || '';
      setSelectedBranch(defaultBranch);
      
      const kitchenList = kitchensRes.data.data || [];
      setKitchens(kitchenList);
      // Auto-select kitchen if only one exists
      if (kitchenList.length === 1) {
        setSelectedKitchen(kitchenList[0].id);
      } else if (kitchenList.length > 1) {
        // Try to find "Main Kitchen"
        const mainKitchen = kitchenList.find((k: any) => 
          k.name.toLowerCase().includes('main')
        );
        setSelectedKitchen(mainKitchen?.id || kitchenList[0]?.id || '');
      }
    } catch {
      toast.error('Failed to load menu / tables');
    } finally {
      setMenuLoading(false);
    }
  };

  const openCreate = async () => {
    setCart([]);
    setSelectedTable('');
    setSelectedKitchen('');
    setOrderNotes('');
    setOrderType('dine_in');
    setSearchQuery('');
    setSelectedCategory('all');
    setShowCreateModal(true);
    await fetchCreateData();
  };

  const openDetail = async (order: OrderRow) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setOrderPayments([]);
    try {
      // Fetch full order details with branch and restaurant info
      const full = await orderService.get(order.id);
      setSelectedOrder(full);
      
      // Fetch payments for this order
      try {
        const payments = await paymentService.getOrderPayments(order.id);
        setOrderPayments(payments);
      } catch (paymentError) {
        console.error('Failed to fetch payments:', paymentError);
        // Continue even if payments fail
      }
    } catch {
      setSelectedOrder(order);
      toast.error('Could not refresh order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const addToCart = (menuItem: MenuItem) => {
    const existing = cart.find((c) => c.menu_item.id === menuItem.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.menu_item.id === menuItem.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { menu_item: menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.menu_item.id !== menuItemId) return item;
          return { ...item, quantity: item.quantity + delta };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.menu_item.price || 0) * item.quantity,
    0
  );

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart');
      return;
    }
    if (!selectedBranch) {
      toast.error('Please select a branch');
      return;
    }
    if (orderType === 'dine_in' && !selectedTable) {
      toast.error('Please select a table');
      return;
    }

    try {
      setActionLoading(true);
      await orderService.create({
        branchId: selectedBranch,
        orderType,
        tableId: orderType === 'dine_in' ? selectedTable : undefined,
        notes: orderNotes || undefined,
        createKot: true,
        kitchenId: selectedKitchen || undefined, // Include kitchen ID (backend will auto-select if not provided)
        items: cart.map((item) => ({
          menuItemId: item.menu_item.id,
          quantity: item.quantity,
          unitPrice: Number(item.menu_item.price || 0),
          specialInstructions: item.special_instructions,
        })),
      });
      toast.success('Order created successfully');
      setShowCreateModal(false);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatusValue) => {
    try {
      setActionLoading(true);
      const updated = await orderService.updateStatus(orderId, status);
      setSelectedOrder(updated);
      toast.success(`Status updated to ${formatStatus(status)}`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      setActionLoading(true);
      const updated = await orderService.complete(orderId);
      setSelectedOrder(updated);
      toast.success('Order completed');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      setActionLoading(true);
      const updated = await orderService.cancel(orderId);
      setSelectedOrder(updated);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleItemQty = async (itemId: string, quantity: number) => {
    if (!selectedOrder) return;
    try {
      setActionLoading(true);
      const updated =
        quantity <= 0
          ? await orderService.removeItem(selectedOrder.id, itemId)
          : await orderService.updateItemQuantity(selectedOrder.id, itemId, quantity);
      setSelectedOrder(updated);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printSource
      ? `Order-${printSource.order.order_number}`
      : selectedOrder
        ? `Order-${selectedOrder.order_number}`
        : 'Order',
    onAfterPrint: () => toast.success('Print dialog opened'),
  });

  const triggerPrint = useCallback((order: OrderRow, payments: Payment[] = []) => {
    setPrintSource({ order, payments });
    setPendingPrint(true);
  }, []);

  useEffect(() => {
    if (!pendingPrint || !printSource) return;

    const timer = window.setTimeout(() => {
      handlePrint();
      setPendingPrint(false);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [pendingPrint, printSource, handlePrint]);

  const handlePrintFromList = async (order: OrderRow) => {
    try {
      setPrintLoading(order.id);
      const full = await orderService.get(order.id);
      let payments: Payment[] = [];
      try {
        payments = await paymentService.getOrderPayments(order.id);
      } catch {
        // Continue without payment details
      }
      // Use Bluetooth printer instead of browser print
      await printWithThermalPrinter(full, payments);
    } catch (error: any) {
      if (axios.isCancel(error) || error?.response?.status === 401) return;
      toast.error(error.response?.data?.message || 'Failed to load order for printing');
    } finally {
      setPrintLoading(null);
    }
  };

  const handlePrintFromModal = () => {
    if (!selectedOrder) return;
    // Use Bluetooth printer instead of browser print
    printWithThermalPrinter(selectedOrder, orderPayments);
  };

  /**
   * Print using Bluetooth thermal printer (same as KOT side) - always tries Bluetooth first
   */
  const printWithThermalPrinter = async (order: OrderRow, payments: Payment[] = []) => {
    try {
      const formatStatus = (status: string) =>
        (status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      // Prepare order data for Bluetooth printer
      const orderData = {
        order_number: order.order_number,
        restaurant_name: order.branch?.restaurant?.name || 'Restaurant',
        branch_name: order.branch?.name,
        table: order.table
          ? {
              table_number: order.table.table_number
                ? `${order.table.table_number}${order.table.name ? ` (${order.table.name})` : ''}`
                : 'N/A',
            }
          : null,
        order_items: (order.order_items || []).map(item => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit_price: Number(item.price),
          total: Number(item.total),
        })),
        subtotal: Number(order.subtotal),
        tax_amount: Number(order.tax_amount),
        discount_amount: Number(order.discount_amount || 0),
        grand_total: Number(order.grand_total),
        payment_method: payments.length > 0 ? formatStatus(payments[0].payment_method) : undefined,
      };

      try {
        // Try to print with Bluetooth printer (same as KOT side)
        await printBillBluetooth(orderData);
        toast.success('Order sent to Bluetooth printer!');
      } catch (btError: any) {
        console.warn('Bluetooth print failed, using fallback:', btError);
        // Fallback to browser print dialog if Bluetooth fails
        printBillFallback(orderData);
        toast.info('Using browser print (Bluetooth unavailable)');
      }
    } catch (error: any) {
      console.error('Print error:', error);
      toast.error(error.message || 'Failed to print order');
    }
  };

  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: 'order_number',
      header: 'Order #',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
          {row.original.order_number}
        </span>
      ),
    },
    {
      accessorKey: 'table',
      header: 'Table',
      cell: ({ row }) =>
        row.original.table?.table_number
          ? `Table ${row.original.table.table_number}`
          : formatStatus(row.original.order_type),
    },
    {
      accessorKey: 'order_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize">{formatStatus(row.original.order_type)}</span>
      ),
    },
    {
      accessorKey: 'order_status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full capitalize',
            statusColor(row.original.order_status)
          )}
        >
          {formatStatus(row.original.order_status)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_status',
      header: 'Payment',
      cell: ({ row }) => (
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full capitalize',
            paymentColor(row.original.payment_status)
          )}
        >
          {formatStatus(row.original.payment_status)}
        </span>
      ),
    },
    {
      accessorKey: 'order_items',
      header: 'Items',
      cell: ({ row }) => row.original.order_items?.length || 0,
    },
    {
      accessorKey: 'grand_total',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {money(row.original.grand_total)}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Time',
      cell: ({ row }) => {
        const ts = row.original.ordered_at || row.original.created_at;
        return ts ? new Date(ts).toLocaleString() : '-';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye className="h-4 w-4" />}
            onClick={() => openDetail(row.original)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Printer className="h-4 w-4" />}
            disabled={printLoading === row.original.id}
            onClick={(e) => {
              e.stopPropagation();
              handlePrintFromList(row.original);
            }}
            title="Print order"
          >
            {printLoading === row.original.id ? '...' : 'Print'}
          </Button>
        </div>
      ),
    },
  ];

  const isEditable =
    selectedOrder &&
    !selectedOrder.is_locked &&
    !['completed', 'cancelled'].includes(selectedOrder.order_status);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage orders from KOT and walk-in guests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchOrders}
          >
            Refresh
          </Button>
          <Button leftIcon={<Plus className="h-5 w-5" />} onClick={openCreate}>
            New Order
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'active', label: 'Active' },
          { id: 'all', label: 'All' },
          ...ORDER_STATUSES.map((s) => ({ id: s, label: formatStatus(s) })),
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              statusFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchPlaceholder="Search orders..."
        onRefresh={fetchOrders}
      />

      {/* Order Detail Modal */}
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <span>{selectedOrder ? `Order ${selectedOrder.order_number}` : 'Order Details'}</span>
            {selectedOrder && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={handlePrintFromModal}
              >
                Print
              </Button>
            )}
          </div>
        }
        size="xl"
        scrollBody={false}
        contentClassName="flex flex-col max-h-[calc(100vh-12rem)] overflow-hidden"
      >
        {detailLoading || !selectedOrder ? (
          <div className="py-12 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="flex flex-col min-h-0 flex-1 gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Table / Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedOrder.table?.table_number
                    ? `Table ${selectedOrder.table.table_number}`
                    : formatStatus(selectedOrder.order_type)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <span
                  className={cn(
                    'inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                    statusColor(selectedOrder.order_status)
                  )}
                >
                  {formatStatus(selectedOrder.order_status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Payment</p>
                <span
                  className={cn(
                    'inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                    paymentColor(selectedOrder.payment_status)
                  )}
                >
                  {formatStatus(selectedOrder.payment_status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {money(selectedOrder.grand_total)}
                </p>
              </div>
            </div>

            {selectedOrder.special_instructions && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300 shrink-0">
                Notes: {selectedOrder.special_instructions}
              </div>
            )}

            <div className="flex flex-col min-h-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 shrink-0">
                Items
              </h3>
              <div className="space-y-2 min-h-[120px] max-h-[280px] overflow-y-auto scrollbar-visible pr-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {(selectedOrder.order_items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.item_name || item.menu_item?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {money(item.price)} × {item.quantity}
                        {item.special_instructions ? ` · ${item.special_instructions}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isEditable && (
                        <div className="flex items-center gap-1">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleItemQty(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleItemQty(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <span className="font-semibold w-20 text-right">
                        {money(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm shrink-0">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{money(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span>{money(selectedOrder.tax_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span>-{money(selectedOrder.discount_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span>{money(selectedOrder.grand_total)}</span>
              </div>
            </div>

            {isEditable && (
              <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Update status:
                  </label>
                  <select
                    disabled={actionLoading}
                    value={selectedOrder.order_status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedOrder.id,
                        e.target.value as OrderStatusValue
                      )
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  >
                    {ORDER_STATUSES.filter((s) => s !== 'cancelled').map((s) => (
                      <option key={s} value={s}>
                        {formatStatus(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    leftIcon={<Ban className="h-4 w-4" />}
                    disabled={actionLoading}
                    onClick={() => handleCancel(selectedOrder.id)}
                    className="text-red-600"
                  >
                    Cancel Order
                  </Button>
                  <Button
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    disabled={actionLoading}
                    onClick={() => handleComplete(selectedOrder.id)}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Off-screen printable receipt (must not use display:none) */}
      <div aria-hidden="true" className="fixed left-[-9999px] top-0 w-[800px]">
        {(printSource || selectedOrder) && (
          <PrintableOrderReceipt
            ref={printRef}
            order={{
              ...(printSource?.order || selectedOrder!),
              payments: printSource?.payments ?? orderPayments,
            }}
            showPaymentDetails={true}
          />
        )}
      </div>

      {/* Create Order Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Order"
        size="full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap',
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {menuLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <UtensilsCrossed className="h-16 w-16 mb-4 opacity-50" />
                  <p>No menu items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => {
                    const img = item.image || item.image_url;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        className="bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-lg overflow-hidden text-left"
                      >
                        <div className="aspect-square bg-gray-200 dark:bg-gray-600 relative">
                          {img ? (
                            <img
                              src={img}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UtensilsCrossed className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {item.name}
                          </h3>
                          {item.category && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.category.name}</p>
                          )}
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2 block">
                            {money(item.price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex flex-col space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <ShoppingCart className="h-5 w-5" />
              <h3 className="font-semibold">Order Cart ({cart.length})</h3>
            </div>

            {branches.length > 1 && (
              <div>
                <label className="block text-sm font-medium mb-2">Branch *</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as typeof orderType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="dine_in">Dine In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {orderType === 'dine_in' && (
              <div>
                <label className="block text-sm font-medium mb-2">Table *</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select Table</option>
                  {tables
                    .filter((t) => t.table_status === 'available' || t.table_status === 'occupied')
                    .map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.table_number}
                        {table.dining_area ? ` (${table.dining_area})` : ''} — {table.table_status}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menu_item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{item.menu_item.name}</h4>
                        <p className="text-xs text-gray-500">{money(item.menu_item.price)} each</p>
                      </div>
                      <button onClick={() => updateQuantity(item.menu_item.id, -item.quantity)}>
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menu_item.id, -1)}
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_item.id, 1)}
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-semibold">
                        {money(Number(item.menu_item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order Notes</label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Special instructions..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {money(cartTotal)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={cart.length === 0 || actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;
