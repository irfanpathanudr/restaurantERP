import { DataSource } from 'typeorm';
import { Branch } from '../entities/Branch.entity';
import { Restaurant } from '../entities/Restaurant.entity';

export async function seedBranches(dataSource: DataSource): Promise<void> {
  const branchRepo = dataSource.getRepository(Branch);
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurant1 = await restaurantRepo.findOne({ where: { code: 'REST001' } });
  const restaurant2 = await restaurantRepo.findOne({ where: { code: 'REST002' } });

  if (!restaurant1 || !restaurant2) {
    console.log('⚠️ Restaurants not found. Please seed restaurants first.');
    return;
  }

  const branches = [
    {
      name: 'Main Branch - Floor 1',
      code: 'BR001',
      restaurant_id: restaurant1.id,
      phone: '+1234567890',
      email: 'floor1@italianbistro.com',
      address: '123 Main Street, Floor 1',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      country: 'USA',
      is_active: true,
    },
    {
      name: 'Main Branch - Floor 2',
      code: 'BR002',
      restaurant_id: restaurant1.id,
      phone: '+1234567890',
      email: 'floor2@italianbistro.com',
      address: '123 Main Street, Floor 2',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      country: 'USA',
      is_active: true,
    },
    {
      name: 'Downtown Branch',
      code: 'BR003',
      restaurant_id: restaurant2.id,
      phone: '+1234567891',
      email: 'downtown@italianbistro.com',
      address: '456 Downtown Ave',
      city: 'Los Angeles',
      state: 'CA',
      pincode: '90001',
      country: 'USA',
      is_active: true,
    },
  ];

  for (const branchData of branches) {
    const exists = await branchRepo.findOne({
      where: { code: branchData.code },
    });
    if (!exists) {
      const branch = branchRepo.create(branchData);
      await branchRepo.save(branch);
      console.log(`✅ Branch seeded: ${branch.name}`);
    }
  }
}
