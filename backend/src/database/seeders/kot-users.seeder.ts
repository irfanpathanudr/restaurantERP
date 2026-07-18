import AppDataSource from '../../config/database';
import { User } from '../entities/User.entity';
import { Role } from '../entities/Role.entity';
import { Branch } from '../entities/Branch.entity';
import bcrypt from 'bcrypt';

const KOT_USERS = [
  {
    email: 'waiter@restaurant.com',
    password: 'Waiter@123',
    first_name: 'Raj',
    last_name: 'Waiter',
    phone: '9000000001',
    roleCode: 'waiter',
  },
  {
    email: 'chef@restaurant.com',
    password: 'Chef@123',
    first_name: 'Amit',
    last_name: 'Chef',
    phone: '9000000002',
    roleCode: 'chef',
  },
  {
    email: 'cashier@restaurant.com',
    password: 'Cashier@123',
    first_name: 'Priya',
    last_name: 'Cashier',
    phone: '9000000003',
    roleCode: 'cashier',
  },
  {
    email: 'manager@restaurant.com',
    password: 'Manager@123',
    first_name: 'Suresh',
    last_name: 'Manager',
    phone: '9000000004',
    roleCode: 'restaurant_manager',
  },
] as const;

export const seedKotUsers = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const roleRepository = AppDataSource.getRepository(Role);
  const branchRepository = AppDataSource.getRepository(Branch);

  const branch = await branchRepository.findOne({ where: {}, order: { created_at: 'ASC' } });

  console.log('\n--- KOT staff login accounts ---');

  for (const account of KOT_USERS) {
    const role = await roleRepository.findOne({ where: { code: account.roleCode } });
    if (!role) {
      console.log(`⚠ Role ${account.roleCode} not found — skip ${account.email}`);
      continue;
    }

    let user = await userRepository.findOne({ where: { email: account.email } });
    const hashedPassword = await bcrypt.hash(account.password, 10);

    if (!user) {
      user = userRepository.create({
        first_name: account.first_name,
        last_name: account.last_name,
        email: account.email,
        phone: account.phone,
        password: hashedPassword,
        status: 'active',
        is_active: true,
        is_email_verified: true,
        is_password_change_required: false,
        role_id: role.id,
        branch_id: branch?.id || null,
      });
      await userRepository.save(user);
      console.log(`✓ Created ${account.roleCode}: ${account.email} / ${account.password}`);
    } else {
      // Keep password/role in sync for local KOT testing
      user.password = hashedPassword;
      user.role_id = role.id;
      user.is_active = true;
      user.status = 'active';
      user.is_password_change_required = false;
      if (branch && !user.branch_id) user.branch_id = branch.id;
      await userRepository.save(user);
      console.log(`✓ Updated ${account.roleCode}: ${account.email} / ${account.password}`);
    }
  }

  console.log('--------------------------------\n');
};
