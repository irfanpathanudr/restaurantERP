import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { restaurantService } from '@/services/restaurant.service';
import { Restaurant } from '@/types/entities.types';
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  gst_number: '',
  fssai_license: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
};

const RestaurantsPage = () => {
  const dispatch = useDispatch();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    dispatch(setPageTitle('Restaurants'));
    fetchRestaurants();
  }, [dispatch]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.findAll();
      setRestaurants(data || []);
    } catch {
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelected(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setSelected(restaurant);
    setFormData({
      name: restaurant.name || '',
      code: restaurant.code || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      city: restaurant.city || '',
      state: restaurant.state || '',
      country: restaurant.country || 'India',
      pincode: restaurant.pincode || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      website: restaurant.website || '',
      gst_number: restaurant.gst_number || '',
      fssai_license: restaurant.fssai_license || '',
      currency: restaurant.currency || 'INR',
      timezone: restaurant.timezone || 'Asia/Kolkata',
    });
    setShowModal(true);
  };

  const handleDelete = (restaurant: Restaurant) => {
    setSelected(restaurant);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        email: formData.email || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
        gst_number: formData.gst_number || undefined,
        fssai_license: formData.fssai_license || undefined,
      };

      if (selected) {
        await restaurantService.update(selected.id, payload);
        toast.success('Restaurant updated successfully');
      } else {
        await restaurantService.create(payload);
        toast.success('Restaurant created successfully');
      }
      setShowModal(false);
      fetchRestaurants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await restaurantService.delete(selected.id);
      toast.success('Restaurant deleted successfully');
      setShowDeleteModal(false);
      fetchRestaurants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns: ColumnDef<Restaurant>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Restaurant Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {[row.original.city, row.original.state].filter(Boolean).join(', ') || '-'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="text-sm space-y-1">
          {row.original.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {row.original.phone}
            </div>
          )}
          {row.original.email && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Mail className="h-3.5 w-3.5" />
              {row.original.email}
            </div>
          )}
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
            className="text-red-600 hover:text-red-700"
            onClick={() => handleDelete(row.original)}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Restaurants</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage restaurant locations
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />} onClick={handleCreate}>
          Add Restaurant
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={restaurants}
        loading={loading}
        searchPlaceholder="Search restaurants..."
        onRefresh={fetchRestaurants}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selected ? 'Edit Restaurant' : 'Create Restaurant'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="REST001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address *</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <input
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <input
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pincode *</label>
              <input
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">GST Number</label>
              <input
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">FSSAI License</label>
              <input
                value={formData.fssai_license}
                onChange={(e) => setFormData({ ...formData, fssai_license: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">{selected ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Restaurant"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Delete restaurant "<strong>{selected?.name}</strong>"? This cannot be undone.
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

export default RestaurantsPage;
