import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { vendorService } from '@/services/vendor.service';
import { Vendor } from '@/types/entities.types';
import { CreateVendorDto } from '@/types/dto.types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const VendorsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<CreateVendorDto>({
    name: '',
    vendor_code: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    contact_person: '',
    payment_term: 'NET_30',
    notes: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Vendors'));
    fetchVendors();
  }, [dispatch]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorService.list();
      setVendors(response.items || []);
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedVendor(null);
    setFormData({
      name: '',
      vendor_code: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      contact_person: '',
      payment_term: 'NET_30',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      vendor_code: vendor.vendor_code,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zip_code: vendor.zip_code,
      contact_person: vendor.contact_person,
      payment_term: vendor.payment_term,
      notes: vendor.notes,
    });
    setShowModal(true);
  };

  const handleDelete = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedVendor) {
        await vendorService.update(selectedVendor.id, formData);
        toast.success('Vendor updated successfully');
      } else {
        await vendorService.create(formData);
        toast.success('Vendor created successfully');
      }
      setShowModal(false);
      fetchVendors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedVendor) return;
    try {
      await vendorService.delete(selectedVendor.id);
      toast.success('Vendor deleted successfully');
      setShowDeleteModal(false);
      fetchVendors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: 'vendor_code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.vendor_code}</span>
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
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.contact_person}
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
      accessorKey: 'payment_term',
      header: 'Payment Term',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
          {row.original.payment_term.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < (row.original.rating || 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'current_balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span className={cn(
          'font-medium',
          row.original.current_balance > 0
            ? 'text-red-600 dark:text-red-400'
            : 'text-green-600 dark:text-green-400'
        )}>
          ${Number(row.original.current_balance || 0).toFixed(2)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <PermissionGuard permission="vendors:update">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="vendors:delete">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => handleDelete(row.original)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </Button>
          </PermissionGuard>
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
            Vendors
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your vendors and suppliers
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
          permission="vendors:create"
        >
          Add Vendor
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={vendors}
        loading={loading}
        searchPlaceholder="Search vendors..."
        onRefresh={fetchVendors}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedVendor ? 'Edit Vendor' : 'Create Vendor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vendor Name *
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
                Vendor Code *
              </label>
              <input
                type="text"
                required
                value={formData.vendor_code}
                onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
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
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Term
            </label>
            <select
              value={formData.payment_term}
              onChange={(e) => setFormData({ ...formData, payment_term: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="CASH">Cash</option>
              <option value="CREDIT">Credit</option>
              <option value="NET_7">Net 7</option>
              <option value="NET_15">Net 15</option>
              <option value="NET_30">Net 30</option>
              <option value="NET_60">Net 60</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedVendor ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Vendor"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete vendor "{selectedVendor?.name}"? This action cannot be undone.
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

export default VendorsPage;
