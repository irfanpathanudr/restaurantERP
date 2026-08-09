import { DataSource } from 'typeorm';
import { Kitchen } from '../entities/Kitchen.entity';
import { Branch } from '../entities/Branch.entity';

/**
 * Seeds exactly ONE kitchen per branch.
 * Kitchen code is derived from the branch code, e.g. "BR001-MAIN".
 */
export async function seedKitchens(dataSource: DataSource): Promise<void> {
  const kitchenRepo = dataSource.getRepository(Kitchen);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find({ order: { code: 'ASC' } });
  if (branches.length === 0) {
    console.log('⚠️  Branches not found. Please seed branches first.');
    return;
  }

  let seeded = 0;

  for (const branch of branches) {
    const code = `${branch.code}-MAIN`;

    const existing = await kitchenRepo.findOne({ where: { code }, withDeleted: true });

    if (existing) {
      // Restore soft-deleted record and sync fields
      existing.deleted_at = null;
      existing.deleted_by = null;
      existing.name = `Main Kitchen`;
      existing.branch_id = branch.id;
      existing.location = 'Back of house';
      existing.description = `Main kitchen for ${branch.name}`;
      existing.is_active = true;
      existing.status = 'active';
      existing.sort_order = 0;
      await kitchenRepo.save(existing);
      console.log(`🔄 Kitchen updated/restored: ${existing.name} (${branch.name})`);
    } else {
      const kitchen = kitchenRepo.create({
        name: 'Main Kitchen',
        code,
        branch_id: branch.id,
        location: 'Back of house',
        description: `Main kitchen for ${branch.name}`,
        is_active: true,
        status: 'active',
        sort_order: 0,
      });
      await kitchenRepo.save(kitchen);
      seeded += 1;
      console.log(`✅ Kitchen seeded: ${kitchen.name} (${branch.name})`);
    }
  }

  if (seeded > 0) {
    console.log(`✅ Kitchens seed done — ${seeded} new kitchen(s)`);
  }
}
