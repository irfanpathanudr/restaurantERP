import dataSource from '../config/data-source';

async function revertMigration() {
  try {
    console.log('Initializing data source...');
    await dataSource.initialize();
    
    console.log('Reverting last migration...');
    await dataSource.undoLastMigration({
      transaction: 'all',
    });
    
    console.log('✅ Migration reverted successfully!');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error reverting migration:', error);
    process.exit(1);
  }
}

revertMigration();
