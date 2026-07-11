import { DataSource } from 'typeorm';
import { Restaurant } from '../entities/Restaurant.entity';

export async function seedRestaurants(dataSource: DataSource): Promise<void> {
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurants = [
    {
      name: 'Italian Bistro Main',
      code: 'REST001',
      phone: '+1234567890',
      email: 'main@italianbistro.com',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      country: 'USA',
      website: 'https://italianbistro.com',
      gst_number: 'GST123456',
      pan_number: 'PAN123456',
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York',
      is_active: true,
    },
    {
      name: 'Italian Bistro Downtown',
      code: 'REST002',
      phone: '+1234567891',
      email: 'downtown@italianbistro.com',
      address: '456 Downtown Ave',
      city: 'Los Angeles',
      state: 'CA',
      pincode: '90001',
      country: 'USA',
      website: 'https://italianbistro.com',
      gst_number: 'GST123457',
      pan_number: 'PAN123457',
      currency: 'USD',
      language: 'en',
      timezone: 'America/Los_Angeles',
      is_active: true,
    },
  ];

  for (const restaurantData of restaurants) {
    const exists = await restaurantRepo.findOne({
      where: { code: restaurantData.code },
    });
    if (!exists) {
      const restaurant = restaurantRepo.create(restaurantData);
      await restaurantRepo.save(restaurant);
      console.log(`✅ Restaurant seeded: ${restaurant.name}`);
    }
  }
}
