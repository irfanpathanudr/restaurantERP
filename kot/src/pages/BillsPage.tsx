import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Receipt, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { createInvoice, getOrder } from '@/services/kotApi';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatMoney, printBill } from '@/utils/helpers';
import type { Order } from '@/types';

export function BillsPage() {
  const { branchId, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Check permission
  if (!hasPermission('invoices.create') && !hasPermission('orders.read')) {
    return (
      <div className="px-4 pt-8 max-w-lg mx-auto">
        <div className="rounded-2xl bg-surface-card border border-red-500/20 p-6 text-center">
          <p className="text-red-400 font-semibold mb-2">Access Denied</p>
          <p className="text-sm text-white/60">
            You do not have permission to view bills.
          </p>
        </div>
      </div>
    );
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Order[]>('/orders', {
        branchId: branchId || undefined,
        activeOnly: true,
      });
      setOrders(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    load();
  }, [load]);

  async function bill(orderId: string) {
    setBusyId(orderId);
    try {
      const order = await getOrder(orderId);
      await createInvoice(orderId);
      printBill(order);
      toast.success('Bill generated');
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold">Open bills</h2>
          <p className="text-xs text-white/45">Generate invoice & print</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="p-2.5 rounded-xl bg-surface-card border border-white/10"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-white/40">
          <Loader2 className="animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-sm text-white/40 py-16">No open orders</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-surface-card border border-white/10 p-4"
            >
              <div className="flex justify-between gap-2 mb-2">
                <div>
                  <p className="font-display font-bold text-lg">
                    Table {order.table?.table_number || '—'}
                  </p>
                  <p className="text-[11px] text-white/45">{order.order_number}</p>
                </div>
                <p className="font-semibold text-brand-400">{formatMoney(order.grand_total)}</p>
              </div>
              <p className="text-xs text-white/40 mb-3">
                {(order.order_items || []).length} items · {order.order_status} ·{' '}
                {order.payment_status}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    order.table_id
                      ? navigate(`/order/${order.table_id}`)
                      : navigate('/tables')
                  }
                  className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-medium"
                >
                  View order
                </button>
                <button
                  type="button"
                  disabled={busyId === order.id}
                  onClick={() => bill(order.id)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {busyId === order.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Receipt size={14} />
                  )}
                  Bill & print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
