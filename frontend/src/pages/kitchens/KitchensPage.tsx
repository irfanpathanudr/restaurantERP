import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { kitchenService } from '@/services/kitchen.service';
import { branchService } from '@/services/branch.service';
import { Kitchen, Branch } from '@/types/entities.types';
import { Plus, Edit, Trash2, ChefHat, Building2, Printer, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const KitchensPage: React.FC = () => {
  const dispatch = useDispatch();
  
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    branch_id: '',
    location: '',
    manager_id: '',
    printer_ip: '',
    printer_port: '',
    sort_order: '0',
  });

  useEffect(() => {
    dispatch(setPageTitle('Kitchen Management'));
    fetchKitchens();
    fetchBranches();
  }, [dispatch]);

  const fetchKitchens = async () => {
    try {
      setLoading(true);
      const data = await kitchenService.findAll();
      setKitchens(data || []);
    } catch (error) {
      toast.error('Failed to fetch kitchens');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchService.findAll();
      setBranches(data || []);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const handleCreate = () => {
    setSelectedKitchen(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      branch_id: '',
      location: '',
      manager_id: '',
      printer_ip: '',
      printer_port: '',
      sort_order: '0',
    });
    setShowModal(true);
  };

  const handleEdit = (kitchen: Kitchen) => {
    setSelectedKitchen(kitchen);
    setFormData({
      name: kitchen.name,
      code: kitchen.code,
      description: kitchen.description || '',
      branch_id: kitchen.branch_id,
      location: kitchen.location || '',
      manager_id: kitchen.manager_id || '',
      printer_ip: kitchen.printer_ip || '',
      printer_port: kitchen.printer_port?.toString() || '',
      sort_order: kitchen.sort_order?.toString() || '0',
    });
    setShowModal(true);
  };

  const handleDelete = (kitchen: Kitchen) => {
    setSelectedKitchen(kitchen);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        name: formData.name,
        code: formData.code,
        branch_id: formData.branch_id,
        description: formData.description || null,
        location: formData.location || null,
        manager_id: formData.manager_id || null,
        printer_ip: formData.printer_ip || null,
        printer_port: formData.printer_port ? parseInt(formData.printer_port) : null,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (selectedKitchen) {
        await kitchenService.update(selectedKitchen.id, submitData);
        toast.success('Kitchen updated successfully');
      } else {
        await kitchenService.create(submitData);
        toast.success('Kitchen created successfully');
      }
      setShowModal(false);
      fetchKitchens();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedKitchen) return;
    try {
      await kitchenService.delete(selectedKitchen.id);
      toast.success('Kitchen deleted successfully');
      setShowDeleteModal(false);
      fetchKitchens();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns: ColumnDef<Kitchen>[] = [
    {
      accessorKey: 'name',
      header: 'Kitchen',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-orange-500" />
            {row.original.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Code: {row.original.code}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span>{row.original.branch?.name || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.location ? (
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5" />
          {row.original.location}
        </div>
      ) : '-',
    },
    {
      accessorKey: 'printer',
      header: 'Printer',
      cell: ({ row }) => row.original.printer_ip ? (
        <div className="flex items-center gap-1.5 text-sm">
          <Printer className="h-3.5 w-3.5 text-purple-500" />
          <div>
            <div className="text-gray-900 dark:text-gray-100">{row.original.printer_ip}</div>
            {row.original.printer_port && (
              <div className="text-xs text-gray-500">Port: {row.original.printer_port}</div>
            )}
          </div>
        </div>
      ) : '-',
    },
    {
      accessorKey: 'sort_order',
      header: 'Order',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded">
          {row.original.sort_order || 0}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          row.original.is_active
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
        )}>
          {row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
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
            Kitchen Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage restaurant kitchens and KOT routing
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Kitchen
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={kitchens}
        loading={loading}
        searchPlaceholder="Search kitchens..."
        onRefresh={fetchKitchens}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedKitchen ? 'Edit Kitchen' : 'Create Kitchen'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kitchen Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Main Kitchen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kitchen Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="MAIN-KIT"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Kitchen description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Ground Floor, Section A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="0"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Printer Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Printer IP Address
                </label>
                <input
                  type="text"
                  value={formData.printer_ip}
                  onChange={(e) => setFormData({ ...formData, printer_ip: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Printer Port
                </label>
                <input
                  type="number"
                  value={formData.printer_port}
                  onChange={(e) => setFormData({ ...formData, printer_port: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="9100"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Configure printer for automatic KOT printing
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedKitchen ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Kitchen"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete kitchen "<strong>{selectedKitchen?.name}</strong>"? This action cannot be undone and may affect order routing.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default KitchensPage;
