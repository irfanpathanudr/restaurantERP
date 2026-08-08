import AppDataSource from '../../config/database';
import { Permission } from '../entities/Permission.entity';

export const seedPermissions = async () => {
  const permissionRepository = AppDataSource.getRepository(Permission);

  const permissions = [
    // User Management
    { name: 'users.read', code: 'users.read', module: 'users', action: 'read', description: 'View users' },
    { name: 'users.create', code: 'users.create', module: 'users', action: 'create', description: 'Create users' },
    { name: 'users.update', code: 'users.update', module: 'users', action: 'update', description: 'Update users' },
    { name: 'users.delete', code: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },

    // Role Management
    { name: 'roles.read', code: 'roles.read', module: 'roles', action: 'read', description: 'View roles' },
    { name: 'roles.create', code: 'roles.create', module: 'roles', action: 'create', description: 'Create roles' },
    { name: 'roles.update', code: 'roles.update', module: 'roles', action: 'update', description: 'Update roles' },
    { name: 'roles.delete', code: 'roles.delete', module: 'roles', action: 'delete', description: 'Delete roles' },

    // Permission Management
    { name: 'permissions.read', code: 'permissions.read', module: 'permissions', action: 'read', description: 'View permissions' },
    { name: 'permissions.create', code: 'permissions.create', module: 'permissions', action: 'create', description: 'Create permissions' },
    { name: 'permissions.update', code: 'permissions.update', module: 'permissions', action: 'update', description: 'Update permissions' },
    { name: 'permissions.delete', code: 'permissions.delete', module: 'permissions', action: 'delete', description: 'Delete permissions' },

    // Restaurant Management
    { name: 'restaurants.read', code: 'restaurants.read', module: 'restaurants', action: 'read', description: 'View restaurants' },
    { name: 'restaurants.create', code: 'restaurants.create', module: 'restaurants', action: 'create', description: 'Create restaurants' },
    { name: 'restaurants.update', code: 'restaurants.update', module: 'restaurants', action: 'update', description: 'Update restaurants' },
    { name: 'restaurants.delete', code: 'restaurants.delete', module: 'restaurants', action: 'delete', description: 'Delete restaurants' },

    // Branch Management
    { name: 'branches.read', code: 'branches.read', module: 'branches', action: 'read', description: 'View branches' },
    { name: 'branches.create', code: 'branches.create', module: 'branches', action: 'create', description: 'Create branches' },
    { name: 'branches.update', code: 'branches.update', module: 'branches', action: 'update', description: 'Update branches' },
    { name: 'branches.delete', code: 'branches.delete', module: 'branches', action: 'delete', description: 'Delete branches' },

    // Menu Management
    { name: 'menu.read', code: 'menu.read', module: 'menu', action: 'read', description: 'View menu items' },
    { name: 'menu.create', code: 'menu.create', module: 'menu', action: 'create', description: 'Create menu items' },
    { name: 'menu.update', code: 'menu.update', module: 'menu', action: 'update', description: 'Update menu items' },
    { name: 'menu.delete', code: 'menu.delete', module: 'menu', action: 'delete', description: 'Delete menu items' },

    // Orders
    { name: 'orders.read', code: 'orders.read', module: 'orders', action: 'read', description: 'View orders' },
    { name: 'orders.create', code: 'orders.create', module: 'orders', action: 'create', description: 'Create orders' },
    { name: 'orders.update', code: 'orders.update', module: 'orders', action: 'update', description: 'Update orders' },
    { name: 'orders.delete', code: 'orders.delete', module: 'orders', action: 'delete', description: 'Delete orders' },

    // KOT
    { name: 'kot.read', code: 'kot.read', module: 'kot', action: 'read', description: 'View KOT' },
    { name: 'kot.create', code: 'kot.create', module: 'kot', action: 'create', description: 'Create KOT' },
    { name: 'kot.update', code: 'kot.update', module: 'kot', action: 'update', description: 'Update KOT' },

    // Kitchens
    { name: 'kitchens.read', code: 'kitchens.read', module: 'kitchens', action: 'read', description: 'View kitchens' },
    { name: 'kitchens.create', code: 'kitchens.create', module: 'kitchens', action: 'create', description: 'Create kitchens' },
    { name: 'kitchens.update', code: 'kitchens.update', module: 'kitchens', action: 'update', description: 'Update kitchens' },
    { name: 'kitchens.delete', code: 'kitchens.delete', module: 'kitchens', action: 'delete', description: 'Delete kitchens' },

    // Tables
    { name: 'tables.read', code: 'tables.read', module: 'tables', action: 'read', description: 'View tables' },
    { name: 'tables.create', code: 'tables.create', module: 'tables', action: 'create', description: 'Create tables' },
    { name: 'tables.update', code: 'tables.update', module: 'tables', action: 'update', description: 'Update tables' },
    { name: 'tables.delete', code: 'tables.delete', module: 'tables', action: 'delete', description: 'Delete tables' },

    // Customers
    { name: 'customers.read', code: 'customers.read', module: 'customers', action: 'read', description: 'View customers' },
    { name: 'customers.create', code: 'customers.create', module: 'customers', action: 'create', description: 'Create customers' },
    { name: 'customers.update', code: 'customers.update', module: 'customers', action: 'update', description: 'Update customers' },
    { name: 'customers.delete', code: 'customers.delete', module: 'customers', action: 'delete', description: 'Delete customers' },

    // Inventory
    { name: 'inventory.read', code: 'inventory.read', module: 'inventory', action: 'read', description: 'View inventory' },
    { name: 'inventory.create', code: 'inventory.create', module: 'inventory', action: 'create', description: 'Create inventory items' },
    { name: 'inventory.update', code: 'inventory.update', module: 'inventory', action: 'update', description: 'Update inventory' },
    { name: 'inventory.delete', code: 'inventory.delete', module: 'inventory', action: 'delete', description: 'Delete inventory items' },

    // Payments
    { name: 'payments.read', code: 'payments.read', module: 'payments', action: 'read', description: 'View payments' },
    { name: 'payments.create', code: 'payments.create', module: 'payments', action: 'create', description: 'Create payments' },
    { name: 'payments.refund', code: 'payments.refund', module: 'payments', action: 'refund', description: 'Refund payments' },

    // Invoices
    { name: 'invoices.read', code: 'invoices.read', module: 'invoices', action: 'read', description: 'View invoices' },
    { name: 'invoices.create', code: 'invoices.create', module: 'invoices', action: 'create', description: 'Create invoices' },
    { name: 'invoices.update', code: 'invoices.update', module: 'invoices', action: 'update', description: 'Update invoices' },

    // Employees
    { name: 'employees.read', code: 'employees.read', module: 'employees', action: 'read', description: 'View employees' },
    { name: 'employees.create', code: 'employees.create', module: 'employees', action: 'create', description: 'Create employees' },
    { name: 'employees.update', code: 'employees.update', module: 'employees', action: 'update', description: 'Update employees' },
    { name: 'employees.delete', code: 'employees.delete', module: 'employees', action: 'delete', description: 'Delete employees' },

    // Reports
    { name: 'reports.read', code: 'reports.read', module: 'reports', action: 'read', description: 'View reports' },
    { name: 'reports.export', code: 'reports.export', module: 'reports', action: 'export', description: 'Export reports' },
  ];

  for (const permissionData of permissions) {
    const existing = await permissionRepository.findOne({
      where: { name: permissionData.name },
      withDeleted: true,
    });

    if (!existing) {
      const permission = permissionRepository.create(permissionData);
      await permissionRepository.save(permission);
    } else if (existing.deleted_at) {
      existing.deleted_at = null;
      existing.deleted_by = null;
      await permissionRepository.save(existing);
    }
  }
};
