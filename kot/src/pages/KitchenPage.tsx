import { useCallback, useEffect, useState } from 'react';
import { Check, ChefHat, Clock, Loader2, Printer, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { changeKotStatus, getKitchens, getKots, printKot } from '@/services/kotApi';
import { useAuth } from '@/hooks/useAuth';
import { POLL_INTERVAL_MS } from '@/config/api';
import { cn, printKotTicket } from '@/utils/helpers';
import type { Kitchen, Kot } from '@/types';

const STATUS_FLOW = ['pending', 'in_progress', 'ready', 'served'] as const;

const nextLabel: Record<string, string> = {
  pending: 'Start cooking',
  in_progress: 'Mark ready',
  ready: 'Mark served',
};

const nextStatus: Record<string, string> = {
  pending: 'in_progress',
  in_progress: 'ready',
  ready: 'served',
};

const statusColor: Record<string, string> = {
  pending: 'border-amber-500/40 bg-amber-500/10',
  in_progress: 'border-sky-500/40 bg-sky-500/10',
  ready: 'border-emerald-500/40 bg-emerald-500/10',
  served: 'border-white/10 bg-white/5',
  cancelled: 'border-red-500/30 bg-red-500/10',
};

export function KitchenPage() {
  const { branchId } = useAuth();
  const [kots, setKots] = useState<Kot[]>([]);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [kitchenId, setKitchenId] = useState('');
  const [filter, setFilter] = useState<string>('active');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params: Record<string, unknown> = { branchId: branchId || undefined };
      if (kitchenId) params.kitchenId = kitchenId;
      if (filter === 'active') params.activeOnly = true;
      else if (filter !== 'all') params.status = filter;

      const list = await getKots(params as any);
      setKots(list);
    } finally {
      setLoading(false);
    }
  }, [branchId, kitchenId, filter]);

  useEffect(() => {
    getKitchens(branchId || undefined).then((k) => {
      setKitchens(k);
      // Auto-select the first (and likely only) kitchen for this branch
      if (k[0]) setKitchenId(k[0].id);
    });
  }, [branchId]);

  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  async function advance(kot: Kot) {
    const next = nextStatus[kot.kot_status];
    if (!next) return;
    setBusyId(kot.id);
    try {
      await changeKotStatus(kot.id, next);
      toast.success(`KOT → ${next.replace('_', ' ')}`);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handlePrint(kot: Kot) {
    setBusyId(kot.id);
    try {
      const result = await printKot(kot.id);
      printKotTicket(result.printPayload);
      toast.success('Print ready');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <ChefHat size={22} className="text-brand-400" />
            Kitchen board
          </h2>
          <p className="text-xs text-white/45">Auto-refreshes every {POLL_INTERVAL_MS / 1000}s</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="p-2.5 rounded-xl bg-surface-card border border-white/10"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {kitchens.length > 0 && (
        <select
          value={kitchenId}
          onChange={(e) => setKitchenId(e.target.value)}
          className="w-full mb-3 rounded-xl bg-surface-card border border-white/10 px-3 py-2.5 text-sm"
        >
          <option value="">All kitchens</option>
          {kitchens.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {['active', 'pending', 'in_progress', 'ready', 'all'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs capitalize border',
              filter === f
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'border-white/15 text-white/50'
            )}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && kots.length === 0 ? (
        <div className="flex justify-center py-16 text-white/40">
          <Loader2 className="animate-spin" />
        </div>
      ) : kots.length === 0 ? (
        <p className="text-center text-sm text-white/40 py-16">No tickets right now</p>
      ) : (
        <div className="space-y-3 pb-4">
          {kots.map((kot) => (
            <article
              key={kot.id}
              className={cn(
                'rounded-2xl border p-4',
                statusColor[kot.kot_status] || statusColor.pending
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-display font-bold text-lg">
                    T{kot.order?.table?.table_number || '—'}
                  </p>
                  <p className="text-[11px] text-white/50">{kot.kot_number}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-black/20">
                  {kot.kot_status.replace('_', ' ')}
                </span>
              </div>

              <ul className="space-y-1.5 mb-3">
                {(kot.items || []).map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="font-bold text-brand-400 w-6 shrink-0">{item.quantity}×</span>
                    <span>
                      {item.name}
                      {(item.special_instructions || item.specialInstructions) && (
                        <span className="block text-[11px] text-white/45">
                          {item.special_instructions || item.specialInstructions}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {kot.special_instructions && (
                <p className="text-xs text-amber-300/90 mb-3 flex items-start gap-1">
                  <Clock size={12} className="mt-0.5 shrink-0" />
                  {kot.special_instructions}
                </p>
              )}

              <div className="flex gap-2">
                {STATUS_FLOW.includes(kot.kot_status as any) &&
                  kot.kot_status !== 'served' && (
                    <button
                      type="button"
                      disabled={busyId === kot.id}
                      onClick={() => advance(kot)}
                      className="flex-1 rounded-xl bg-brand-500 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {busyId === kot.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      {nextLabel[kot.kot_status]}
                    </button>
                  )}
                <button
                  type="button"
                  disabled={busyId === kot.id}
                  onClick={() => handlePrint(kot)}
                  className="rounded-xl bg-black/25 px-3 py-2.5 text-white/80"
                >
                  <Printer size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
