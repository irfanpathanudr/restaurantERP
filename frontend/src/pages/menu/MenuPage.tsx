import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface MenuItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost_price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergens?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

const MenuPage: React.FC = () => {
  const dispatch = useDispatch();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost_price: '',
    category_id: '',
    preparation_time: '',
    is_vegetarian: false,
    is_vegan: false,
    allergens: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Menu Items'));
    fetchMenuItems();
    fetchCategories();
  }, [dispatch]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/menu-items');
      setMenuItems(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      price: '',
      cost_price: '',
      category_id: '',
      preparation_time: '',
      is_vegetarian: false,
      is_vegan: false,
      allergens: '',
    });
    setShowModal(true);
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      description: item.description,
      price: item.price.toString(),
      cost_price: item.cost_price?.toString() || '',
      category_id: item.category_id,
      preparation_time: item.preparation_time?.toString() || '',
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      allergens: item.allergens || '',
    });
    setShowModal(true);
  };

  const handleDelete = (item: MenuItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await apiService.patch(`/menu-items/${item.id}/toggle-availability`);
      toast.success(`${item.name} is now ${item.is_available ? 'unavailable' : 'available'}`);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        category_id: formData.category_id,
        preparation_time: formData.preparation_time ? parseInt(formData.preparation_time) : undefined,
        is_vegetarian: formData.is_vegetarian,
        is_vegan: formData.is_vegan,
        allergens: formData.allergens || undefined,
      };

      if (selectedItem) {
        await apiService.put(`/menu-items/${selectedItem.id}`, submitData);
        toast.success('Menu item updated successfully');
      } else {
        await apiService.post('/menu-items', submitData);
        toast.success('Menu item created successfully');
      }
      setShowModal(false);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await apiService.delete(`/menu-items/${selectedItem.id}`);
      toast.success('Menu item deleted successfully');
      setShowDeleteModal(false);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.sku}</span>
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
            {row.original.category?.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <span className="font-medium">${row.original.price.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'preparation_time',
      header: 'Prep Time',
      cell: ({ row }) => 
        row.original.preparation_time ? `${row.original.preparation_time} min` : '-',
    },
    {
      accessorKey: 'is_vegetarian',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.is_vegan && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              Vegan
            </span>
          )}
          {row.original.is_vegetarian && !row.original.is_vegan && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              Veg
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'is_available',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          row.original.is_available
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
        )}>
          {row.original.is_available ? 'Available' : 'Unavailable'}
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
            leftIcon={row.original.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            onClick={() => handleToggleAvailability(row.original)}
          >
            {row.original.is_available ? 'Hide' : 'Show'}
          </Button>
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
            Menu Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage menu items and categories
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Menu Item
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={menuItems}
        loading={loading}
        searchPlaceholder="Search menu items..."
        onRefresh={fetchMenuItems}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedItem ? 'Edit Menu Item' : 'Create Menu Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Name *
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
                SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              />
            </div>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prep Time (min)
              </label>
              <input
                type="number"
                value={formData.preparation_time}
                onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_vegetarian}
                onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_vegan}
                onChange={(e) => setFormData({ ...formData, is_vegan: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Vegan</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Allergens
            </label>
            <input
              type="text"
              value={formData.allergens}
              onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
              placeholder="e.g., Nuts, Dairy, Gluten"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Menu Item"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
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

export default MenuPage;
