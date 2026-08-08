const mysql = require('mysql2/promise');

async function audit() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'restaurant_erp',
  });

  console.log('\n========== BRANCHES ==========');
  const [branches] = await conn.execute('SELECT id, name, code FROM branches WHERE deleted_at IS NULL');
  branches.forEach(b => console.log(b.id, '|', b.name, '|', b.code));

  console.log('\n========== KITCHENS ==========');
  const [kitchens] = await conn.execute('SELECT id, name, branch_id, is_active FROM kitchens WHERE deleted_at IS NULL');
  kitchens.forEach(k => console.log(k.id, '|', k.name, '| branch:', k.branch_id, '| active:', k.is_active));

  console.log('\n========== USERS ==========');
  const [users] = await conn.execute('SELECT id, first_name, last_name, email, role_id, branch_id FROM users WHERE deleted_at IS NULL');
  users.forEach(u => console.log(u.id, '|', u.first_name, u.last_name, '|', u.email, '| role_id:', u.role_id, '| branch:', u.branch_id));

  console.log('\n========== ROLES ==========');
  const [roles] = await conn.execute('SELECT id, name, code FROM roles WHERE deleted_at IS NULL');
  roles.forEach(r => console.log(r.id, '|', r.name, '|', r.code));

  console.log('\n========== TABLES (first 15) ==========');
  const [tables] = await conn.execute('SELECT id, table_number, branch_id, table_status FROM tables WHERE deleted_at IS NULL LIMIT 15');
  tables.forEach(t => console.log(t.id, '|', t.table_number, '| branch:', t.branch_id, '| status:', t.table_status));

  console.log('\n========== TABLES - STALE BRANCH ==========');
  const branchIds = branches.map(b => b.id);
  const placeholders = branchIds.map(() => '?').join(',');
  const [badTables] = await conn.execute(
    `SELECT id, table_number, branch_id FROM tables WHERE deleted_at IS NULL AND (branch_id IS NULL OR branch_id NOT IN (${placeholders}))`,
    branchIds
  );
  console.log('Tables with bad branch_id:', badTables.length);
  badTables.forEach(t => console.log('  BAD TABLE:', t.id, t.table_number, 'branch_id:', t.branch_id));

  console.log('\n========== RECENT ORDERS ==========');
  const [orders] = await conn.execute(
    'SELECT id, order_number, branch_id, table_id, order_status, created_at FROM orders WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5'
  );
  orders.forEach(o => console.log(o.id, '|', o.order_number, '| branch:', o.branch_id, '| status:', o.order_status));

  console.log('\n========== RECENT KOTS ==========');
  const [kots] = await conn.execute(
    'SELECT id, kot_number, order_id, kitchen_id, kot_status, created_at FROM kots WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10'
  );
  kots.forEach(k => console.log(k.id, '|', k.kot_number, '| kitchen:', k.kitchen_id, '| status:', k.kot_status));

  console.log('\n========== KITCHEN -> BRANCH HEALTH ==========');
  kitchens.forEach(k => {
    const valid = branchIds.includes(k.branch_id);
    console.log(valid ? 'OK' : 'BAD', k.name, '| branch_id:', k.branch_id);
  });

  await conn.end();
}
audit().catch(console.error);
