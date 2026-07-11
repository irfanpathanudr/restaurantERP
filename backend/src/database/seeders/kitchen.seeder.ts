import { DataSource } from 'typeorm';
import { Kitchen } from '../entities/Kitchen.entity';
import { Branch } from '../entities/Branch.entity';

export async function seedKitchens(dataSource: DataSource): Promise<void> {
  const kitchenRepo = dataSource.getRepository(Kitchen);
  const branchRepo = dataSource.getRepository(Branch);

  const branches = await branchRepo.find();
  if (branches.length === 0) {
    console.log('⚠️ Branches not found. Please seed branches first.');
    return;
  }

  const kitchens = [
    {
      name: 'Main Kitchen',
      code: 'KIT001',
      branch_id: branches[0].id,
      is_active: true,
    },
    {
      name: 'Dessert Station',
      code: 'KIT002',
      branch_id: branches[0].id,
      is_active: true,
    },
    {
      name: 'Beverage Station',
      code: 'KIT003',
      branch_id: branches[0].id,
      is_active: true,
    },
    {
      name: 'Main Kitchen - Floor 2',
      code: 'KIT004',
      branch_id: branches[1]?.id || branches[0].id,
      is_active: true,
    },
  ];

  for (const kitchenData of kitchens) {
    const exists = await kitchenRepo.findOne({
      where: { code: kitchenData.code },
    });
    if (!exists) {
      const kitchen = kitchenRepo.create(kitchenData);
      await kitchenRepo.save(kitchen);
      console.log(`✅ Kitchen seeded: ${kitchen.name}`);
    }
  }
}
