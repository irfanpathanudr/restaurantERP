import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { apiService } from '@/services/api.service';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface RawMaterial {
  id: string;
  name: string;
  code: string;
  description?: string;
  material_type: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
  minimum_stock: number;
  reorder_level: number;
  maximum_stock: number;
  category_id?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

const InventoryPage: React.FC = () => {
  const dispatch = useDispatch();
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    material_type: 'raw_material',
    unit: 'kg',
    cost_per_unit: '',
    current_stock: '',
    minimum_stock: '',
    reorder_level: '',
    maximum_stock: '',
    category_id: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Inventory Management'));
    fetchMaterials();
    fetchCategories();
  }, [dispatch]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/inventory/raw-materials');
      setMaterials(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch inventory');
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
    setSelectedMaterial(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      material_type: 'raw_material',
      unit: 'kg',
      cost_per_unit: '',
      current_stock: '',
      minimum_stock: '',
      reorder_level: '',
      maximum_stock: '',
      category_id: '',
    });
    setShowModal(true);
  };

  const handleEdit = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      code: material.code,
      description: material.description || '',
      material_type: material.material_type,
      unit: material.unit,
      cost_per_unit: material.cost_per_unit.toString(),
      current_stock: material.current_stock.toString(),
      minimum_stock: material.minimum_stock.toString(),
      reorder_level: material.reorder_level.toString(),
      maximum_stock: material.maximum_stock.toString(),
      category_id: material.category_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        material_type: formData.material_type,
        unit: formData.unit,
        cost_per_unit: parseFloat(formData.cost_per_unit),
        current_stock: parseFloat(formData.current_stock),
        minimum_stock: parseFloat(formData.minimum_stock),
        reorder_level: parseFloat(formData.reorder_level),
        maximum_stock: parseFloat(formData.maximum_stock),
        category_id: formData.category_id || undefined,
      };

      if (selectedMaterial) {
        await apiService.put(`/inventory/raw-materials/${selectedMaterial.id}`, submitData);
        toast.success('Material updated successfully');
      } else {
        await apiService.post('/inventory/raw-materials', submitData);
        toast.success('Material created successfully');
      }
      setShowModal(false);
      fetchMaterials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedMaterial) return;
    try {
      await apiService.delete(`/inventory/raw-materials/${selectedMaterial.id}`);
      toast.success('Material deleted successfully');
      setShowDeleteModal(false);
      fetchMaterials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const getStockStatus = (material: RawMaterial) => {
    if (material.current_stock <= material.minimum_stock) {
      return { label: 'Critical', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' };
    } else if (material.current_stock <= material.reorder_level) {
      return { label: 'Low', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' };
    } else {
      return { label: 'Good', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' };
    }
  };

  const columns: ColumnDef<RawMaterial>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Material',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.category?.name || 'Uncategorized'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'material_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize text-sm">
          {row.original.material_type.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'current_stock',
      header: 'Current Stock',
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {row.original.current_stock} {row.original.unit}
            </span>
            {status.label !== 'Good' && (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'minimum_stock',
      header: 'Min Stock',
      cell: ({ row }) => `${row.original.minimum_stock} ${row.original.unit}`,
    },
    {
      accessorKey: 'cost_per_unit',
      header: 'Cost/Unit',
      cell: ({ row }) => (
        <span className="font-medium">${Number(row.original.cost_per_unit || 0).toFixed(2)}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        return (
          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', status.color)}>
            {status.label}
          </span>
        );
      },
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
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage raw materials and stock levels
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add Material
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={materials}
        loading={loading}
        searchPlaceholder="Search materials..."
        onRefresh={fetchMaterials}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedMaterial ? 'Edit Material' : 'Add Material'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material Code *
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
                Material Name *
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
                Material Type *
              </label>
              <select
                required
                value={formData.material_type}
                onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="raw_material">Raw Material</option>
                <option value="finished_goods">Finished Goods</option>
                <option value="consumable">Consumable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit *
              </label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="liter">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="piece">Piece</option>
                <option value="dozen">Dozen</option>
                <option value="packet">Packet</option>
                <option value="box">Box</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost Per Unit *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Stock *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reorder Level *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Stock *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.maximum_stock}
                onChange={(e) => setFormData({ ...formData, maximum_stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedMaterial ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Material"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{selectedMaterial?.name}"? This action cannot be undone.
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

export default InventoryPage;
