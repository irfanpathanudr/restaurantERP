import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { permissionService } from '@/services/permission.service';
import { Permission, PermissionType } from '@/types/entities.types';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const PermissionsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: PermissionType.API,
    resource: '',
    action: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Permissions'));
    fetchPermissions();
  }, [dispatch]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await permissionService.findAll();
      setPermissions(data || []);
    } catch (error) {
      toast.error('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPermission(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      type: PermissionType.API,
      resource: '',
      action: '',
    });
    setShowModal(true);
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      code: permission.code,
      description: permission.description || '',
      type: permission.type,
      resource: permission.resource,
      action: permission.action,
    });
    setShowModal(true);
  };

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPermission) {
        await permissionService.update(selectedPermission.id, formData);
        toast.success('Permission updated successfully');
      } else {
        await permissionService.create(formData);
        toast.success('Permission created successfully');
      }
      setShowModal(false);
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedPermission) return;
    try {
      await permissionService.delete(selectedPermission.id);
      toast.success('Permission deleted successfully');
      setShowDeleteModal(false);
      fetchPermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const getTypeColor = (type: PermissionType) => {
    const colors = {
      [PermissionType.PAGE]: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      [PermissionType.BUTTON]: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      [PermissionType.API]: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      [PermissionType.FIELD]: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      [PermissionType.RECORD]: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      [PermissionType.BRANCH]: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      [PermissionType.KITCHEN]: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    };
    return colors[type] || colors[PermissionType.API];
  };

  const columns: ColumnDef<Permission>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.original.code}
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
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.description || 'No description'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getTypeColor(row.original.type))}>
          {row.original.type.toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {row.original.resource}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.original.action}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PermissionGuard permission="permissions:update">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="permissions:delete">
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
            Permissions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system permissions and access controls
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
          permission="permissions:create"
        >
          Add Permission
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              About Permissions
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Permissions control access to different parts of the system. They can be assigned to roles,
              and users inherit permissions from their roles. Super Admin role has access to all permissions automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={permissions}
        loading={loading}
        searchPlaceholder="Search permissions..."
        onRefresh={fetchPermissions}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedPermission ? 'Edit Permission' : 'Create Permission'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Permission Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., View Users"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Permission Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                placeholder="e.g., users:view"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PermissionType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value={PermissionType.PAGE}>Page</option>
              <option value={PermissionType.BUTTON}>Button</option>
              <option value={PermissionType.API}>API</option>
              <option value={PermissionType.FIELD}>Field</option>
              <option value={PermissionType.RECORD}>Record</option>
              <option value={PermissionType.BRANCH}>Branch</option>
              <option value={PermissionType.KITCHEN}>Kitchen</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose the type of resource this permission controls
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resource *
              </label>
              <input
                type="text"
                required
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                placeholder="e.g., users, orders, menu"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action *
              </label>
              <input
                type="text"
                required
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                placeholder="e.g., create, read, update, delete"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this permission allows..."
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
              {selectedPermission ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Permission"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete permission "{selectedPermission?.name}"? This action cannot be undone and may affect existing roles.
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

export default PermissionsPage;
