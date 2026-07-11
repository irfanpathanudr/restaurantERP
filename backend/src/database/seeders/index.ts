import 'reflect-metadata';
import dotenv from 'dotenv';
import AppDataSource from '../../config/database';
import logger from '../../config/logger';
import { seedPermissions } from './permission.seeder';
import { seedRoles } from './role.seeder';
import { seedAdmin } from './admin.seeder';

dotenv.config();

const runSeeders = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connected successfully');

    // Run seeders in sequence
    logger.info('Starting database seeding...');

    await seedPermissions();
    logger.info('✓ Permissions seeded successfully');

    await seedRoles();
    logger.info('✓ Roles seeded successfully');

    await seedAdmin();
    logger.info('✓ Admin user seeded successfully');

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  }
};

runSeeders();
