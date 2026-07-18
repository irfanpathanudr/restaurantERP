import AppDataSource from '../../config/database';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { In } from 'typeorm';

export const seedRoles = async () => {
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

  // Get all permissions
  const allPermissions = await permissionRepository.find();

  // Super Admin - All permissions
  let superAdminRole = await roleRepository.findOne({
    where: { name: 'Super Admin' },
  });

  if (!superAdminRole) {
    superAdminRole = roleRepository.create({
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
      description: 'Full system access with all permissions',
      permissions: allPermissions,
    });
    await roleRepository.save(superAdminRole);
  } else {
    // Update code if it's wrong
    superAdminRole.code = 'SUPER_ADMIN';
    superAdminRole.permissions = allPermissions;
    await roleRepository.save(superAdminRole);
  }

  // Restaurant Manager
  const managerPermissionNames = [
    'users.read', 'users.create', 'users.update',
    'branches.read', 'branches.create', 'branches.update',
    'menu.read', 'menu.create', 'menu.update', 'menu.delete',
    'orders.read', 'orders.create', 'orders.update',
    'kot.read', 'kot.create', 'kot.update',
    'tables.read', 'tables.create', 'tables.update',
    'customers.read', 'customers.create', 'customers.update',
    'inventory.read', 'inventory.create', 'inventory.update',
    'payments.read', 'payments.create',
    'invoices.read', 'invoices.create',
    'employees.read', 'employees.create', 'employees.update',
    'reports.read', 'reports.export',
  ];

  const managerPermissions = await permissionRepository.find({
    where: { name: In(managerPermissionNames) },
  });

  let managerRole = await roleRepository.findOne({
    where: { name: 'Restaurant Manager' },
  });

  if (!managerRole) {
    managerRole = roleRepository.create({
      name: 'Restaurant Manager',
      code: 'restaurant_manager',
      description: 'Manages restaurant operations and staff',
      permissions: managerPermissions,
    });
    await roleRepository.save(managerRole);
  }

  // Waiter/Server
  const waiterPermissionNames = [
    'menu.read',
    'orders.read', 'orders.create', 'orders.update',
    'kot.read', 'kot.create',
    'tables.read', 'tables.update',
    'customers.read', 'customers.create',
    'payments.read', 'payments.create',
  ];

  const waiterPermissions = await permissionRepository.find({
    where: { name: In(waiterPermissionNames) },
  });

  let waiterRole = await roleRepository.findOne({
    where: { name: 'Waiter' },
  });

  if (!waiterRole) {
    waiterRole = roleRepository.create({
      name: 'Waiter',
      code: 'waiter',
      description: 'Handles table service and orders',
      permissions: waiterPermissions,
    });
    await roleRepository.save(waiterRole);
  }

  // Chef
  const chefPermissionNames = [
    'menu.read',
    'kot.read', 'kot.update',
    'inventory.read',
  ];

  const chefPermissions = await permissionRepository.find({
    where: { name: In(chefPermissionNames) },
  });

  let chefRole = await roleRepository.findOne({
    where: { name: 'Chef' },
  });

  if (!chefRole) {
    chefRole = roleRepository.create({
      name: 'Chef',
      code: 'chef',
      description: 'Prepares food orders from KOT',
      permissions: chefPermissions,
    });
    await roleRepository.save(chefRole);
  }

  // Cashier
  const cashierPermissionNames = [
    'orders.read',
    'customers.read',
    'payments.read', 'payments.create', 'payments.refund',
    'invoices.read', 'invoices.create',
  ];

  const cashierPermissions = await permissionRepository.find({
    where: { name: In(cashierPermissionNames) },
  });

  let cashierRole = await roleRepository.findOne({
    where: { name: 'Cashier' },
  });

  if (!cashierRole) {
    cashierRole = roleRepository.create({
      name: 'Cashier',
      code: 'cashier',
      description: 'Handles billing and payments',
      permissions: cashierPermissions,
    });
    await roleRepository.save(cashierRole);
  }
};
