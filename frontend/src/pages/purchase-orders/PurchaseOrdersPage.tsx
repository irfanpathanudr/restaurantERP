import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Plus, Edit, Eye, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor: { name: string };
  order_date: string;
  expected_delivery_date: string;
  status: string;
  total_amount: number;
}

const PurchaseOrdersPage = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Purchase Orders'));
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400',
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      APPROVED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      RECEIVED: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'po_number',
      header: 'PO Number',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.po_number}</span>
      ),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => row.original.vendor.name,
    },
    {
      accessorKey: 'order_date',
      header: 'Order Date',
      cell: ({ row }) => new Date(row.original.order_date).toLocaleDateString(),
    },
    {
      accessorKey: 'expected_delivery_date',
      header: 'Expected Delivery',
      cell: ({ row }) => new Date(row.original.expected_delivery_date).toLocaleDateString(),
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
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <span className="font-medium">${row.original.total_amount.toFixed(2)}</span>
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
          <Button size="sm" variant="ghost" leftIcon={<Edit className="h-4 w-4" />}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Purchase Orders</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage purchase orders from vendors
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} permission="purchase_orders:create">
          New Purchase Order
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchPlaceholder="Search purchase orders..."
      />
    </div>
  );
};

export default PurchaseOrdersPage;
