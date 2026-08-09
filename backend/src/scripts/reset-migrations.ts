import 'reflect-metadata';
import AppDataSource from '../config/database';

AppDataSource.initialize()
  .then(async (ds) => {
    await ds.query('DROP TABLE IF EXISTS `migrations`');
    console.log('✅ migrations table dropped');
    await ds.destroy();
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
  });
