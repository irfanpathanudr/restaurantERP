import dataSource from '../config/data-source';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateMigration() {
  try {
    const migrationName = process.argv[2] || 'Migration';
    
    console.log('Initializing data source...');
    await dataSource.initialize();
    
    console.log('Generating migration...');
    const command = `npx typeorm migration:generate ${migrationName} -d src/config/data-source.ts`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error generating migration:', error);
    process.exit(1);
  }
}

generateMigration();
