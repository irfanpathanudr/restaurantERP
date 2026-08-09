import 'reflect-metadata';
import AppDataSource from '../config/database';

AppDataSource.initialize()
  .then(async (ds) => {
    // Check the printers table definition
    const printersCols = await ds.query(
      `SHOW CREATE TABLE \`printers\``
    ).catch(() => null);
    if (printersCols) {
      console.log('PRINTERS:', JSON.stringify(printersCols[0], null, 2));
    }

    // Check branches table
    const branchCols = await ds.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'branches' AND COLUMN_NAME = 'id'`
    );
    console.log('BRANCHES.id:', JSON.stringify(branchCols, null, 2));

    // Check the INNODB FK error
    const fkErr = await ds.query(`SHOW ENGINE INNODB STATUS`).catch(() => null);
    if (fkErr) {
      const status: string = fkErr[0]?.Status ?? '';
      const idx = status.indexOf('LATEST FOREIGN KEY ERROR');
      if (idx !== -1) {
        console.log('FK ERROR:', status.substring(idx, idx + 800));
      }
    }

    await ds.destroy();
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });
