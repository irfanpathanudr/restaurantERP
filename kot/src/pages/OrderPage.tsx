import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
  Grid3x3,
  List,
  Loader2,
  Minus,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  addOrderItems,
  cartToPayload,
  createInvoice,
  createOrder,
  getActiveOrderByTable,
  getCategories,
  getKitchens,
  getKots,
  getMenuItems,
  getOrder,
  printKot,
  removeOrderItem,
  updateItemQuantity,
  updateOrderDetails,
} from '@/services/kotApi';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatMoney, printBill, printKotTicket, resolveMediaUrl } from '@/utils/helpers';
import type { CartLine, Category, Kitchen, Kot, MenuItem, MenuItemVariant, Order } from '@/types';
import { CheckoutModal, type PaymentData } from '@/components/CheckoutModal';

function OrderTimer({ startTime }: { startTime?: string | null }) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const [orderDateTime, setOrderDateTime] = useState('');

  useEffect(() => {
    if (!startTime) return;

    // Format order date and time
    const orderDate = new Date(startTime);
    const dateStr = orderDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    setOrderDateTime(`${dateStr} ${timeStr}`);

    const updateTimer = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      setElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
        <Clock size={14} />
        <span className="text-xs font-bold tabular-nums">{elapsed}</span>
      </div>
      <span className="text-[10px] text-white/40 tabular-nums">{orderDateTime}</span>
    </div>
  );
}

// ─── KOT status display ───────────────────────────────────────────────────────
const KOT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  pending: {
    label: 'Waiting',
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400 animate-pulse',
  },
  in_progress: {
    label: 'Preparing',
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    dot: 'bg-sky-400 animate-pulse',
  },
  ready: {
    label: 'READY!',
    color: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300',
    dot: 'bg-emerald-400 animate-pulse',
  },
  served: {
    label: 'Served',
    color: 'border-white/10 bg-white/5 text-white/40',
    dot: 'bg-white/30',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'border-red-500/30 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
  },
};

// ─── useKotStatus hook — shared between KotStatusSection and OrderPage ────────
function useKotStatus(orderId: string | undefined, refreshTrigger: number) {
  const [kots, setKots] = useState<Kot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    setError(false);
    try {
      const list = await getKots({ orderId });
      // Always show active KOTs first; fall back to last 3 when all are done
      const active = list.filter((k) => !['served', 'cancelled'].includes(k.kot_status));
      setKots(active.length > 0 ? active : list.slice(0, 3));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Poll every 5 seconds for live kitchen updates
  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load, refreshTrigger]);

  return { kots, loading, error, reload: load };
}

function KotStatusSection({
  kots,
  loading,
  error,
  onReload,
}: {
  kots: Kot[];
  loading: boolean;
  error: boolean;
  onReload: () => void;
}) {
  if (loading && kots.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30 py-4 justify-center">
        <Loader2 size={13} className="animate-spin" />
        Loading kitchen status…
      </div>
    );
  }

  if (error && kots.length === 0) {
    return (
      <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle size={13} />
          Could not load kitchen status
        </div>
        <button
          type="button"
          onClick={onReload}
          className="text-[10px] text-red-400/70 hover:text-red-400 flex items-center gap-1"
        >
          <RefreshCw size={11} />
          Retry
        </button>
      </div>
    );
  }

  if (kots.length === 0) {
    return (
      <div className="mb-4 rounded-xl border border-white/8 bg-surface-card px-3 py-3 flex items-center gap-2 text-xs text-white/30">
        <ChefHat size={13} />
        No kitchen tickets yet for this order
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60 uppercase tracking-wider">
          <ChefHat size={13} />
          Kitchen Status
        </div>
        <button
          type="button"
          onClick={onReload}
          className="text-[10px] text-white/30 hover:text-white/60 flex items-center gap-1"
        >
          <RefreshCw size={11} />
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {kots.map((kot) => {
          const cfg = KOT_STATUS_CONFIG[kot.kot_status] ?? KOT_STATUS_CONFIG.pending;
          const isReady = kot.kot_status === 'ready';
          return (
            <div
              key={kot.id}
              className={cn(
                'rounded-xl border px-3 py-2.5 flex items-start gap-3',
                cfg.color,
                isReady && 'ring-1 ring-emerald-500/40'
              )}
            >
              {/* Animated status dot */}
              <span className={cn('mt-1.5 h-2.5 w-2.5 rounded-full shrink-0', cfg.dot)} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold">{kot.kot_number}</span>
                  <span
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-md whitespace-nowrap',
                      isReady
                        ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'bg-black/20 text-current'
                    )}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Items in this KOT */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {(kot.items || []).slice(0, 5).map((item, i) => (
                    <span key={i} className="text-[11px] opacity-80">
                      {item.quantity}× {item.name}
                    </span>
                  ))}
                  {(kot.items || []).length > 5 && (
                    <span className="text-[11px] opacity-50">
                      +{kot.items.length - 5} more
                    </span>
                  )}
                </div>

                {/* Kitchen name + time */}
                <div className="flex items-center gap-2 mt-1">
                  {kot.kitchen?.name && (
                    <span className="text-[10px] opacity-50">{kot.kitchen.name}</span>
                  )}
                  <span className="text-[10px] opacity-40 flex items-center gap-1">
                    <Clock size={10} />
                    {(() => {
                      const mins = Math.floor(
                        (Date.now() - new Date(kot.created_at).getTime()) / 60000
                      );
                      return mins < 1 ? 'Just now' : `${mins}m ago`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Big "READY" indicator */}
              {isReady && (
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order page ───────────────────────────────────────────────────────────────
export function OrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { branchId, role, hasPermission } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [kitchenId, setKitchenId] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<'menu' | 'order'>('menu');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantModalItem, setVariantModalItem] = useState<MenuItem | null>(null);
  // Incrementing this triggers KotStatusSection to re-fetch immediately
  const [kotRefreshTrigger, setKotRefreshTrigger] = useState(0);
  // Menu view type - 'image' (grid), 'list' or 'auto'
  const [menuView, setMenuView] = useState<'image' | 'list' | 'auto'>('image');

  // ── KOT state lifted up so the tab badge + item status can both read it ──
  const { kots, loading: kotsLoading, error: kotsError, reload: reloadKots } = useKotStatus(
    order?.id,
    kotRefreshTrigger
  );

  // Track previous ready KOT ids to fire a toast only when status changes to ready
  const prevReadyIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const nowReady = kots.filter((k) => k.kot_status === 'ready');
    const newlyReady = nowReady.filter((k) => !prevReadyIds.current.has(k.id));
    if (newlyReady.length > 0) {
      newlyReady.forEach((k) => {
        toast.success(`🍽 ${k.kot_number} is ready to serve!`, { duration: 5000 });
      });
    }
    prevReadyIds.current = new Set(nowReady.map((k) => k.id));
  }, [kots]);

  // Build a map: menu_item_id → KOT status, for per-item status badges
  const itemStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    // Iterate newest-first; first match wins (most recent KOT for that item)
    for (const kot of [...kots].reverse()) {
      for (const ki of kot.items || []) {
        const mid = ki.menu_item_id || ki.menuItemId;
        if (mid && !map.has(mid)) {
          map.set(mid, kot.kot_status);
        }
      }
    }
    return map;
  }, [kots]);

  // Derive alert state for the tab badge
  const hasReadyKot = kots.some((k) => k.kot_status === 'ready');
  const hasActiveKot = kots.some((k) => ['pending', 'in_progress', 'ready'].includes(k.kot_status));

  const load = useCallback(async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      const [active, items, cats, kits] = await Promise.all([
        getActiveOrderByTable(tableId),
        getMenuItems(),
        getCategories(),
        getKitchens(branchId || undefined),
      ]);
      setOrder(active);
      setMenu(items);
      setCategories(cats);
      setKitchens(kits);
      // Always set to first kitchen (auto-select); backend handles single-kitchen case
      if (kits[0]) setKitchenId(kits[0].id);
    } finally {
      setLoading(false);
    }
  }, [tableId, branchId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, branchId]);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menu.filter((m) => {
      if (categoryId !== 'all' && m.category_id !== categoryId) return false;
      if (!q) return true;
      const name = (m.name || '').toLowerCase();
      const desc = (m.description || '').toLowerCase();
      const sku = ((m as { sku?: string }).sku || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || sku.includes(q);
    });
  }, [menu, categoryId, search]);

  const filteredOrderItems = useMemo(() => {
    const items = order?.order_items || [];
    const q = search.trim().toLowerCase();
    if (!q || tab !== 'order') return items;
    return items.filter((i) => (i.item_name || '').toLowerCase().includes(q));
  }, [order?.order_items, search, tab]);

  function addToCart(item: MenuItem, selectedVariant?: MenuItemVariant) {
    // Check if item has variants and no variant was selected
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0 && !selectedVariant) {
      setVariantModalItem(item);
      setShowVariantModal(true);
      return;
    }

    const price = selectedVariant ? Number(selectedVariant.price) : Number(item.price);
    const variantName = selectedVariant?.name;

    setCart((prev) => {
      // Create unique key including variant
      const cartKey = variantName ? `${item.id}-${variantName}` : item.id;
      
      const existing = prev.find((c) => {
        const existingKey = c.variantName ? `${c.menuItemId}-${c.variantName}` : c.menuItemId;
        return existingKey === cartKey;
      });

      if (existing) {
        return prev.map((c) => {
          const existingKey = c.variantName ? `${c.menuItemId}-${c.variantName}` : c.menuItemId;
          return existingKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c;
        });
      }

      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          unitPrice: price,
          quantity: 1,
          variantName,
        },
      ];
    });
    
    const displayName = variantName ? `${item.name} (${variantName})` : item.name;
    toast.success(`${displayName} added`);
  }

  function handleVariantSelect(variant: MenuItemVariant) {
    if (variantModalItem) {
      addToCart(variantModalItem, variant);
      setShowVariantModal(false);
      setVariantModalItem(null);
    }
  }

  function updateCartQty(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  const cartTotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);

  async function sendToKitchen() {
    if (!tableId || !branchId) {
      toast.error('Select a branch first');
      return;
    }
    if (cart.length === 0) {
      toast.error('Add items first');
      return;
    }

    setSending(true);
    try {
      const items = cartToPayload(cart);
      let createdKotId: string | undefined;

      if (order) {
        const result = await addOrderItems(order.id, {
          items,
          createKot: true,
        });
        setOrder(result.order);
        createdKotId = result.kot?.id;
      } else {
        const created = await createOrder({
          branchId,
          tableId,
          orderType: 'dine_in',
          items,
          createKot: true,
        });
        setOrder(created);
        // fetch KOTs for this order to print latest
        const refreshed = await getActiveOrderByTable(tableId);
        setOrder(refreshed);
      }

      setCart([]);
      setTab('order');
      toast.success('Sent to kitchen');
      setKotRefreshTrigger((n) => n + 1); // refresh KOT status panel

      // Removed auto-print - waiter can manually print if needed
    } finally {
      setSending(false);
    }
  }

  async function handlePrintLastKot() {
    if (!order) return;
    try {
      const kots = await getKots({ orderId: order.id });
      const latest = kots[0];
      if (!latest) {
        toast.error('No KOT for this order');
        return;
      }
      const printed = await printKot(latest.id);
      printKotTicket(printed.printPayload);
      toast.success(printed.printPayload.isReprint ? 'Reprint sent' : 'Printed');
    } catch {
      /* toast */
    }
  }

  async function handleQtyChange(itemId: string, quantity: number) {
    if (!order) return;
    try {
      const updated = await updateItemQuantity(order.id, itemId, quantity);
      setOrder(updated);
      // If quantity is 0, the item is removed, trigger KOT refresh
      if (quantity === 0) {
        setKotRefreshTrigger((n) => n + 1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  }

  async function handleRemove(itemId: string) {
    if (!order) return;
    try {
      const updated = await removeOrderItem(order.id, itemId);
      setOrder(updated);
      // Trigger KOT refresh to update status display
      setKotRefreshTrigger((n) => n + 1);
      toast.success('Item removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  }

  async function handleGenerateBill() {
    if (!order) return;
    setShowCheckout(true);
  }

  async function handleCheckoutConfirm(paymentData: PaymentData) {
    if (!order) return;
    setSending(true);
    try {
      // Update order with discount and GST
      await updateOrderDetails(order.id, {
        discountType: paymentData.discount.type,
        discountValue: paymentData.discount.value,
        discountReason: paymentData.discount.reason,
        taxPercentage: paymentData.gst.enabled ? paymentData.gst.percentage : 0,
      });

      // Create invoice
      await createInvoice(order.id);
      
      // Refresh order to get updated data
      const updatedOrder = await getOrder(order.id);
      
      printBill(updatedOrder);
      toast.success('Bill generated successfully');
      setShowCheckout(false);
      navigate('/tables');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate bill');
    } finally {
      setSending(false);
    }
  }

  async function refreshOrder() {
    if (!order?.id) {
      await load();
      return;
    }
    const fresh = await getOrder(order.id);
    setOrder(fresh);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-white/40">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-8rem)]">
      {/* Header */}
      <div className="sticky top-[57px] z-20 bg-surface/95 backdrop-blur border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/tables')}
            className="p-2 rounded-lg bg-surface-card border border-white/10 hover:bg-surface-elevated"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold truncate">
              Table {order?.table?.table_number || '…'}
            </h2>
            <p className="text-[11px] text-white/45 truncate">
              {order ? order.order_number : 'New order'}
            </p>
          </div>
          <OrderTimer startTime={order?.created_at} />
          {order && (
            <button
              type="button"
              onClick={handlePrintLastKot}
              className="p-2 rounded-lg bg-surface-card border border-white/10 text-brand-400 hover:bg-surface-elevated"
              title="Print KOT"
            >
              <Printer size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-surface-card">
            {(['menu', 'order'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setSearch('');
                }}
                className={cn(
                  'relative py-2.5 rounded-md text-sm font-semibold capitalize transition-all',
                  tab === t
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'text-white/50 hover:text-white/70'
                )}
              >
                {t === 'menu' ? `Menu${cart.length ? ` (${cart.length})` : ''}` : 'Current Order'}
                {/* Status badge on "Current Order" tab when there are active KOTs */}
                {t === 'order' && hasActiveKot && tab !== 'order' && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-surface-card',
                      hasReadyKot ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400 animate-pulse'
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Kitchen Selection - Only show in menu tab and if multiple kitchens */}
        {tab === 'menu' && kitchens.length > 1 && (
          <div className="px-4 pb-3">
            <label className="text-[10px] uppercase tracking-wide text-white/40 mb-1.5 block font-medium">
              Kitchen for KOT
            </label>
            <select
              value={kitchenId}
              onChange={(e) => setKitchenId(e.target.value)}
              className="w-full rounded-lg bg-surface-card border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {tab === 'menu' ? (
        <div className="flex-1 flex flex-col pb-36">
          {/* Search Bar & View Toggle */}
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items..."
                  inputMode="search"
                  autoComplete="off"
                  className="w-full rounded-lg bg-surface-card border border-white/10 pl-9 pr-9 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-white/30"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/45 hover:text-white hover:bg-white/5"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* View Toggle */}
              <div className="flex rounded-lg bg-surface-card border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setMenuView('image')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    menuView === 'image'
                      ? 'bg-brand-500 text-white'
                      : 'text-white/50 hover:text-white/70'
                  )}
                  title="Grid View"
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setMenuView('list')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    menuView === 'list'
                      ? 'bg-brand-500 text-white'
                      : 'text-white/50 hover:text-white/70'
                  )}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Content with Categories Sidebar */}
          <div className="flex-1 flex overflow-hidden">
            {/* Categories Sidebar */}
            <div className="w-24 shrink-0 border-r border-white/10 bg-surface-card/50 overflow-y-auto">
              <button
                type="button"
                onClick={() => setCategoryId('all')}
                className={cn(
                  'w-full px-3 py-3 text-xs font-medium border-b border-white/5 transition-all text-center',
                  categoryId === 'all'
                    ? 'bg-brand-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    'w-full px-3 py-3 text-xs font-medium border-b border-white/5 transition-all text-center leading-tight',
                    categoryId === c.id
                      ? 'bg-brand-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {filteredMenu.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-3">
                    <Search size={24} className="text-white/30" />
                  </div>
                  <p className="text-sm text-white/40">
                    {search ? `No items match "${search.trim()}"` : 'No menu items available'}
                  </p>
                </div>
              ) : menuView === 'list' ? (
                /* List View */
                <div className="space-y-2">
                  {filteredMenu.map((item) => {
                    const inCart = cart.find((c) => c.menuItemId === item.id);
                    const imageUrl = resolveMediaUrl(item.image);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg bg-surface-card border border-white/8 p-2 hover:border-brand-500/50 transition-all"
                      >
                        {/* Image Thumbnail */}
                        <div className="relative w-16 h-16 shrink-0 rounded-md bg-gradient-to-br from-surface-elevated to-surface-card overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat size={20} className="text-white/20" />
                            </div>
                          )}
                          {inCart && inCart.quantity > 0 && (
                            <div className="absolute top-0.5 left-0.5 px-1.5 py-0.5 rounded bg-green-500 text-white text-[10px] font-bold">
                              {inCart.quantity}
                            </div>
                          )}
                        </div>
                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                          <p className="text-sm font-bold text-brand-400">{formatMoney(item.price)}</p>
                        </div>
                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="shrink-0 h-10 w-10 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 active:scale-95 transition-all shadow-lg"
                        >
                          <Plus size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-3 gap-2">
                  {filteredMenu.map((item) => {
                    const inCart = cart.find((c) => c.menuItemId === item.id);
                    const imageUrl = resolveMediaUrl(item.image);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="group relative flex flex-col rounded-lg bg-surface-card border border-white/8 overflow-hidden text-left hover:border-brand-500/50 active:scale-95 transition-all"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square bg-gradient-to-br from-surface-elevated to-surface-card overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/20">
                                        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                                        <line x1="6" y1="17" x2="18" y2="17"/>
                                      </svg>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white/20"
                              >
                                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                                <line x1="6" y1="17" x2="18" y2="17" />
                              </svg>
                            </div>
                          )}
                          {/* Add Button */}
                          <div className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-md bg-brand-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Plus size={16} strokeWidth={2.5} />
                          </div>
                          {/* Cart Badge */}
                          {inCart && inCart.quantity > 0 && (
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-green-500 text-white text-[10px] font-bold shadow-lg">
                              {inCart.quantity}
                            </div>
                          )}
                        </div>
                        {/* Item Details */}
                        <div className="p-2">
                          <p className="font-semibold text-xs line-clamp-2 mb-1 leading-tight">{item.name}</p>
                          <p className="text-xs font-bold text-brand-400">{formatMoney(item.price)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col pb-48">
          {/* KOT Status Cards - Prominent Display */}
          {order && kots.length > 0 && (
            <div className="px-4 pt-4 pb-3">
              <div className="space-y-2">
                {kots.map((kot) => {
                  const cfg = KOT_STATUS_CONFIG[kot.kot_status] ?? KOT_STATUS_CONFIG.pending;
                  const isReady = kot.kot_status === 'ready';
                  const isWaiting = ['pending', 'in_progress'].includes(kot.kot_status);
                  
                  return (
                    <div
                      key={kot.id}
                      className={cn(
                        'rounded-xl border px-4 py-3 flex items-start gap-3',
                        cfg.color,
                        isReady && 'ring-2 ring-emerald-500/50'
                      )}
                    >
                      {/* Status Indicator */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className={cn('h-3 w-3 rounded-full', cfg.dot)} />
                        {isWaiting && (
                          <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                            {cfg.label}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* KOT Number & Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-sm font-bold">{kot.kot_number}</span>
                          <span
                            className={cn(
                              'text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg whitespace-nowrap',
                              isReady
                                ? 'bg-emerald-500/30 text-emerald-200 ring-1 ring-emerald-500/50'
                                : 'bg-black/30 text-current'
                            )}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        {/* Items List */}
                        <div className="space-y-1 mb-2">
                          {(kot.items || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="font-semibold text-white/90">{item.quantity}×</span>
                                <span className="text-white/80">{item.name}</span>
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Kitchen & Time Info */}
                        <div className="flex items-center justify-between text-[11px] opacity-60">
                          {kot.kitchen?.name && (
                            <span className="flex items-center gap-1">
                              <ChefHat size={11} />
                              {kot.kitchen.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {(() => {
                              const mins = Math.floor(
                                (Date.now() - new Date(kot.created_at).getTime()) / 60000
                              );
                              return mins < 1 ? 'Just now' : `${mins}m ago`;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Ready Indicator */}
                      {isReady && (
                        <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={reloadKots}
                className="w-full mt-3 text-xs text-white/40 hover:text-white/60 py-2 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh Kitchen Status
              </button>
            </div>
          )}

          {/* Search for Order Items */}
          {order && (order.order_items?.length || 0) > 0 && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items in order..."
                  inputMode="search"
                  autoComplete="off"
                  className="w-full rounded-lg bg-surface-card border border-white/10 pl-9 pr-9 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-white/30"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/45 hover:text-white hover:bg-white/5"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Order Items List or Empty State */}
          <div className="flex-1 px-4 overflow-y-auto">
            {!order || !order.order_items?.length ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-3">
                  <Receipt size={24} className="text-white/30" />
                </div>
                <p className="text-sm text-white/40">No items in this order yet</p>
                <p className="text-xs text-white/25 mt-1">Add items from the menu tab</p>
              </div>
            ) : filteredOrderItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-3">
                  <Search size={24} className="text-white/30" />
                </div>
                <p className="text-sm text-white/40">No items match "{search.trim()}"</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {filteredOrderItems.map((item) => {
                  // Check KOT status for this item
                  const kotStatus = itemStatusMap.get(item.menu_item_id);
                  const statusConfig = kotStatus ? KOT_STATUS_CONFIG[kotStatus] : null;
                  
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-surface-card border border-white/10 overflow-hidden"
                    >
                      {/* Item Header with Status */}
                      <div className="px-4 py-3 flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <p className="font-semibold text-sm flex-1">{item.item_name}</p>
                            {statusConfig && (
                              <span
                                className={cn(
                                  'text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md whitespace-nowrap',
                                  statusConfig.color
                                )}
                              >
                                {statusConfig.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50">
                            {formatMoney(item.price)} × {item.quantity} = {formatMoney(item.total)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="px-4 pb-3 flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                            className="h-9 w-9 rounded-lg bg-surface-elevated border border-white/10 flex items-center justify-center hover:bg-surface active:scale-95 transition-all"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-sm font-semibold w-10 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                            className="h-9 w-9 rounded-lg bg-surface-elevated border border-white/10 flex items-center justify-center hover:bg-surface active:scale-95 transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="p-2 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Order Summary */}
                <div className="rounded-xl bg-gradient-to-br from-surface-elevated to-surface-card border border-white/10 p-4 text-sm space-y-2.5 mt-6">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatMoney(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Tax</span>
                    <span className="font-semibold">{formatMoney(order.tax_amount)}</span>
                  </div>
                  {Number(order.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span className="font-semibold">-{formatMoney(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2.5 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-brand-400">{formatMoney(order.grand_total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshOrder}
                  className="w-full text-xs text-white/40 hover:text-white/60 py-3 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Tap to refresh order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-16 inset-x-0 z-20 px-4 pb-3 max-w-lg mx-auto">
        {tab === 'menu' && cart.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-surface-elevated to-surface-card border border-white/10 p-4 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-white/60">{cart.reduce((s, c) => s + c.quantity, 0)} items in cart</span>
              <span className="font-bold text-lg">{formatMoney(cartTotal)}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto mb-3 pb-1 -mx-1 px-1 scrollbar-hide">
              {cart.map((c, idx) => {
                const cartKey = c.variantName ? `${c.menuItemId}-${c.variantName}` : c.menuItemId;
                return (
                  <div
                    key={`${cartKey}-${idx}`}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg bg-surface-card border border-white/10 px-2.5 py-1.5 text-xs"
                  >
                    <button 
                      type="button" 
                      onClick={() => updateCartQty(c.menuItemId, -1)}
                      className="hover:text-brand-400"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-semibold tabular-nums">
                      {c.quantity}× {c.name}
                      {c.variantName && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-brand-500/20 text-brand-400 rounded">
                          {c.variantName}
                        </span>
                      )}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => updateCartQty(c.menuItemId, 1)}
                      className="hover:text-brand-400"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              disabled={sending}
              onClick={sendToKitchen}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 py-3.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98]"
            >
              {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Send to Kitchen
            </button>
          </div>
        )}

        {tab === 'order' &&
          order &&
          (role === 'manager' || role === 'cashier' || hasPermission('invoices.create')) && (
            <button
              type="button"
              disabled={sending}
              onClick={handleGenerateBill}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {sending ? <Loader2 className="animate-spin" size={18} /> : <Receipt size={18} />}
              Generate Bill & Complete Order
            </button>
          )}
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && variantModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Select Size</h2>
              <button
                onClick={() => {
                  setShowVariantModal(false);
                  setVariantModalItem(null);
                }}
                className="text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <h3 className="text-lg text-white/80 mb-4">{variantModalItem.name}</h3>
            <div className="space-y-3">
              {variantModalItem.variants?.map((variant) => (
                <button
                  key={variant.name}
                  onClick={() => handleVariantSelect(variant)}
                  className="w-full bg-surface-elevated hover:bg-brand-500/20 border border-white/10 hover:border-brand-500/50 rounded-xl p-4 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{variant.name}</p>
                      <p className="text-sm text-white/50 capitalize">
                        {variant.portion_size} Portion
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-brand-400">
                      {formatMoney(variant.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowVariantModal(false);
                setVariantModalItem(null);
              }}
              className="w-full mt-4 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {order && (
        <CheckoutModal
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          order={order}
          onConfirm={handleCheckoutConfirm}
          loading={sending}
        />
      )}
    </div>
  );
}
