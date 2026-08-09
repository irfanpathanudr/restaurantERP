import { DataSource } from 'typeorm';
import { Table, TableStatus, TableType, TableShape } from '../entities/Table.entity';
import { Branch } from '../entities/Branch.entity';

/**
 * Seeds exactly 9 tables per branch.
 *
 * Layout (9 total):
 *  - T01–T02 : 2-seater  (Window Side)
 *  - T03–T06 : 4-seater  (Main Hall)
 *  - T07–T08 : 6-seater  (Main Hall)
 *  - T09     : 8-seater  (Private Room)
 */
const TABLE_LAYOUT = [
  { capacity: 2, count: 2, area: 'Window Side',  type: TableType.TWO_SEATER  },
  { capacity: 4, count: 4, area: 'Main Hall',    type: TableType.FOUR_SEATER },
  { capacity: 6, count: 2, area: 'Main Hall',    type: TableType.SIX_SEATER  },
  { capacity: 8, count: 1, area: 'Private Room', type: TableType.EIGHT_SEATER },
];

export async function seedTables(dataSource: DataSource): Promise<void> {
  const tableRepo = dataSource.getRepository(Table);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find({ order: { code: 'ASC' } });
  if (branches.length === 0) {
    console.log('⚠️  Branches not found. Please seed branches first.');
    return;
  }

  let seeded = 0;

  for (const branch of branches) {
    let seq = 1;

    for (const layout of TABLE_LAYOUT) {
      for (let i = 0; i < layout.count; i++) {
        const tableNumber = `${branch.code}-T${String(seq).padStart(2, '0')}`;
        seq += 1;

        const existing = await tableRepo.findOne({
          where: { table_number: tableNumber, branch_id: branch.id },
          withDeleted: true,
        });

        if (existing) {
          // Restore soft-deleted and refresh
          existing.deleted_at = null;
          existing.deleted_by = null;
          existing.is_active = true;
          existing.status = 'active';
          existing.table_status = TableStatus.AVAILABLE;
          await tableRepo.save(existing);
          console.log(`🔄 Table restored: ${tableNumber} (${branch.name})`);
          continue;
        }

        const table = tableRepo.create({
          name: `Table ${tableNumber}`,
          table_number: tableNumber,
          branch_id: branch.id,
          capacity: layout.capacity,
          table_type: layout.type,
          table_status: TableStatus.AVAILABLE,
          shape: TableShape.SQUARE,
          dining_area: layout.area,
          sort_order: seq - 1,
          is_active: true,
          status: 'active',
        });
        await tableRepo.save(table);
        seeded += 1;
        console.log(`✅ Table seeded: ${tableNumber} (cap: ${layout.capacity}, area: ${layout.area})`);
      }
    }

    console.log(`   → ${seq - 1} tables for branch: ${branch.name}`);
  }

  console.log(`✅ Tables seed done — ${seeded} new table(s) across ${branches.length} branch(es)`);
}
