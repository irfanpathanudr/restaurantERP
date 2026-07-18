import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Expense {
  id: number;
  expense_number: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  vendor?: { name: string };
}

const ExpensesPage = () => {
  const dispatch = useDispatch();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Expenses'));
  }, [dispatch]);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'expense_number',
      header: 'Expense #',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.expense_number}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => row.original.vendor?.name || '-',
    },
    {
      accessorKey: 'expense_date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.expense_date).toLocaleDateString(),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-red-600 dark:text-red-400">
          ${Number(row.original.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_method',
      header: 'Payment',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
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
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage business expenses
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} permission="expenses:create">
          Add Expense
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        searchPlaceholder="Search expenses..."
      />
    </div>
  );
};

export default ExpensesPage;
