import 'reflect-metadata';
import AppDataSource from '../config/database';

AppDataSource.initialize()
  .then(async (ds) => {
    const counts = await ds.query(`
      SELECT 'seeder_logs'  AS tbl, COUNT(*) AS cnt FROM seeder_logs
      UNION ALL SELECT 'permissions',  COUNT(*) FROM permissions
      UNION ALL SELECT 'roles',        COUNT(*) FROM roles
      UNION ALL SELECT 'users',        COUNT(*) FROM users
      UNION ALL SELECT 'restaurants',  COUNT(*) FROM restaurants
      UNION ALL SELECT 'branches',     COUNT(*) FROM branches
      UNION ALL SELECT 'kitchens',     COUNT(*) FROM kitchens
      UNION ALL SELECT 'tables',       COUNT(*) FROM \`tables\`
      UNION ALL SELECT 'categories',   COUNT(*) FROM categories
      UNION ALL SELECT 'menu_items',   COUNT(*) FROM menu_items
    `);

    console.log('\n=== Seeded Data Summary ===');
    for (const row of counts) {
      console.log(`  ${row.tbl.padEnd(15)} ${row.cnt}`);
    }

    const tables = await ds.query(
      `SELECT table_number, capacity, dining_area, table_status FROM \`tables\` ORDER BY sort_order`
    );
    console.log('\n=== Tables ===');
    for (const t of tables) {
      console.log(`  ${t.table_number}  cap:${t.capacity}  area:${t.dining_area}  status:${t.table_status}`);
    }

    const kitchens = await ds.query(`SELECT name, code, location FROM kitchens`);
    console.log('\n=== Kitchens ===');
    for (const k of kitchens) {
      console.log(`  ${k.name}  (${k.code})  loc:${k.location}`);
    }

    await ds.destroy();
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
  });
