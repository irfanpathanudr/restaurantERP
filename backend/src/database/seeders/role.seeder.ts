import AppDataSource from '../../config/database';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { In } from 'typeorm';

/**
 * KOT Floor app permission matrix
 *
 * Waiter:  tables, menu, create/update orders, create/print KOT
 * Chef:    kitchen board, update KOT status, print KOT
 * Cashier: tables, open bills, view order/menu, print KOT, create invoice/payment
 * Manager: all of the above + kitchen board + manage menu/tables
 */
async function assignRolePermissions(
  roleRepository: ReturnType<typeof AppDataSource.getRepository<Role>>,
  permissionRepository: ReturnType<typeof AppDataSource.getRepository<Permission>>,
  opts: {
    name: string;
    code: string;
    description: string;
    permissionNames: string[];
  }
) {
  const permissions = await permissionRepository.find({
    where: { name: In(opts.permissionNames) },
  });

  const missing = opts.permissionNames.filter(
    (n) => !permissions.some((p) => p.name === n)
  );
  if (missing.length) {
    console.warn(`⚠ Missing permissions for ${opts.code}:`, missing.join(', '));
  }

  let role = await roleRepository.findOne({
    where: [{ name: opts.name }, { code: opts.code }],
    relations: ['permissions'],
  });

  if (!role) {
    role = roleRepository.create({
      name: opts.name,
      code: opts.code,
      description: opts.description,
      permissions,
    });
  } else {
    role.name = opts.name;
    role.code = opts.code;
    role.description = opts.description;
    role.permissions = permissions;
  }

  await roleRepository.save(role);
  console.log(`✓ Role ${opts.code}: ${permissions.length} permission(s)`);
  return role;
}

export const seedRoles = async () => {
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

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
    superAdminRole.code = 'SUPER_ADMIN';
    superAdminRole.permissions = allPermissions;
    await roleRepository.save(superAdminRole);
  }
  console.log(`✓ Role SUPER_ADMIN: ${allPermissions.length} permission(s)`);

  // Restaurant Manager — full KOT floor + ops + delete permissions
  await assignRolePermissions(roleRepository, permissionRepository, {
    name: 'Restaurant Manager',
    code: 'restaurant_manager',
    description: 'Manages restaurant operations, KOT floor, and billing',
    permissionNames: [
      'users.read', 'users.create', 'users.update', 'users.delete',
      'branches.read', 'branches.create', 'branches.update', 'branches.delete',
      'menu.read', 'menu.create', 'menu.update', 'menu.delete',
      'orders.read', 'orders.create', 'orders.update', 'orders.delete',
      'kot.read', 'kot.create', 'kot.update',
      'kitchens.read', 'kitchens.create', 'kitchens.update', 'kitchens.delete',
      'tables.read', 'tables.create', 'tables.update', 'tables.delete',
      'customers.read', 'customers.create', 'customers.update', 'customers.delete',
      'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',
      'payments.read', 'payments.create', 'payments.refund',
      'invoices.read', 'invoices.create', 'invoices.update',
      'employees.read', 'employees.create', 'employees.update', 'employees.delete',
      'reports.read', 'reports.export',
    ],
  });

  // Waiter — take orders + send/print KOT
  await assignRolePermissions(roleRepository, permissionRepository, {
    name: 'Waiter',
    code: 'waiter',
    description: 'Table service, orders, and KOT create/print',
    permissionNames: [
      'branches.read',
      'tables.read', 'tables.update',
      'menu.read',
      'kitchens.read',
      'orders.read', 'orders.create', 'orders.update',
      'kot.read', 'kot.create',
      'customers.read', 'customers.create',
      'payments.read', 'payments.create',
    ],
  });

  // Chef — kitchen board only
  await assignRolePermissions(roleRepository, permissionRepository, {
    name: 'Chef',
    code: 'chef',
    description: 'Kitchen board — view/update/print KOT',
    permissionNames: [
      'branches.read',
      'tables.read',
      'menu.read',
      'kitchens.read',
      'orders.read',
      'kot.read', 'kot.update',
      'inventory.read',
    ],
  });

  // Cashier — billing + view tables/orders/KOT print + menu access for bill viewing
  await assignRolePermissions(roleRepository, permissionRepository, {
    name: 'Cashier',
    code: 'cashier',
    description: 'Billing, payments, and KOT floor bill generation',
    permissionNames: [
      'branches.read',
      'tables.read', 'tables.update',
      'menu.read',
      'kitchens.read',
      'orders.read', 'orders.update',
      'kot.read', 'kot.create',
      'customers.read', 'customers.create',
      'payments.read', 'payments.create', 'payments.refund',
      'invoices.read', 'invoices.create',
    ],
  });
};
