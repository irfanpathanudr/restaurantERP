import { DataSource } from 'typeorm';
import { Restaurant } from '../entities/Restaurant.entity';

export async function seedRestaurants(dataSource: DataSource): Promise<void> {
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurants = [
    {
      name: 'Udaipur Zayka',
      code: 'REST001',
      phone: '+919876543210',
      email: 'info@udaipurzayka.com',
      address: 'Main Market Road',
      city: 'Udaipur',
      state: 'Rajasthan',
      pincode: '313001',
      country: 'India',
      website: null,
      gst_number: null,
      pan_number: null,
      currency: 'INR',
      language: 'en',
      timezone: 'Asia/Kolkata',
      is_active: true,
    },
  ];

  for (const data of restaurants) {
    // Use withDeleted so soft-deleted duplicates are also found and restored
    const existing = await restaurantRepo.findOne({
      where: { code: data.code },
      withDeleted: true,
    });

    if (existing) {
      // Restore if soft-deleted and update fields
      Object.assign(existing, data);
      existing.deleted_at = null;
      existing.deleted_by = null;
      await restaurantRepo.save(existing);
      console.log(`🔄 Restaurant updated/restored: ${data.name}`);
    } else {
      const restaurant = restaurantRepo.create(data);
      await restaurantRepo.save(restaurant);
      console.log(`✅ Restaurant seeded: ${data.name}`);
    }
  }
}
