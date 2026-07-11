import dataSource from '../config/data-source';

async function runMigrations() {
  try {
    console.log('Initializing data source...');
    await dataSource.initialize();
    
    console.log('Running migrations...');
    const migrations = await dataSource.runMigrations({
      transaction: 'all',
    });
    
    if (migrations.length === 0) {
      console.log('No migrations to run.');
    } else {
      console.log(`Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }
    
    await dataSource.destroy();
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
