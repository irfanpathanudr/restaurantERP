import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { Plus, Edit, Trash2, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

interface Kitchen {
  id: string;
  name: string;
  code: string;
  description?: string;
  branch_id: string;
  location?: string;
  branch?: {
    id: string;
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

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
  });

  useEffect(() => {
    dispatch(setPageTitle('Kitchens'));
    fetchKitchens();
    fetchBranches();
  }, [dispatch]);

  const fetchKitchens = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/kitchens');
      setKitchens(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch kitchens');
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
    setSelectedKitchen(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      branch_id: '',
      location: '',
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
      const submitData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        branch_id: formData.branch_id,
        location: formData.location || undefined,
      };

      if (selectedKitchen) {
        await apiService.put(`/kitchens/${selectedKitchen.id}`, submitData);
        toast.success('Kitchen updated successfully');
      } else {
        await apiService.post('/kitchens', submitData);
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
      await apiService.delete(`/kitchens/${selectedKitchen.id}`);
      toast.success('Kitchen deleted successfully');
      setShowDeleteModal(false);
      fetchKitchens();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns: ColumnDef<Kitchen>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
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
          {row.original.location && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.location}
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
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kitchens</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage kitchen stations
          </p>
        </div>
        <Button 
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Kitchen
        </Button>
      </div>

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
                Kitchen Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              />
            </div>
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
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Ground Floor, Main Kitchen"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
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
          Are you sure you want to delete "{selectedKitchen?.name}"? This action cannot be undone.
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

export default KitchensPage;
