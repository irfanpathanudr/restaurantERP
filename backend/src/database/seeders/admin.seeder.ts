import AppDataSource from '../../config/database';
import { User } from '../entities/User.entity';
import { Role } from '../entities/Role.entity';
import bcrypt from 'bcrypt';

export const seedAdmin = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const roleRepository = AppDataSource.getRepository(Role);

  // Get Super Admin role
  const superAdminRole = await roleRepository.findOne({
    where: { name: 'Super Admin' },
  });

  if (!superAdminRole) {
    throw new Error('Super Admin role not found. Please seed roles first.');
  }

  // Check if admin user already exists (including soft-deleted)
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@restaurant.com' },
    withDeleted: true,
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = userRepository.create({
      first_name: 'Super',
      last_name: 'Admin',
      email: 'admin@restaurant.com',
      phone: '1234567890',
      password: hashedPassword,
      status: 'active',
      is_email_verified: true,
      role_id: superAdminRole.id,
    });

    await userRepository.save(admin);
    console.log('\n✓ Admin user created successfully!');
    console.log('  Email: admin@restaurant.com');
    console.log('  Password: Admin@123');
    console.log('  ⚠ Please change the password after first login!\n');
  } else if (existingAdmin.deleted_at) {
    // Restore soft-deleted admin
    existingAdmin.deleted_at = null;
    existingAdmin.deleted_by = null;
    await userRepository.save(existingAdmin);
    console.log('\n✓ Admin user restored.');
  } else {
    console.log('\n✓ Admin user already exists.');
  }
};
