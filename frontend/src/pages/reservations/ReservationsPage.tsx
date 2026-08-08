import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { reservationService } from '@/services/reservation.service';
import { apiService } from '@/services/api.service';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Check, LogIn, Ban, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface Reservation {
  id: string;
  reservation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  reservation_status: string;
  special_requests?: string | null;
  branch_id: string;
  table_id?: string | null;
  table?: { table_number: string; name?: string } | null;
  branch?: { name: string };
}

interface BranchOption {
  id: string;
  name: string;
}

interface TableOption {
  id: string;
  table_number: string;
  table_status: string;
  capacity: number;
}

const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    no_show: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  };
  return colors[status] || colors.pending;
};

const formatStatus = (status: string) =>
  (status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ReservationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [tables, setTables] = useState<TableOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    branch_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    reservation_date: '',
    reservation_time: '',
    party_size: '2',
    table_id: '',
    special_requests: '',
  });

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reservationService.list(
        user?.branch_id ? { branchId: user.branch_id } : undefined
      );
      setReservations(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  }, [user?.branch_id]);

  useEffect(() => {
    dispatch(setPageTitle('Reservations'));
    fetchReservations();
    (async () => {
      try {
        const [bRes, tRes] = await Promise.all([
          apiService.get('/branches'),
          apiService.get('/tables'),
        ]);
        const branchList = bRes.data.data || [];
        setBranches(branchList);
        setTables(tRes.data.data || []);
        setFormData((prev) => ({
          ...prev,
          branch_id: user?.branch_id || branchList[0]?.id || '',
        }));
      } catch {
        // ignore bootstrap errors
      }
    })();
  }, [dispatch, fetchReservations, user?.branch_id]);

  const openCreate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({
      branch_id: user?.branch_id || branches[0]?.id || '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      reservation_date: tomorrow.toISOString().slice(0, 10),
      reservation_time: '19:00',
      party_size: '2',
      table_id: '',
      special_requests: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const reservationNumber = `RSV-${Date.now().toString().slice(-8)}`;
      await reservationService.create({
        reservation_number: reservationNumber,
        branch_id: formData.branch_id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || undefined,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        party_size: parseInt(formData.party_size, 10),
        table_id: formData.table_id || undefined,
        special_requests: formData.special_requests || undefined,
      });
      toast.success('Reservation created');
      setShowModal(false);
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const runAction = async (
    id: string,
    action: 'confirm' | 'cancel' | 'checkIn' | 'noShow'
  ) => {
    try {
      setActionLoading(true);
      if (action === 'confirm') await reservationService.confirm(id);
      if (action === 'cancel') {
        if (!window.confirm('Cancel this reservation?')) return;
        await reservationService.cancel(id);
      }
      if (action === 'checkIn') await reservationService.checkIn(id);
      if (action === 'noShow') await reservationService.markNoShow(id);
      toast.success('Reservation updated');
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'reservation_number',
      header: 'Ref #',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.reservation_number}</span>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.customer_name}
          </div>
          <div className="text-sm text-gray-500">{row.original.customer_phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'table',
      header: 'Table',
      cell: ({ row }) =>
        row.original.table?.table_number
          ? `Table ${row.original.table.table_number}`
          : 'Unassigned',
    },
    {
      accessorKey: 'reservation_date',
      header: 'Date',
      cell: ({ row }) =>
        new Date(row.original.reservation_date).toLocaleDateString(),
    },
    {
      accessorKey: 'reservation_time',
      header: 'Time',
      cell: ({ row }) => String(row.original.reservation_time).slice(0, 5),
    },
    {
      accessorKey: 'party_size',
      header: 'Guests',
    },
    {
      accessorKey: 'reservation_status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full capitalize',
            statusColor(row.original.reservation_status)
          )}
        >
          {formatStatus(row.original.reservation_status)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const r = row.original;
        const open = ['pending', 'confirmed'].includes(r.reservation_status);
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {r.reservation_status === 'pending' && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Check className="h-4 w-4" />}
                disabled={actionLoading}
                onClick={() => runAction(r.id, 'confirm')}
              >
                Confirm
              </Button>
            )}
            {r.reservation_status === 'confirmed' && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<LogIn className="h-4 w-4" />}
                disabled={actionLoading}
                onClick={() => runAction(r.id, 'checkIn')}
              >
                Check-in
              </Button>
            )}
            {open && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<UserX className="h-4 w-4" />}
                  disabled={actionLoading}
                  onClick={() => runAction(r.id, 'noShow')}
                >
                  No-show
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Ban className="h-4 w-4" />}
                  disabled={actionLoading}
                  onClick={() => runAction(r.id, 'cancel')}
                  className="text-red-600"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reservations
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage table reservations
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} onClick={openCreate}>
          New Reservation
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        searchPlaceholder="Search reservations..."
        onRefresh={fetchReservations}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New Reservation"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Branch *</label>
              <select
                required
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name *</label>
              <input
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                required
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.reservation_date}
                onChange={(e) =>
                  setFormData({ ...formData, reservation_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time *</label>
              <input
                type="time"
                required
                value={formData.reservation_time}
                onChange={(e) =>
                  setFormData({ ...formData, reservation_time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Party Size *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.party_size}
                onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Table</label>
              <select
                value={formData.table_id}
                onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">Unassigned</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.table_number} ({t.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Special Requests</label>
              <textarea
                rows={2}
                value={formData.special_requests}
                onChange={(e) =>
                  setFormData({ ...formData, special_requests: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReservationsPage;
