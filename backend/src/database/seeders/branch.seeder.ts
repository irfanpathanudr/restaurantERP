import { DataSource } from 'typeorm';
import { Branch } from '../entities/Branch.entity';
import { Restaurant } from '../entities/Restaurant.entity';

export async function seedBranches(dataSource: DataSource): Promise<void> {
  const branchRepo = dataSource.getRepository(Branch);
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurant = await restaurantRepo.findOne({ where: { code: 'REST001' } });

  if (!restaurant) {
    console.log('⚠️  Restaurant not found. Please seed restaurants first.');
    return;
  }

  const branches = [
    {
      name: 'Udaipur Zayka - Main Branch',
      code: 'BR001',
      restaurant_id: restaurant.id,
      phone: '+919876543210',
      email: 'main@udaipurzayka.com',
      address: 'Main Market Road',
      city: 'Udaipur',
      state: 'Rajasthan',
      pincode: '313001',
      country: 'India',
      is_active: true,
    },
  ];

  for (const data of branches) {
    // withDeleted so soft-deleted records don't cause duplicate key errors
    const existing = await branchRepo.findOne({
      where: { code: data.code },
      withDeleted: true,
    });

    if (existing) {
      Object.assign(existing, data);
      existing.deleted_at = null;
      existing.deleted_by = null;
      await branchRepo.save(existing);
      console.log(`🔄 Branch updated/restored: ${data.name}`);
    } else {
      const branch = branchRepo.create(data);
      await branchRepo.save(branch);
      console.log(`✅ Branch seeded: ${data.name}`);
    }
  }
}
