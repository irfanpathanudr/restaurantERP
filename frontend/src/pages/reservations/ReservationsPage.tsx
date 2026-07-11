import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface Reservation {
  id: number;
  customer: { name: string };
  table: { table_number: string };
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status: string;
  special_requests?: string;
}

const ReservationsPage = () => {
  const dispatch = useDispatch();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Reservations'));
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      CONFIRMED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      NO_SHOW: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.customer.name}</div>
      ),
    },
    {
      accessorKey: 'table',
      header: 'Table',
      cell: ({ row }) => row.original.table.table_number,
    },
    {
      accessorKey: 'reservation_date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.reservation_date).toLocaleDateString(),
    },
    {
      accessorKey: 'reservation_time',
      header: 'Time',
    },
    {
      accessorKey: 'guest_count',
      header: 'Guests',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(row.original.status))}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" leftIcon={<Edit className="h-4 w-4" />}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700"
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reservations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage table reservations
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} permission="reservations:create">
          New Reservation
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        searchPlaceholder="Search reservations..."
      />
    </div>
  );
};

export default ReservationsPage;
