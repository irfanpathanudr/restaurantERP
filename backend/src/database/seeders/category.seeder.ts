import { DataSource } from 'typeorm';
import { Category } from '../entities/Category.entity';

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(Category);

  const categories = [
    { name: 'Appetizers', code: 'CAT001', description: 'Starters and small plates', is_active: true },
    { name: 'Soups & Salads', code: 'CAT002', description: 'Fresh soups and salads', is_active: true },
    { name: 'Pasta', code: 'CAT003', description: 'Authentic Italian pasta dishes', is_active: true },
    { name: 'Pizza', code: 'CAT004', description: 'Wood-fired pizzas', is_active: true },
    { name: 'Main Course', code: 'CAT005', description: 'Main entrees and dishes', is_active: true },
    { name: 'Seafood', code: 'CAT006', description: 'Fresh seafood selections', is_active: true },
    { name: 'Desserts', code: 'CAT007', description: 'Sweet treats and desserts', is_active: true },
    { name: 'Beverages', code: 'CAT008', description: 'Drinks and beverages', is_active: true },
    { name: 'Wine', code: 'CAT009', description: 'Wine selection', is_active: true },
    { name: 'Cocktails', code: 'CAT010', description: 'Signature cocktails', is_active: true },
  ];

  for (const categoryData of categories) {
    const exists = await categoryRepo.findOne({
      where: { code: categoryData.code },
    });
    if (!exists) {
      const category = categoryRepo.create(categoryData);
      await categoryRepo.save(category);
      console.log(`✅ Category seeded: ${category.name}`);
    }
  }
}
