import { DataSource } from 'typeorm';
import { Table, TableStatus, TableType } from '../entities/Table.entity';
import { Branch } from '../entities/Branch.entity';

function tableTypeForCapacity(capacity: number): TableType {
  if (capacity <= 2) return TableType.TWO_SEATER;
  if (capacity <= 4) return TableType.FOUR_SEATER;
  if (capacity <= 6) return TableType.SIX_SEATER;
  if (capacity <= 8) return TableType.EIGHT_SEATER;
  return TableType.CUSTOM;
}

export async function seedTables(dataSource: DataSource): Promise<void> {
  const tableRepo = dataSource.getRepository(Table);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find({ order: { code: 'ASC' } });
  if (branches.length === 0) {
    console.log('⚠️ Branches not found. Please seed branches first.');
    return;
  }

  const layouts = [
    { capacity: 2, count: 5, area: 'Window Side' },
    { capacity: 4, count: 8, area: 'Main Hall' },
    { capacity: 6, count: 4, area: 'Main Hall' },
    { capacity: 8, count: 2, area: 'Private Room' },
  ];

  let seeded = 0;

  for (const branch of branches) {
    let seq = 1;
    for (const layout of layouts) {
      for (let i = 0; i < layout.count; i++) {
        const tableNumber = `${branch.code}-T${String(seq).padStart(2, '0')}`;
        seq += 1;

        const exists = await tableRepo.findOne({
          where: { table_number: tableNumber, branch_id: branch.id },
          withDeleted: true,
        });
        if (exists) {
          exists.deleted_at = null;
          exists.deleted_by = null;
          exists.is_active = true;
          await tableRepo.save(exists);
          continue;
        }

        const table = tableRepo.create({
          name: `Table ${tableNumber}`,
          table_number: tableNumber,
          branch_id: branch.id,
          capacity: layout.capacity,
          table_type: tableTypeForCapacity(layout.capacity),
          table_status: TableStatus.AVAILABLE,
          dining_area: layout.area,
          sort_order: seq,
          is_active: true,
          status: 'active',
        });
        await tableRepo.save(table);
        seeded += 1;
        console.log(`✅ Table seeded: ${table.table_number} (${branch.name})`);
      }
    }
  }

  console.log(`✅ Tables seed done — ${seeded} new table(s) across ${branches.length} branch(es)`);
}
