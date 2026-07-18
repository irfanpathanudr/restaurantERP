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

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  membership_tier?: string;
  loyalty_points: number;
  wallet_balance: number;
  total_visits: number;
  lifetime_value: number;
}

const CustomersPage: React.FC = () => {
  const dispatch = useDispatch();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    membership_tier: '',
    loyalty_points: '0',
    wallet_balance: '0',
  });

  useEffect(() => {
    dispatch(setPageTitle('Customer Management'));
    fetchCustomers();
  }, [dispatch]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/customers');
      setCustomers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      membership_tier: '',
      loyalty_points: '0',
      wallet_balance: '0',
    });
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      membership_tier: customer.membership_tier || '',
      loyalty_points: customer.loyalty_points.toString(),
      wallet_balance: customer.wallet_balance.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
        membership_tier: formData.membership_tier || undefined,
        loyalty_points: parseInt(formData.loyalty_points),
        wallet_balance: parseFloat(formData.wallet_balance),
      };

      if (selectedCustomer) {
        await apiService.put(`/customers/${selectedCustomer.id}`, submitData);
        toast.success('Customer updated successfully');
      } else {
        await apiService.post('/customers', submitData);
        toast.success('Customer created successfully');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await apiService.delete(`/customers/${selectedCustomer.id}`);
      toast.success('Customer deleted successfully');
      setShowDeleteModal(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'gold':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'silver':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'city',
      header: 'Location',
      cell: ({ row }) => {
        const parts = [row.original.city, row.original.state].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '-';
      },
    },
    {
      accessorKey: 'membership_tier',
      header: 'Tier',
      cell: ({ row }) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full capitalize',
          getTierColor(row.original.membership_tier)
        )}>
          {row.original.membership_tier || 'Regular'}
        </span>
      ),
    },
    {
      accessorKey: 'loyalty_points',
      header: 'Points',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.loyalty_points}</span>
      ),
    },
    {
      accessorKey: 'wallet_balance',
      header: 'Wallet',
      cell: ({ row }) => (
        <span className="font-medium">${row.original.wallet_balance.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'total_visits',
      header: 'Visits',
      cell: ({ row }) => row.original.total_visits,
    },
    {
      accessorKey: 'lifetime_value',
      header: 'Lifetime Value',
      cell: ({ row }) => (
        <span className="font-medium">${row.original.lifetime_value.toFixed(2)}</span>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage customer information and loyalty programs
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Customer
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchPlaceholder="Search customers..."
        onRefresh={fetchCustomers}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Create Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Membership Tier
              </label>
              <select
                value={formData.membership_tier}
                onChange={(e) => setFormData({ ...formData, membership_tier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Regular</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loyalty Points
              </label>
              <input
                type="number"
                min="0"
                value={formData.loyalty_points}
                onChange={(e) => setFormData({ ...formData, loyalty_points: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wallet Balance
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.wallet_balance}
                onChange={(e) => setFormData({ ...formData, wallet_balance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{selectedCustomer?.name}"? This action cannot be undone.
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

export default CustomersPage;
