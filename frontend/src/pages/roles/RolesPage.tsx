import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { roleService } from '@/services/role.service';
import { permissionService } from '@/services/permission.service';
import { Role, Permission, PermissionType } from '@/types/entities.types';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { RootState } from '@/store';

const RolesPage: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = currentUser?.role?.code === 'SUPER_ADMIN';
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 0,
  });

  useEffect(() => {
    dispatch(setPageTitle('Roles'));
    fetchRoles();
    fetchPermissions();
  }, [dispatch]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.findAll();
      setRoles(data || []);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await permissionService.findAll();
      setPermissions(data || []);
    } catch (error) {
      toast.error('Failed to fetch permissions');
    }
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      level: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      level: role.level,
    });
    setShowModal(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    setShowPermissionsModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        await roleService.update(selectedRole.id, formData);
        toast.success('Role updated successfully');
      } else {
        await roleService.create(formData);
        toast.success('Role created successfully');
      }
      setShowModal(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handlePermissionsSubmit = async () => {
    if (!selectedRole) return;
    try {
      await roleService.assignPermissions(selectedRole.id, selectedPermissions);
      toast.success('Permissions updated successfully');
      setShowPermissionsModal(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleAllPermissions = () => {
    if (selectedPermissions.length === permissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissions.map(p => p.id));
    }
  };

  const confirmDelete = async () => {
    if (!selectedRole) return;
    try {
      await roleService.delete(selectedRole.id);
      toast.success('Role deleted successfully');
      setShowDeleteModal(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const groupPermissionsByType = () => {
    const grouped: Record<PermissionType, Permission[]> = {
      [PermissionType.PAGE]: [],
      [PermissionType.BUTTON]: [],
      [PermissionType.API]: [],
      [PermissionType.FIELD]: [],
      [PermissionType.RECORD]: [],
      [PermissionType.BRANCH]: [],
      [PermissionType.KITCHEN]: [],
    };

    permissions.forEach(permission => {
      grouped[permission.type].push(permission);
    });

    return grouped;
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }: { row: any }) => (
        <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: any }) => (
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
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }: { row: any }) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
          Level {row.original.level}
        </span>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.permissions?.length || 0} assigned
          </span>
          {row.original.code === 'SUPER_ADMIN' && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              Full Access
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          {(isSuperAdmin || row.original.code !== 'SUPER_ADMIN') && (
            <>
              <PermissionGuard permission="roles:update">
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Shield className="h-4 w-4" />}
                  onClick={() => handleManagePermissions(row.original)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Permissions
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="roles:update">
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Edit className="h-4 w-4" />}
                  onClick={() => handleEdit(row.original)}
                >
                  Edit
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="roles:delete">
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
            </>
          )}
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
            Roles
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage roles and their permissions
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
          permission="roles:create"
        >
          Add Role
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        searchPlaceholder="Search roles..."
        onRefresh={fetchRoles}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedRole ? 'Edit Role' : 'Create Role'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role Name *
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
              Role Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              placeholder="MANAGER, CASHIER, etc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level
            </label>
            <input
              type="number"
              min="0"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Higher levels have more authority
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {selectedRole ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Permissions Management Modal */}
      <Modal
        open={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`Manage Permissions - ${selectedRole?.name}`}
        size="xl"
      >
        {selectedRole?.code === 'SUPER_ADMIN' ? (
          <div className="py-8 text-center">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Super Admin Role
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Super Admin has full access to all permissions by default.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPermissions.length} of {permissions.length} permissions selected
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleAllPermissions}
              >
                {selectedPermissions.length === permissions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.entries(groupPermissionsByType()).map(([type, perms]) => (
                perms.length > 0 && (
                  <div key={type} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase">
                      {type.replace('_', ' ')} Permissions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((permission) => (
                        <label
                          key={permission.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                            selectedPermissions.includes(permission.id)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {permission.name}
                            </div>
                            {permission.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {permission.description}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPermissionsModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePermissionsSubmit}>
                Save Permissions
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Role"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete role "{selectedRole?.name}"? This action cannot be undone.
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

export default RolesPage;
