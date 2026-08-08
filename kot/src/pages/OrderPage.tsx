import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Clock,
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
import type { CartLine, Category, Kitchen, Kot, MenuItem, Order } from '@/types';
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
  { label: string; color: string; dot: string; icon?: React.ReactNode }
> = {
  pending: {
    label: 'Waiting',
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  },
  in_progress: {
    label: 'Preparing',
    color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    dot: 'bg-sky-400 animate-pulse',
  },
  ready: {
    label: '🍽 Ready!',
    color: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300',
    dot: 'bg-emerald-400',
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

function KotStatusSection({
  orderId,
  refreshTrigger,
}: {
  orderId: string;
  refreshTrigger: number;
}) {
  const [kots, setKots] = useState<Kot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await getKots({ orderId });
      // Show most recent first, exclude served/cancelled unless all are done
      const active = list.filter((k) => !['served', 'cancelled'].includes(k.kot_status));
      setKots(active.length > 0 ? active : list.slice(0, 3));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Poll every 8 seconds so waiter sees live kitchen updates
  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load, refreshTrigger]);

  if (loading && kots.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30 py-4 justify-center">
        <Loader2 size={13} className="animate-spin" />
        Loading kitchen status…
      </div>
    );
  }

  if (kots.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60 uppercase tracking-wider">
          <ChefHat size={13} />
          Kitchen Status
        </div>
        <button
          type="button"
          onClick={load}
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
                      'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md',
                      isReady
                        ? 'bg-emerald-500/25 text-emerald-300'
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
  // Incrementing this triggers KotStatusSection to re-fetch immediately
  const [kotRefreshTrigger, setKotRefreshTrigger] = useState(0);

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
      if (kits[0] && !kitchenId) setKitchenId(kits[0].id);
    } finally {
      setLoading(false);
    }
  }, [tableId, branchId, kitchenId]);

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

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          unitPrice: Number(item.price),
          quantity: 1,
        },
      ];
    });
    toast.success(`${item.name} added`);
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
    if (!kitchenId) {
      toast.error('Select a kitchen');
      return;
    }

    setSending(true);
    try {
      const items = cartToPayload(cart);
      let createdKotId: string | undefined;

      if (order) {
        const result = await addOrderItems(order.id, {
          items,
          kitchenId,
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
          kitchenId,
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

      // Auto-print latest KOT if we have id from addItems
      if (createdKotId) {
        try {
          const printed = await printKot(createdKotId);
          printKotTicket(printed.printPayload);
        } catch {
          /* optional */
        }
      }
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
    const updated = await updateItemQuantity(order.id, itemId, quantity);
    setOrder(updated);
  }

  async function handleRemove(itemId: string) {
    if (!order) return;
    const updated = await removeOrderItem(order.id, itemId);
    setOrder(updated);
    toast.success('Item removed');
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
                  'py-2.5 rounded-md text-sm font-semibold capitalize transition-all',
                  tab === t
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'text-white/50 hover:text-white/70'
                )}
              >
                {t === 'menu' ? `Menu${cart.length ? ` (${cart.length})` : ''}` : 'Current Order'}
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
        <div className="flex-1 px-4 pt-4 pb-36">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              inputMode="search"
              autoComplete="off"
              className="w-full rounded-lg bg-surface-card border border-white/10 pl-10 pr-10 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-white/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white/45 hover:text-white hover:bg-white/5"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              <button
                type="button"
                onClick={() => setCategoryId('all')}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                  categoryId === 'all'
                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25'
                    : 'bg-surface-card border-white/10 text-white/60 hover:text-white hover:border-white/20'
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
                    'shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                    categoryId === c.id
                      ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25'
                      : 'bg-surface-card border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 gap-3">
            {filteredMenu.length === 0 ? (
              <div className="col-span-2 text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-3">
                  <Search size={24} className="text-white/30" />
                </div>
                <p className="text-sm text-white/40">
                  {search ? `No items match "${search.trim()}"` : 'No menu items available'}
                </p>
              </div>
            ) : (
              filteredMenu.map((item) => {
                const inCart = cart.find((c) => c.menuItemId === item.id);
                const imageUrl = resolveMediaUrl(item.image);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addToCart(item)}
                    className="group relative flex flex-col rounded-xl bg-surface-card border border-white/8 overflow-hidden text-left hover:border-brand-500/50 active:scale-[0.98] transition-all"
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
                                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/20">
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
                            width="48"
                            height="48"
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
                      <div className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Plus size={18} strokeWidth={2.5} />
                      </div>
                      {/* Cart Badge */}
                      {inCart && inCart.quantity > 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-green-500 text-white text-xs font-bold shadow-lg">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>
                    {/* Item Details */}
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="font-semibold text-sm line-clamp-2 mb-1 leading-snug">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-white/35 line-clamp-2 mb-2 flex-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-sm font-bold text-brand-400 mt-auto">{formatMoney(item.price)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 pt-4 pb-36">
          {/* ── KOT Kitchen Status ── always show when order exists */}
          {order && (
            <KotStatusSection
              orderId={order.id}
              refreshTrigger={kotRefreshTrigger}
            />
          )}

          {/* Search for Order Items */}
          {order && (order.order_items?.length || 0) > 0 && (
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items in order..."
                inputMode="search"
                autoComplete="off"
                className="w-full rounded-lg bg-surface-card border border-white/10 pl-10 pr-10 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-white/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white/45 hover:text-white hover:bg-white/5"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

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
            <div className="space-y-3">
              {filteredOrderItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-surface-card border border-white/8 px-4 py-3.5"
                >
                  <div className="flex justify-between gap-2 mb-3">
                    <p className="font-semibold text-sm">{item.item_name}</p>
                    <p className="text-sm font-bold text-brand-400">{formatMoney(item.total)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                        className="h-9 w-9 rounded-lg bg-surface-elevated border border-white/10 flex items-center justify-center hover:bg-surface active:scale-95 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-semibold w-8 text-center tabular-nums">{item.quantity}</span>
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
              ))}
              
              {/* Order Summary */}
              <div className="rounded-xl bg-gradient-to-br from-surface-elevated to-surface-card border border-white/10 p-4 text-sm space-y-2.5 mt-4">
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
                className="w-full text-xs text-white/40 hover:text-white/60 py-3 transition-colors"
              >
                Tap to refresh order
              </button>
            </div>
          )}
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
              {cart.map((c) => (
                <div
                  key={c.menuItemId}
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
                  </span>
                  <button 
                    type="button" 
                    onClick={() => updateCartQty(c.menuItemId, 1)}
                    className="hover:text-brand-400"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={sending}
              onClick={sendToKitchen}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 py-3.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98]"
            >
              {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Send to Kitchen & Print KOT
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
