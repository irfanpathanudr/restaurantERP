import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Plus, Edit, Trash2, MapPin, Building } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Branch {
  id: number;
  name: string;
  branch_code: string;
  restaurant: { name: string };
  phone: string;
  email: string;
  address: string;
  city: string;
  is_active: boolean;
}

const BranchesPage = () => {
  const dispatch = useDispatch();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Branches'));
  }, [dispatch]);

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: 'branch_code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.branch_code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Branch Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Building className="h-3 w-3" />
            {row.original.restaurant.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.phone}</div>
          <div className="text-gray-500 dark:text-gray-400">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          {row.original.city}
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Branches</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage restaurant branches
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} permission="branches:create">
          Add Branch
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        loading={loading}
        searchPlaceholder="Search branches..."
      />
    </div>
  );
};

export default BranchesPage;
