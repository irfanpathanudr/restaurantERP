import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Plus, Edit, Trash2, ChefHat } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Kitchen {
  id: number;
  name: string;
  kitchen_code: string;
  branch: { name: string };
  kitchen_type: string;
  is_active: boolean;
}

const KitchensPage = () => {
  const dispatch = useDispatch();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Kitchens'));
  }, [dispatch]);

  const columns: ColumnDef<Kitchen>[] = [
    {
      accessorKey: 'kitchen_code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.kitchen_code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Kitchen Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            {row.original.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.branch.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'kitchen_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
          {row.original.kitchen_type}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            row.original.is_active
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          )}
        >
          {row.original.is_active ? 'Active' : 'Inactive'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kitchens</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage kitchen stations
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} permission="kitchens:create">
          Add Kitchen
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={kitchens}
        loading={loading}
        searchPlaceholder="Search kitchens..."
      />
    </div>
  );
};

export default KitchensPage;
