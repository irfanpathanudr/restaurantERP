import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface Table {
  id: string;
  name: string;
  table_number: string;
  branch_id: string;
  table_type: string;
  capacity: number;
  table_status: string;
  shape: string;
  dining_area?: string;
  branch?: {
    id: string;
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

const TablesPage: React.FC = () => {
  const dispatch = useDispatch();
  const [tables, setTables] = useState<Table[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    table_number: '',
    branch_id: '',
    table_type: '4-seater',
    capacity: '4',
    table_status: 'available',
    shape: 'square',
    dining_area: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Table Management'));
    fetchTables();
    fetchBranches();
  }, [dispatch]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/tables');
      setTables(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiService.get('/branches');
      setBranches(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const handleCreate = () => {
    setSelectedTable(null);
    setFormData({
      name: '',
      table_number: '',
      branch_id: '',
      table_type: '4-seater',
      capacity: '4',
      table_status: 'available',
      shape: 'square',
      dining_area: '',
    });
    setShowModal(true);
  };

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      table_number: table.table_number,
      branch_id: table.branch_id,
      table_type: table.table_type,
      capacity: table.capacity.toString(),
      table_status: table.table_status,
      shape: table.shape,
      dining_area: table.dining_area || '',
    });
    setShowModal(true);
  };

  const handleDelete = (table: Table) => {
    setSelectedTable(table);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend CreateTableDto / UpdateTableDto expect camelCase
      const submitData = {
        tableNumber: formData.table_number,
        name: formData.name,
        branchId: formData.branch_id,
        tableType: formData.table_type,
        capacity: parseInt(formData.capacity, 10),
        status: formData.table_status,
        shape: formData.shape,
        location: formData.dining_area || undefined,
      };

      if (selectedTable) {
        await apiService.put(`/tables/${selectedTable.id}`, submitData);
        toast.success('Table updated successfully');
      } else {
        await apiService.post('/tables', submitData);
        toast.success('Table created successfully');
      }
      setShowModal(false);
      fetchTables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedTable) return;
    try {
      await apiService.delete(`/tables/${selectedTable.id}`);
      toast.success('Table deleted successfully');
      setShowDeleteModal(false);
      fetchTables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'occupied':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'reserved':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'cleaning':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  const columns: ColumnDef<Table>[] = [
    {
      accessorKey: 'table_number',
      header: 'Table #',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.table_number}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </div>
          {row.original.dining_area && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.dining_area}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => row.original.branch?.name || '-',
    },
    {
      accessorKey: 'table_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.table_type}</span>
      ),
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }) => `${row.original.capacity} seats`,
    },
    {
      accessorKey: 'shape',
      header: 'Shape',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.shape}</span>
      ),
    },
    {
      accessorKey: 'table_status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full capitalize',
          getStatusColor(row.original.table_status)
        )}>
          {row.original.table_status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Edit className="h-4 w-4" />}
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleDelete(row.original)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Table Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage restaurant tables and seating arrangements
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Table
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tables}
        loading={loading}
        searchPlaceholder="Search tables..."
        onRefresh={fetchTables}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedTable ? 'Edit Table' : 'Create Table'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Table Number *
              </label>
              <input
                type="text"
                required
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Table Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch *
            </label>
            <select
              required
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Table Type *
              </label>
              <select
                required
                value={formData.table_type}
                onChange={(e) => setFormData({ ...formData, table_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="2-seater">2-Seater</option>
                <option value="4-seater">4-Seater</option>
                <option value="6-seater">6-Seater</option>
                <option value="8-seater">8-Seater</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shape *
              </label>
              <select
                required
                value={formData.shape}
                onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="round">Round</option>
                <option value="square">Square</option>
                <option value="rectangle">Rectangle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.table_status}
                onChange={(e) => setFormData({ ...formData, table_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dining Area
              </label>
              <input
                type="text"
                value={formData.dining_area}
                onChange={(e) => setFormData({ ...formData, dining_area: e.target.value })}
                placeholder="e.g., Main Hall, Garden"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedTable ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Table"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete table "{selectedTable?.name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TablesPage;
