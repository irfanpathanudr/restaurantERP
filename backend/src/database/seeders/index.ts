import 'reflect-metadata';
import dotenv from 'dotenv';
import AppDataSource from '../../config/database';
import logger from '../../config/logger';
import { seedPermissions } from './permission.seeder';
import { seedRoles } from './role.seeder';
import { seedAdmin } from './admin.seeder';
import { seedRestaurants } from './restaurant.seeder';
import { seedBranches } from './branch.seeder';
import { seedKitchens } from './kitchen.seeder';
import { seedCategories } from './category.seeder';
import { seedMenuItems } from './menu-item.seeder';
import { seedTables } from './table.seeder';
import { seedCustomers } from './customer.seeder';
import { seedVendors } from './vendor.seeder';
import { seedRawMaterials } from './raw-material.seeder';
import { seedEmployees } from './employee.seeder';
import { seedReservations } from './reservation.seeder';
import { seedOrders } from './order.seeder';
import { seedExpenses } from './expense.seeder';
import { seedPayments } from './payment.seeder';

dotenv.config();

const runSeeders = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connected successfully');

    // Run seeders in sequence
    logger.info('Starting database seeding...\n');

    await seedPermissions();
    logger.info('✓ Permissions seeded successfully');

    await seedRoles();
    logger.info('✓ Roles seeded successfully');

    await seedAdmin();
    logger.info('✓ Admin user seeded successfully');

    await seedRestaurants(AppDataSource);
    logger.info('✓ Restaurants seeded successfully');

    await seedBranches(AppDataSource);
    logger.info('✓ Branches seeded successfully');

    await seedKitchens(AppDataSource);
    logger.info('✓ Kitchens seeded successfully');

    await seedCategories(AppDataSource);
    logger.info('✓ Categories seeded successfully');

    await seedMenuItems(AppDataSource);
    logger.info('✓ Menu items seeded successfully');

    await seedTables(AppDataSource);
    logger.info('✓ Tables seeded successfully');

    await seedCustomers(AppDataSource);
    logger.info('✓ Customers seeded successfully');

    await seedVendors(AppDataSource);
    logger.info('✓ Vendors seeded successfully');

    await seedRawMaterials(AppDataSource);
    logger.info('✓ Raw materials seeded successfully');

    await seedEmployees(AppDataSource);
    logger.info('✓ Employees seeded successfully');

    await seedReservations(AppDataSource);
    logger.info('✓ Reservations seeded successfully');

    await seedOrders(AppDataSource);
    logger.info('✓ Orders seeded successfully');

    await seedExpenses(AppDataSource);
    logger.info('✓ Expenses seeded successfully');

    await seedPayments(AppDataSource);
    logger.info('✓ Payments seeded successfully');

    logger.info('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  }
};

runSeeders();
