import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Activity, Eye } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  user: { first_name: string; last_name: string };
  ip_address: string;
  created_at: string;
}

const AuditLogsPage = () => {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle('Audit Logs'));
  }, [dispatch]);

  const getActionColor = (action: string) => {
    const colors = {
      CREATE: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      UPDATE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      LOGIN: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      LOGOUT: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400',
    };
    return colors[action as keyof typeof colors] || colors.UPDATE;
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{new Date(row.original.created_at).toLocaleDateString()}</div>
          <div className="text-gray-500 dark:text-gray-400">
            {new Date(row.original.created_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.user.first_name} {row.original.user.last_name}
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getActionColor(row.original.action))}>
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: 'entity_type',
      header: 'Entity',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.entity_type}</div>
          <div className="text-gray-500 dark:text-gray-400">ID: {row.original.entity_id}</div>
        </div>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.ip_address}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" leftIcon={<Eye className="h-4 w-4" />}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Activity className="h-7 w-7" />
            Audit Logs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track all system activities and changes
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit logs..."
      />
    </div>
  );
};

export default AuditLogsPage;
