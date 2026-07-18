/**
 * Lightweight reseed for KOT floor data: tables + kitchens for every branch.
 * Usage: npx tsx src/database/seeders/kot-floor.seeder.ts
 */
import 'reflect-metadata';
import dotenv from 'dotenv';
import AppDataSource from '../../config/database';
import { seedTables } from './table.seeder';
import { seedKitchens } from './kitchen.seeder';
import { seedKotUsers } from './kot-users.seeder';
import { seedPermissions } from './permission.seeder';
import { seedRoles } from './role.seeder';

dotenv.config();

async function main() {
  await AppDataSource.initialize();
  console.log('Connected. Seeding KOT floor data...\n');

  await seedPermissions();
  await seedRoles();
  await seedKitchens(AppDataSource);
  await seedTables(AppDataSource);
  await seedKotUsers();

  console.log('\n✅ KOT floor reseed complete');
  await AppDataSource.destroy();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  try {
    await AppDataSource.destroy();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
