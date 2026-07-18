import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, Users } from 'lucide-react';
import { getBranches, getTables } from '@/services/kotApi';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/helpers';
import type { Branch, Table } from '@/types';

const statusStyle: Record<string, string> = {
  available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  occupied: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
  reserved: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  cleaning: 'bg-white/10 text-white/50 border-white/15',
};

export function TablesPage() {
  const { branchId, setBranchId } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [br, tb] = await Promise.all([
        getBranches(),
        getTables(branchId || undefined),
      ]);
      const sorted = [...br].sort((a, b) => a.name.localeCompare(b.name));
      setBranches(sorted);
      setTables(tb);
      if (!branchId && sorted[0]) setBranchId(sorted[0].id);
    } finally {
      setLoading(false);
    }
  }, [branchId, setBranchId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = tables.filter((t) => {
    if (!branchId) return true;
    if (t.branch_id !== branchId) return false;
    if (filter === 'all') return true;
    return t.table_status === filter;
  });

  return (
    <div className="px-4 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold">Tables</h2>
          <p className="text-xs text-white/45">Tap a table to take or update order</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="p-2.5 rounded-xl bg-surface-card border border-white/10 text-white/70"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {branches.length > 1 && (
        <select
          value={branchId || ''}
          onChange={(e) => setBranchId(e.target.value)}
          className="w-full mb-3 rounded-xl bg-surface-card border border-white/10 px-3 py-2.5 text-sm"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-2 mb-4">
        {(['all', 'available', 'occupied'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs capitalize border',
              filter === f
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'border-white/15 text-white/50'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-white/40">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => navigate(`/order/${table.id}`)}
              className={cn(
                'rounded-2xl border p-4 text-left transition active:scale-[0.98]',
                statusStyle[table.table_status] || statusStyle.available
              )}
            >
              <p className="font-display text-2xl font-bold">{table.table_number}</p>
              <p className="text-xs opacity-80 mt-1 truncate">{table.name}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-wide">
                <span>{table.table_status}</span>
                <span className="inline-flex items-center gap-1 opacity-70">
                  <Users size={12} />
                  {table.capacity}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-2 text-center text-sm text-white/40 py-12">No tables found</p>
          )}
        </div>
      )}
    </div>
  );
}
