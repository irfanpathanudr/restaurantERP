import { DataSource } from 'typeorm';
import { RawMaterial } from '../entities/RawMaterial.entity';

export async function seedRawMaterials(dataSource: DataSource): Promise<void> {
  const rawMaterialRepo = dataSource.getRepository(RawMaterial);

  const materials = [
    // Vegetables
    { name: 'Tomatoes', code: 'RM001', unit: 'kg', current_stock: 50, minimum_stock: 20, maximum_stock: 100, cost_per_unit: 3.50 },
    { name: 'Lettuce', code: 'RM002', unit: 'kg', current_stock: 30, minimum_stock: 10, maximum_stock: 50, cost_per_unit: 2.50 },
    { name: 'Onions', code: 'RM003', unit: 'kg', current_stock: 40, minimum_stock: 15, maximum_stock: 80, cost_per_unit: 2.00 },
    { name: 'Garlic', code: 'RM004', unit: 'kg', current_stock: 15, minimum_stock: 5, maximum_stock: 30, cost_per_unit: 5.00 },
    { name: 'Basil', code: 'RM005', unit: 'kg', current_stock: 5, minimum_stock: 2, maximum_stock: 10, cost_per_unit: 12.00 },
    { name: 'Bell Peppers', code: 'RM006', unit: 'kg', current_stock: 25, minimum_stock: 10, maximum_stock: 50, cost_per_unit: 4.00 },
    
    // Meats & Seafood
    { name: 'Chicken Breast', code: 'RM007', unit: 'kg', current_stock: 35, minimum_stock: 15, maximum_stock: 70, cost_per_unit: 8.50 },
    { name: 'Ground Beef', code: 'RM008', unit: 'kg', current_stock: 40, minimum_stock: 20, maximum_stock: 80, cost_per_unit: 10.00 },
    { name: 'Salmon Fillet', code: 'RM009', unit: 'kg', current_stock: 20, minimum_stock: 10, maximum_stock: 40, cost_per_unit: 18.00 },
    { name: 'Shrimp', code: 'RM010', unit: 'kg', current_stock: 15, minimum_stock: 8, maximum_stock: 30, cost_per_unit: 22.00 },
    { name: 'Veal', code: 'RM011', unit: 'kg', current_stock: 10, minimum_stock: 5, maximum_stock: 20, cost_per_unit: 25.00 },
    { name: 'Bacon', code: 'RM012', unit: 'kg', current_stock: 12, minimum_stock: 5, maximum_stock: 25, cost_per_unit: 12.00 },
    
    // Dairy
    { name: 'Mozzarella Cheese', code: 'RM013', unit: 'kg', current_stock: 30, minimum_stock: 15, maximum_stock: 60, cost_per_unit: 9.00 },
    { name: 'Parmesan Cheese', code: 'RM014', unit: 'kg', current_stock: 15, minimum_stock: 8, maximum_stock: 30, cost_per_unit: 15.00 },
    { name: 'Ricotta Cheese', code: 'RM015', unit: 'kg', current_stock: 10, minimum_stock: 5, maximum_stock: 20, cost_per_unit: 7.50 },
    { name: 'Heavy Cream', code: 'RM016', unit: 'liter', current_stock: 20, minimum_stock: 10, maximum_stock: 40, cost_per_unit: 4.50 },
    { name: 'Butter', code: 'RM017', unit: 'kg', current_stock: 15, minimum_stock: 8, maximum_stock: 30, cost_per_unit: 6.00 },
    { name: 'Eggs', code: 'RM018', unit: 'dozen', current_stock: 40, minimum_stock: 20, maximum_stock: 80, cost_per_unit: 3.50 },
    
    // Pasta & Grains
    { name: 'Spaghetti', code: 'RM019', unit: 'kg', current_stock: 50, minimum_stock: 25, maximum_stock: 100, cost_per_unit: 2.50 },
    { name: 'Penne', code: 'RM020', unit: 'kg', current_stock: 45, minimum_stock: 20, maximum_stock: 90, cost_per_unit: 2.50 },
    { name: 'Fettuccine', code: 'RM021', unit: 'kg', current_stock: 35, minimum_stock: 15, maximum_stock: 70, cost_per_unit: 3.00 },
    { name: 'Lasagna Sheets', code: 'RM022', unit: 'kg', current_stock: 20, minimum_stock: 10, maximum_stock: 40, cost_per_unit: 3.50 },
    { name: 'Arborio Rice', code: 'RM023', unit: 'kg', current_stock: 25, minimum_stock: 10, maximum_stock: 50, cost_per_unit: 4.00 },
    { name: 'Pizza Dough', code: 'RM024', unit: 'kg', current_stock: 30, minimum_stock: 15, maximum_stock: 60, cost_per_unit: 1.50 },
    
    // Sauces & Condiments
    { name: 'Tomato Sauce', code: 'RM025', unit: 'liter', current_stock: 40, minimum_stock: 20, maximum_stock: 80, cost_per_unit: 3.00 },
    { name: 'Olive Oil', code: 'RM026', unit: 'liter', current_stock: 35, minimum_stock: 15, maximum_stock: 70, cost_per_unit: 12.00 },
    { name: 'Balsamic Vinegar', code: 'RM027', unit: 'liter', current_stock: 10, minimum_stock: 5, maximum_stock: 20, cost_per_unit: 8.00 },
    { name: 'Red Wine', code: 'RM028', unit: 'liter', current_stock: 15, minimum_stock: 8, maximum_stock: 30, cost_per_unit: 10.00 },
    { name: 'White Wine', code: 'RM029', unit: 'liter', current_stock: 12, minimum_stock: 6, maximum_stock: 24, cost_per_unit: 9.00 },
    
    // Dessert Ingredients
    { name: 'Flour', code: 'RM030', unit: 'kg', current_stock: 60, minimum_stock: 30, maximum_stock: 120, cost_per_unit: 1.50 },
    { name: 'Sugar', code: 'RM031', unit: 'kg', current_stock: 40, minimum_stock: 20, maximum_stock: 80, cost_per_unit: 2.00 },
    { name: 'Cocoa Powder', code: 'RM032', unit: 'kg', current_stock: 8, minimum_stock: 4, maximum_stock: 16, cost_per_unit: 15.00 },
    { name: 'Vanilla Extract', code: 'RM033', unit: 'liter', current_stock: 3, minimum_stock: 1, maximum_stock: 6, cost_per_unit: 35.00 },
    { name: 'Mascarpone Cheese', code: 'RM034', unit: 'kg', current_stock: 8, minimum_stock: 4, maximum_stock: 16, cost_per_unit: 12.00 },
    { name: 'Coffee Beans', code: 'RM035', unit: 'kg', current_stock: 10, minimum_stock: 5, maximum_stock: 20, cost_per_unit: 18.00 },
  ];

  for (const materialData of materials) {
    const exists = await rawMaterialRepo.findOne({
      where: { code: materialData.code },
    });
    if (!exists) {
      const material = rawMaterialRepo.create(materialData);
      await rawMaterialRepo.save(material);
      console.log(`✅ Raw material seeded: ${material.name}`);
    }
  }
}
