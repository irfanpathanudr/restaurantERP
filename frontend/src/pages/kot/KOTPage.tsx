import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/slices/uiSlice';
import { kotService } from '@/services/kot.service';
import { apiService } from '@/services/api.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import {
  RefreshCw,
  ChefHat,
  Clock,
  CheckCircle2,
  Play,
  Printer,
  XCircle,
  Bluetooth,
  BluetoothOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import {
  connectPrinter,
  disconnectPrinter,
  printKotBluetooth,
  printKotFallback,
} from '@/utils/escpos';

interface KotItem {
  menu_item_id?: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  special_instructions?: string | null;
  specialInstructions?: string | null;
}

interface KotCard {
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
  order?: {
    id: string;
    order_number: string;
    table?: { table_number: string; name?: string } | null;
  };
  kitchen?: { id: string; name: string; code?: string };
}

interface KitchenOption {
  id: string;
  name: string;
  code?: string;
}

const STATUS_COLUMNS: { id: KotCard['kot_status']; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending', color: 'border-yellow-500' },
  { id: 'in_progress', label: 'Preparing', color: 'border-blue-500' },
  { id: 'ready', label: 'Ready', color: 'border-green-500' },
];

const formatStatus = (status: string) =>
  (status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const elapsed = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const KOTPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [kots, setKots] = useState<KotCard[]>([]);
  const [kitchens, setKitchens] = useState<KitchenOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [kitchenFilter, setKitchenFilter] = useState('all');
  const [showServed, setShowServed] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [btStatus, setBtStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [btName, setBtName] = useState<string | null>(null);

  const isBluetoothAvailable = typeof navigator !== 'undefined' && !!navigator.bluetooth;

  const connectBt = async () => {
    setBtStatus('connecting');
    try {
      await connectPrinter();
      setBtStatus('connected');
      setBtName('Printer Connected');
      toast.success('Bluetooth printer connected');
    } catch (err: any) {
      setBtStatus('error');
      toast.error(err?.message || 'Bluetooth connection failed');
    }
  };

  const fetchKots = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (!showServed) params.activeOnly = true;
      if (kitchenFilter !== 'all') params.kitchenId = kitchenFilter;
      if (user?.branch_id) params.branchId = user.branch_id;
      const data = await kotService.list(params);
      setKots(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch KOTs');
    } finally {
      setLoading(false);
    }
  }, [kitchenFilter, showServed, user?.branch_id]);

  const fetchKitchens = async () => {
    try {
      const response = await apiService.get('/kitchens', {
        params: user?.branch_id ? { branchId: user.branch_id } : undefined,
      });
      setKitchens(response.data.data || []);
    } catch {
      // optional filter source
    }
  };

  useEffect(() => {
    dispatch(setPageTitle('Kitchen Orders (KOT)'));
    fetchKitchens();
  }, [dispatch]);

  useEffect(() => {
    fetchKots();
    const timer = setInterval(fetchKots, 10000);
    return () => clearInterval(timer);
  }, [fetchKots]);

  const changeStatus = async (id: string, status: string) => {
    try {
      setActionId(id);
      await kotService.updateStatus(id, status);
      toast.success(`KOT marked as ${formatStatus(status)}`);
      fetchKots();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update KOT');
    } finally {
      setActionId(null);
    }
  };

  const handlePrint = async (id: string) => {
    try {
      setActionId(id);
      const result = await kotService.print(id);
      const payload = result?.printPayload;
      if (payload) {
        // Try Bluetooth ESC/POS first, fall back to browser print
        if (isBluetoothAvailable) {
          try {
            await printKotBluetooth(payload);
            setBtStatus('connected');
          } catch (btErr: any) {
            setBtStatus('error');
            printKotFallback(payload); // fallback
          }
        } else {
          printKotFallback(payload);
        }
        toast.success(
          `Printed ${payload.kotNumber} (Table ${payload.tableNumber}) — print #${payload.printCount}`
        );
      } else {
        toast.success('KOT sent to printer');
      }
      fetchKots();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Print failed');
    } finally {
      setActionId(null);
    }
  };

  const columnsData = STATUS_COLUMNS.map((col) => ({
    ...col,
    items: kots.filter((k) => k.kot_status === col.id),
  }));

  const completedKots = kots.filter((k) =>
    ['served', 'cancelled'].includes(k.kot_status)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ChefHat className="h-7 w-7" />
            Kitchen Order Tickets
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live kitchen queue from waiter / POS orders — auto-refreshes every 10s
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Bluetooth printer button */}
          {isBluetoothAvailable && (
            <Button
              variant="outline"
              onClick={btStatus === 'connected' ? () => { disconnectPrinter(); setBtStatus('disconnected'); setBtName(null); } : connectBt}
              leftIcon={btStatus === 'connected' ? <Bluetooth className="h-4 w-4 text-green-500" /> : <BluetoothOff className="h-4 w-4" />}
              className={btStatus === 'connected' ? 'border-green-500 text-green-600 dark:text-green-400' : btStatus === 'error' ? 'border-red-400 text-red-500' : ''}
            >
              {btStatus === 'connecting' ? 'Connecting...' : btStatus === 'connected' ? (btName || 'Printer ON') : 'Connect Printer'}
            </Button>
          )}
          <Button
            variant="outline"
            leftIcon={<RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />}
            onClick={fetchKots}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={kitchenFilter}
          onChange={(e) => setKitchenFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="all">All Kitchens</option>
          {kitchens.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={showServed}
            onChange={(e) => setShowServed(e.target.checked)}
            className="rounded"
          />
          Show served / cancelled
        </label>
        <span className="text-sm text-gray-500">
          {kots.filter((k) => !['served', 'cancelled'].includes(k.kot_status)).length} active
        </span>
      </div>

      {loading && kots.length === 0 ? (
        <div className="py-20 text-center text-gray-500">Loading kitchen tickets...</div>
      ) : columnsData.every((c) => c.items.length === 0) && !showServed ? (
        <div className="py-20 text-center">
          <ChefHat className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No active kitchen tickets</p>
          <p className="text-sm text-gray-400 mt-1">
            New tickets appear here when orders are created from KOT / POS
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columnsData.map((column) => (
            <div key={column.id} className="space-y-3">
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg border-l-4 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm',
                  column.color
                )}
              >
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {column.label}
                </h2>
                <span className="text-sm font-medium text-gray-500">
                  {column.items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {column.items.map((kot) => (
                  <div
                    key={kot.id}
                    className="rounded-lg bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono font-bold text-gray-900 dark:text-gray-100">
                          {kot.kot_number}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {kot.order?.table?.table_number
                            ? `Table ${kot.order.table.table_number}`
                            : kot.order?.order_number || 'Order'}
                          {kot.kitchen?.name ? ` · ${kot.kitchen.name}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        {elapsed(kot.created_at)}
                      </div>
                    </div>

                    <div className="px-4 py-3 space-y-2">
                      {(kot.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between gap-2 text-sm">
                          <span className="text-gray-800 dark:text-gray-200">
                            <span className="font-semibold">{item.quantity}×</span>{' '}
                            {item.name}
                            {(item.special_instructions || item.specialInstructions) && (
                              <span className="block text-xs text-amber-600 dark:text-amber-400">
                                {item.special_instructions || item.specialInstructions}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                      {kot.special_instructions && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                          {kot.special_instructions}
                        </p>
                      )}
                    </div>

                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap gap-2">
                      {kot.kot_status === 'pending' && (
                        <Button
                          size="sm"
                          leftIcon={<Play className="h-3.5 w-3.5" />}
                          disabled={actionId === kot.id}
                          onClick={() => changeStatus(kot.id, 'preparing')}
                        >
                          Start
                        </Button>
                      )}
                      {kot.kot_status === 'in_progress' && (
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          disabled={actionId === kot.id}
                          onClick={() => changeStatus(kot.id, 'ready')}
                        >
                          Mark Ready
                        </Button>
                      )}
                      {kot.kot_status === 'ready' && (
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          disabled={actionId === kot.id}
                          onClick={() => changeStatus(kot.id, 'served')}
                        >
                          Mark Served
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Printer className="h-3.5 w-3.5" />}
                        disabled={actionId === kot.id}
                        onClick={() => handlePrint(kot.id)}
                      >
                        Print{kot.print_count > 0 ? ` (${kot.print_count})` : ''}
                      </Button>
                      {kot.kot_status !== 'cancelled' && kot.kot_status !== 'served' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<XCircle className="h-3.5 w-3.5" />}
                          disabled={actionId === kot.id}
                          onClick={() => changeStatus(kot.id, 'cancelled')}
                          className="text-red-600"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {column.items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-400">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showServed && completedKots.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Served / Cancelled
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {completedKots.map((kot) => (
              <div
                key={kot.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 opacity-75"
              >
                <div className="flex justify-between">
                  <span className="font-mono font-medium">{kot.kot_number}</span>
                  <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                    {formatStatus(kot.kot_status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {kot.order?.table?.table_number
                    ? `Table ${kot.order.table.table_number}`
                    : kot.order?.order_number}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KOTPage;
