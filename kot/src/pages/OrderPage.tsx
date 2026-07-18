import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  Printer,
  Receipt,
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
} from '@/services/kotApi';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatMoney, printBill, printKotTicket } from '@/utils/helpers';
import type { CartLine, Category, Kitchen, MenuItem, Order } from '@/types';

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
    setSending(true);
    try {
      await createInvoice(order.id);
      printBill(order);
      toast.success('Bill generated');
      navigate('/tables');
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
      <div className="sticky top-[57px] z-20 bg-surface/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/tables')}
            className="p-2 rounded-lg bg-surface-card border border-white/10"
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
          {order && (
            <button
              type="button"
              onClick={handlePrintLastKot}
              className="p-2 rounded-lg bg-surface-card border border-white/10 text-brand-400"
              title="Print KOT"
            >
              <Printer size={18} />
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-card">
          {(['menu', 'order'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'py-2 rounded-lg text-xs font-semibold capitalize',
                tab === t ? 'bg-brand-500 text-white' : 'text-white/50'
              )}
            >
              {t === 'menu' ? `Menu${cart.length ? ` (${cart.length})` : ''}` : 'Current order'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'menu' ? (
        <div className="flex-1 px-4 pt-3 pb-36">
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items by name…"
              inputMode="search"
              autoComplete="off"
              className="w-full rounded-xl bg-surface-card border border-white/10 pl-10 pr-10 py-3 text-sm outline-none focus:border-brand-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/45 hover:text-white hover:bg-white/5"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wide text-white/40 mb-1 block">
              Kitchen for KOT
            </label>
            <select
              value={kitchenId}
              onChange={(e) => setKitchenId(e.target.value)}
              className="w-full rounded-xl bg-surface-card border border-white/10 px-3 py-2.5 text-sm"
            >
              {kitchens.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setCategoryId('all')}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-xs border',
                categoryId === 'all'
                  ? 'bg-white text-surface border-white'
                  : 'border-white/15 text-white/50'
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs border',
                  categoryId === c.id
                    ? 'bg-white text-surface border-white'
                    : 'border-white/15 text-white/50'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredMenu.length === 0 ? (
              <p className="text-center text-sm text-white/40 py-12">
                {search ? `No items match “${search.trim()}”` : 'No menu items'}
              </p>
            ) : (
              filteredMenu.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl bg-surface-card border border-white/8 px-3.5 py-3 text-left active:bg-surface-elevated"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-[11px] text-white/40 truncate mt-0.5">{item.description}</p>
                    )}
                    <p className="text-xs text-brand-400 mt-0.5">{formatMoney(item.price)}</p>
                  </div>
                  <span className="shrink-0 h-8 w-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    <Plus size={16} />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 pt-3 pb-36 space-y-3">
          {order && (order.order_items?.length || 0) > 0 && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items in order…"
                inputMode="search"
                autoComplete="off"
                className="w-full rounded-xl bg-surface-card border border-white/10 pl-10 pr-10 py-3 text-sm outline-none focus:border-brand-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/45"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {!order || !order.order_items?.length ? (
            <p className="text-center text-sm text-white/40 py-16">No items on this order yet</p>
          ) : filteredOrderItems.length === 0 ? (
            <p className="text-center text-sm text-white/40 py-12">
              No items match “{search.trim()}”
            </p>
          ) : (
            <>
              {filteredOrderItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-surface-card border border-white/8 px-3.5 py-3"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-sm">{item.item_name}</p>
                    <p className="text-sm text-brand-400">{formatMoney(item.total)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-red-400/80"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="rounded-xl bg-surface-elevated p-4 text-sm space-y-1">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax</span>
                  <span>{formatMoney(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span>Total</span>
                  <span>{formatMoney(order.grand_total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={refreshOrder}
                className="w-full text-xs text-white/40 py-2"
              >
                Refresh order
              </button>
            </>
          )}
        </div>
      )}

      {/* Sticky action bar */}
      <div className="fixed bottom-16 inset-x-0 z-20 px-4 pb-2 max-w-lg mx-auto">
        {tab === 'menu' && cart.length > 0 && (
          <div className="rounded-2xl bg-surface-elevated border border-white/10 p-3 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span>{cart.reduce((s, c) => s + c.quantity, 0)} items</span>
              <span className="font-semibold">{formatMoney(cartTotal)}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto mb-2 pb-1">
              {cart.map((c) => (
                <div
                  key={c.menuItemId}
                  className="shrink-0 flex items-center gap-1 rounded-lg bg-surface-card px-2 py-1 text-xs"
                >
                  <button type="button" onClick={() => updateCartQty(c.menuItemId, -1)}>
                    <Minus size={12} />
                  </button>
                  <span>
                    {c.quantity}× {c.name}
                  </span>
                  <button type="button" onClick={() => updateCartQty(c.menuItemId, 1)}>
                    <Plus size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={sending}
              onClick={sendToKitchen}
              className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Send to kitchen + print
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
              className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Receipt size={16} />}
              Generate & print bill
            </button>
          )}
      </div>
    </div>
  );
}
