import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Plus, Eye, Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Payment {
  id: number;
  payment_reference: string;
  order?: { order_number: string };
  invoice?: { invoice_number: string };
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
}

const PaymentsPage = () => {
  const dispatch = useDispatch();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Payments'));
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      REFUNDED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'payment_reference',
      header: 'Reference',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.payment_reference}</span>
      ),
    },
    {
      accessorKey: 'order',
      header: 'Order/Invoice',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.order?.order_number || row.original.invoice?.invoice_number || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.payment_date).toLocaleDateString(),
    },
    {
      accessorKey: 'payment_method',
      header: 'Method',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-full">
          {row.original.payment_method}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          ${row.original.amount.toFixed(2)}
        </span>
      ),
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
          <Button size="sm" variant="ghost" leftIcon={<Eye className="h-4 w-4" />}>
            View
          </Button>
          <Button size="sm" variant="ghost" leftIcon={<Receipt className="h-4 w-4" />}>
            Receipt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track all payment transactions
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} permission="payments:create">
          Record Payment
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        searchPlaceholder="Search payments..."
      />
    </div>
  );
};

export default PaymentsPage;
