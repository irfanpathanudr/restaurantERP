import 'reflect-metadata';
import dotenv from 'dotenv';
import AppDataSource from '../../config/database';
import logger from '../../config/logger';
import { seedPermissions } from './permission.seeder';
import { seedRoles } from './role.seeder';
import { seedAdmin } from './admin.seeder';
import { seedRestaurants } from './restaurant.seeder';
import { seedBranches } from './branch.seeder';
import { seedKotUsers } from './kot-users.seeder';
import { seedKitchens } from './kitchen.seeder';
import { seedCategories } from './category.seeder';
import { seedMenuItems } from './menu-item.seeder';
import { seedTables } from './table.seeder';

dotenv.config();

const runSeeders = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');
    logger.info('Starting database seeding...\n');

    await seedPermissions();
    logger.info('✓ Permissions seeded');

    await seedRoles();
    logger.info('✓ Roles seeded');

    await seedAdmin();
    logger.info('✓ Admin user seeded');

    await seedRestaurants(AppDataSource);
    logger.info('✓ Restaurant seeded');

    await seedBranches(AppDataSource);
    logger.info('✓ Branch seeded');

    await seedKotUsers();
    logger.info('✓ KOT staff users seeded');

    await seedKitchens(AppDataSource);
    logger.info('✓ Kitchens seeded');

    await seedCategories(AppDataSource);
    logger.info('✓ Categories seeded');

    await seedMenuItems(AppDataSource);
    logger.info('✓ Menu items seeded');

    await seedTables(AppDataSource);
    logger.info('✓ Tables seeded');

    logger.info('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  }
};

runSeeders();
