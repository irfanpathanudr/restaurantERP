import { DataSource } from 'typeorm';
import { Table } from '../entities/Table.entity';
import { Branch } from '../entities/Branch.entity';

export async function seedTables(dataSource: DataSource): Promise<void> {
  const tableRepo = dataSource.getRepository(Table);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find();
  if (branches.length === 0) {
    console.log('⚠️ Branches not found. Please seed branches first.');
    return;
  }

  const tables: any[] = [];
  
  // Generate tables for each branch
  for (const branch of branches.slice(0, 2)) {
    // Small tables (2 seats)
    for (let i = 1; i <= 5; i++) {
      tables.push({
        table_number: `T${String(tables.length + 1).padStart(3, '0')}`,
        branch_id: branch.id,
        capacity: 2,
        status: 'AVAILABLE',
        location: 'Main Floor',
      });
    }
    
    // Medium tables (4 seats)
    for (let i = 1; i <= 8; i++) {
      tables.push({
        table_number: `T${String(tables.length + 1).padStart(3, '0')}`,
        branch_id: branch.id,
        capacity: 4,
        status: 'AVAILABLE',
        location: 'Main Floor',
      });
    }
    
    // Large tables (6 seats)
    for (let i = 1; i <= 4; i++) {
      tables.push({
        table_number: `T${String(tables.length + 1).padStart(3, '0')}`,
        branch_id: branch.id,
        capacity: 6,
        status: 'AVAILABLE',
        location: 'Main Floor',
      });
    }
    
    // Extra large tables (8 seats)
    for (let i = 1; i <= 2; i++) {
      tables.push({
        table_number: `T${String(tables.length + 1).padStart(3, '0')}`,
        branch_id: branch.id,
        capacity: 8,
        status: 'AVAILABLE',
        location: 'Private Room',
      });
    }
  }

  for (const tableData of tables) {
    const exists = await tableRepo.findOne({
      where: { 
        table_number: tableData.table_number,
        branch_id: tableData.branch_id 
      },
    });
    if (!exists) {
      const table = tableRepo.create(tableData);
      await tableRepo.save(table);
      console.log(`✅ Table seeded: ${table.table_number}`);
    }
  }
}
