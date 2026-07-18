import { DataSource } from 'typeorm';
import { Kitchen } from '../entities/Kitchen.entity';
import { Branch } from '../entities/Branch.entity';

export async function seedKitchens(dataSource: DataSource): Promise<void> {
  const kitchenRepo = dataSource.getRepository(Kitchen);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find({ order: { code: 'ASC' } });
  if (branches.length === 0) {
    console.log('⚠️ Branches not found. Please seed branches first.');
    return;
  }

  const templates = [
    { name: 'Main Kitchen', codeSuffix: 'MAIN', location: 'Back of house' },
    { name: 'Tandoor / Grill', codeSuffix: 'GRILL', location: 'Hot line' },
    { name: 'Beverage Station', codeSuffix: 'BEV', location: 'Bar' },
  ];

  let seeded = 0;

  for (const branch of branches) {
    for (const tmpl of templates) {
      const code = `${branch.code}-${tmpl.codeSuffix}`;
      const exists = await kitchenRepo.findOne({ where: { code } });
      if (exists) continue;

      const kitchen = kitchenRepo.create({
        name: `${tmpl.name} (${branch.name})`,
        code,
        branch_id: branch.id,
        location: tmpl.location,
        description: `${tmpl.name} for ${branch.name}`,
        is_active: true,
        status: 'active',
        sort_order: seeded,
      });
      await kitchenRepo.save(kitchen);
      seeded += 1;
      console.log(`✅ Kitchen seeded: ${kitchen.name}`);
    }
  }

  console.log(`✅ Kitchens seed done — ${seeded} new kitchen(s)`);
}
