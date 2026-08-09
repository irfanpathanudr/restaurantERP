import 'reflect-metadata';
import AppDataSource from '../config/database';

/**
 * Converts all tables in the database to utf8mb4_unicode_ci.
 * Run once to fix collation mismatches caused by tables that were
 * created before the InitialSchema migration enforced unicode_ci.
 */
AppDataSource.initialize()
  .then(async (ds) => {
    const dbName: string = (await ds.query('SELECT DATABASE() AS db'))[0].db;
    console.log(`Database: ${dbName}`);

    const tables: Array<{ TABLE_NAME: string }> = await ds.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [dbName]
    );

    for (const { TABLE_NAME } of tables) {
      await ds.query(
        `ALTER TABLE \`${TABLE_NAME}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✅ Fixed: ${TABLE_NAME}`);
    }

    console.log('\n✅ All tables converted to utf8mb4_unicode_ci');
    await ds.destroy();
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  });
