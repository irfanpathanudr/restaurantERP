import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import { setPageTitle } from '@/store/slices/uiSlice';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';
import { User, Role, UserStatus } from '@/types/entities.types';
import { Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { RootState } from '@/store';

const UsersPage: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = currentUser?.role?.code === 'SUPER_ADMIN';
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: '',
    branchId: '',
  });

  useEffect(() => {
    dispatch(setPageTitle('Users'));
    fetchUsers();
    fetchRoles();
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.findAll();
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await roleService.findAll();
      setRoles(data || []);
    } catch (error) {
      toast.error('Failed to fetch roles');
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      roleId: '',
      branchId: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone || '',
      roleId: user.role_id || '',
      branchId: user.branch_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.is_active ? 'INACTIVE' : 'ACTIVE';
      await userService.changeStatus(user.id, newStatus);
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Status change failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        ...formData,
        branchId: formData.branchId || null,
        roleId: formData.roleId || null,
      };

      if (selectedUser) {
        if (!submitData.password) {
          delete submitData.password;
        }
        await userService.update(selectedUser.id, submitData);
        toast.success('User updated successfully');
      } else {
        await userService.create(submitData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await userService.delete(selectedUser.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.first_name} {row.original.last_name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
          {row.original.role?.name || 'No Role'}
        </span>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => row.original.branch?.name || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusBadge(row.original.is_active))}>
          {row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },
    {
      accessorKey: 'last_login_at',
      header: 'Last Login',
      cell: ({ row }) => 
        row.original.last_login_at 
          ? new Date(row.original.last_login_at).toLocaleString()
          : 'Never',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {(isSuperAdmin || currentUser?.id !== row.original.id) && (
            <>
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
                leftIcon={
                  row.original.is_active 
                    ? <Lock className="h-4 w-4" /> 
                    : <Unlock className="h-4 w-4" />
                }
                onClick={() => handleToggleStatus(row.original)}
                className={cn(
                  row.original.is_active
                    ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                )}
              >
                {row.original.is_active ? 'Deactivate' : 'Activate'}
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
            Users
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system users and their access
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={handleCreate}
        >
          Add User
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users..."
        onRefresh={fetchUsers}
      />

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selectedUser ? 'Edit User' : 'Create User'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password {!selectedUser && '*'}
            </label>
            <input
              type="password"
              required={!selectedUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={selectedUser ? 'Leave blank to keep current' : ''}
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
              minLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter 10 digit phone number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select Role (Optional)</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
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
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete user "{selectedUser?.first_name} {selectedUser?.last_name}"? This action cannot be undone.
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

export default UsersPage;
