import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { Plus, Edit, Trash2, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
  code: string;
  restaurant_id: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  restaurant?: {
    id: string;
    name: string;
  };
}

interface Restaurant {
  id: string;
  name: string;
}

const BranchesPage: React.FC = () => {
  const dispatch = useDispatch();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    restaurant_id: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Branches'));
    fetchBranches();
    fetchRestaurants();
  }, [dispatch]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/branches');
      setBranches(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await apiService.get('/restaurants');
      setRestaurants(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    }
  };

  const handleCreate = () => {
    setSelectedBranch(null);
    setFormData({
      name: '',
      code: '',
      restaurant_id: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
    });
    setShowModal(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      restaurant_id: branch.restaurant_id,
      phone: branch.phone,
      email: branch.email || '',
      address: branch.address,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      pincode: branch.pincode,
    });
    setShowModal(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name,
        code: formData.code,
        restaurant_id: formData.restaurant_id,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      };

      if (selectedBranch) {
        await apiService.put(`/branches/${selectedBranch.id}`, submitData);
        toast.success('Branch updated successfully');
      } else {
        await apiService.post('/branches', submitData);
        toast.success('Branch created successfully');
      }
      setShowModal(false);
      fetchBranches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedBranch) return;
    try {
      await apiService.delete(`/branches/${selectedBranch.id}`);
      toast.success('Branch deleted successfully');
      setShowDeleteModal(false);
      fetchBranches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
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
            {row.original.restaurant?.name || '-'}
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
          {row.original.email && (
            <div className="text-gray-500 dark:text-gray-400">{row.original.email}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          {row.original.city}, {row.original.state}
        </div>
      ),
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Branches</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage restaurant branches
          </p>
        </div>
        <Button 
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Branch
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        loading={loading}
        searchPlaceholder="Search branches..."
        onRefresh={fetchBranches}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedBranch ? 'Edit Branch' : 'Create Branch'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Code *
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
                Branch Name *
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
              Restaurant *
            </label>
            <select
              required
              value={formData.restaurant_id}
              onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address *
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedBranch ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Branch"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{selectedBranch?.name}"? This action cannot be undone.
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

export default BranchesPage;
