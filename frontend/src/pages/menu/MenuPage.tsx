import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { menuService } from '@/services/menu.service';
import { API_CONFIG } from '@/config/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Download, Upload, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface MenuItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number | string;
  cost_price: number | string;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergens?: string | string[];
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost_price: '',
    category_id: '',
    image: '',
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
      image: '',
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
      description: item.description || '',
      price: String(item.price ?? ''),
      cost_price: item.cost_price != null ? String(item.cost_price) : '',
      category_id: item.category_id,
      image: item.image || '',
      preparation_time: item.preparation_time != null ? String(item.preparation_time) : '',
      is_vegetarian: Boolean(item.is_vegetarian),
      is_vegan: Boolean(item.is_vegan),
      allergens: Array.isArray(item.allergens)
        ? item.allergens.join(', ')
        : item.allergens || '',
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
        image: formData.image || undefined,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setImageUploading(true);
      const result = await menuService.uploadImage(file);
      // Store the server path (not full URL)
      setFormData(prev => ({ ...prev, image: result.imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleExportTemplate = async () => {
    try {
      const blob = await menuService.exportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-template-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    }
  };

  const handleExportMenus = async () => {
    try {
      const blob = await menuService.exportMenus();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-items-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Menu items exported successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setImporting(true);
      const result = await menuService.importMenus(importFile);
      
      const successCount = result.success.length;
      const failedCount = result.failed.length;

      if (failedCount === 0) {
        toast.success(`All ${successCount} menu items imported successfully!`);
      } else {
        toast.success(`${successCount} items imported, ${failedCount} failed`);
        console.log('Import failures:', result.failed);
      }

      setShowImportModal(false);
      setImportFile(null);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnDef<MenuItem>[] = [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => {
        const imageUrl = row.original.image || row.original.image_url;
        const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${API_CONFIG.SERVER_URL}${imageUrl}`) : '';
        
        return (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {fullImageUrl ? (
              <img
                src={fullImageUrl}
                alt={row.original.name}
                className="w-full h-full object-cover"
                onLoad={() => console.log('List image loaded:', fullImageUrl)}
                onError={(e) => {
                  console.error('List image failed:', fullImageUrl);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span class="text-xs">No image</span></div>';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xs">No image</span>
              </div>
            )}
          </div>
        );
      },
    },
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
        <span className="font-medium">
          ₹{Number(row.original.price || 0).toFixed(2)}
        </span>
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
        <div className="flex gap-2">
          <Button
            variant="ghost"
            leftIcon={<Download className="h-5 w-5" />}
            onClick={handleExportTemplate}
          >
            Download Template
          </Button>
          <Button
            variant="ghost"
            leftIcon={<FileSpreadsheet className="h-5 w-5" />}
            onClick={handleExportMenus}
          >
            Export Menu
          </Button>
          <Button
            variant="ghost"
            leftIcon={<Upload className="h-5 w-5" />}
            onClick={handleImportClick}
          >
            Import Menu
          </Button>
          <Button
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={handleCreate}
          >
            Add Menu Item
          </Button>
        </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Menu Item Image
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<ImageIcon className="h-4 w-4" />}
                onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
              >
                {imageUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
              {formData.image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, image: '' })}
                >
                  Remove Image
                </Button>
              )}
            </div>
            {formData.image && (
              <div className="mt-3">
                <img
                  src={formData.image.startsWith('http') ? formData.image : `${API_CONFIG.SERVER_URL}${formData.image}`}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  onError={(e) => {
                    console.error('Failed to load image:', formData.image);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                  onLoad={() => console.log('Image loaded successfully:', formData.image)}
                />
                <p className="text-xs text-gray-500 mt-1">Image preview</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (₹) *
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
                Cost Price (₹)
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

      {/* Import Modal */}
      <Modal
        open={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
        }}
        title="Import Menu Items"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Import Instructions
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Download the template file first to see the required format</li>
              <li>Fill in your menu items following the template structure</li>
              <li>Make sure category names match existing categories</li>
              <li>Upload the completed Excel file (.xlsx, .xls, or .csv)</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                Choose File
              </Button>
              {importFile && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {importFile.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
              }}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImportSubmit}
              disabled={!importFile || importing}
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuPage;
