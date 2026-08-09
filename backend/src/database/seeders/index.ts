import 'reflect-metadata';
import dotenv from 'dotenv';
import AppDataSource from '../../config/database';
import logger from '../../config/logger';
import { SeederLog } from '../entities/SeederLog.entity';
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

/**
 * Checks whether a seeder has already been run by querying the seeder_logs table.
 */
async function hasRun(seederName: string): Promise<boolean> {
  const repo = AppDataSource.getRepository(SeederLog);
  const entry = await repo.findOne({ where: { seeder_name: seederName } });
  return !!entry;
}

/**
 * Marks a seeder as completed in the seeder_logs table.
 */
async function markDone(seederName: string, notes?: string): Promise<void> {
  const repo = AppDataSource.getRepository(SeederLog);
  const entry = repo.create({ seeder_name: seederName, notes: notes ?? null });
  await repo.save(entry);
}

/**
 * Ensures the seeder_logs table exists (auto-create via TypeORM query builder).
 * We do a raw CREATE TABLE IF NOT EXISTS so there is no dependency on synchronize=true.
 */
async function ensureSeederLogTable(): Promise<void> {
  await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS \`seeder_logs\` (
      \`id\`           INT          NOT NULL AUTO_INCREMENT,
      \`seeder_name\`  VARCHAR(255) NOT NULL,
      \`run_at\`       TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`notes\`        TEXT         NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`UQ_seeder_logs_seeder_name\` (\`seeder_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

const runSeeders = async () => {
  try {
    // Guard: if DataSource is already initialised (called from within a running
    // server) reuse it; otherwise initialise now.
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connected successfully');
    }
    logger.info('Starting database seeding...\n');

    // Ensure tracking table exists before any seeder runs
    await ensureSeederLogTable();
    logger.info('✓ seeder_logs table ready');

    // ── Fast-exit: all seeders already applied ───────────────────────────────
    const TOTAL_SEEDERS = 10;
    const doneCount: number = (await AppDataSource.query(
      'SELECT COUNT(*) AS cnt FROM `seeder_logs`'
    ))[0].cnt;
    if (Number(doneCount) >= TOTAL_SEEDERS) {
      logger.info(`⏭  All ${TOTAL_SEEDERS} seeders already applied — nothing to do.`);
      process.exit(0);
      return;
    }

    // ── Permissions ──────────────────────────────────────────────────────────
    if (await hasRun('PermissionSeeder')) {
      logger.info('⏭  PermissionSeeder already applied — skipping');
    } else {
      await seedPermissions();
      await markDone('PermissionSeeder', 'Core RBAC permissions');
      logger.info('✓ Permissions seeded');
    }

    // ── Roles ────────────────────────────────────────────────────────────────
    if (await hasRun('RoleSeeder')) {
      logger.info('⏭  RoleSeeder already applied — skipping');
    } else {
      await seedRoles();
      await markDone('RoleSeeder', 'Super Admin, Manager, Waiter, Chef, Cashier');
      logger.info('✓ Roles seeded');
    }

    // ── Admin user ───────────────────────────────────────────────────────────
    if (await hasRun('AdminSeeder')) {
      logger.info('⏭  AdminSeeder already applied — skipping');
    } else {
      await seedAdmin();
      await markDone('AdminSeeder', 'admin@restaurant.com / Admin@123');
      logger.info('✓ Admin user seeded');
    }

    // ── Restaurant ───────────────────────────────────────────────────────────
    if (await hasRun('RestaurantSeeder')) {
      logger.info('⏭  RestaurantSeeder already applied — skipping');
    } else {
      await seedRestaurants(AppDataSource);
      await markDone('RestaurantSeeder', 'REST001 — Udaipur Zayka');
      logger.info('✓ Restaurant seeded');
    }

    // ── Branch ───────────────────────────────────────────────────────────────
    if (await hasRun('BranchSeeder')) {
      logger.info('⏭  BranchSeeder already applied — skipping');
    } else {
      await seedBranches(AppDataSource);
      await markDone('BranchSeeder', 'BR001 — Main Branch');
      logger.info('✓ Branch seeded');
    }

    // ── KOT users ────────────────────────────────────────────────────────────
    if (await hasRun('KotUsersSeeder')) {
      logger.info('⏭  KotUsersSeeder already applied — skipping');
    } else {
      await seedKotUsers();
      await markDone('KotUsersSeeder', 'KOT floor staff users');
      logger.info('✓ KOT staff users seeded');
    }

    // ── Kitchen ──────────────────────────────────────────────────────────────
    if (await hasRun('KitchenSeeder')) {
      logger.info('⏭  KitchenSeeder already applied — skipping');
    } else {
      await seedKitchens(AppDataSource);
      await markDone('KitchenSeeder', '1 Main Kitchen per branch');
      logger.info('✓ Kitchens seeded');
    }

    // ── Categories ───────────────────────────────────────────────────────────
    if (await hasRun('CategorySeeder')) {
      logger.info('⏭  CategorySeeder already applied — skipping');
    } else {
      await seedCategories(AppDataSource);
      await markDone('CategorySeeder', 'Menu categories');
      logger.info('✓ Categories seeded');
    }

    // ── Menu items ───────────────────────────────────────────────────────────
    if (await hasRun('MenuItemSeeder')) {
      logger.info('⏭  MenuItemSeeder already applied — skipping');
    } else {
      await seedMenuItems(AppDataSource);
      await markDone('MenuItemSeeder', 'Menu items');
      logger.info('✓ Menu items seeded');
    }

    // ── Tables ───────────────────────────────────────────────────────────────
    if (await hasRun('TableSeeder')) {
      logger.info('⏭  TableSeeder already applied — skipping');
    } else {
      await seedTables(AppDataSource);
      await markDone('TableSeeder', '9 tables per branch');
      logger.info('✓ Tables seeded');
    }

    logger.info('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  }
};

runSeeders();
