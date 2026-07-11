import { DataSource } from 'typeorm';
import { RawMaterial } from '../entities/RawMaterial.entity';

export async function seedRawMaterials(dataSource: DataSource): Promise<void> {
  const rawMaterialRepo = dataSource.getRepository(RawMaterial);

  const materials = [
    // Vegetables
    { name: 'Tomatoes', material_code: 'RM001', unit: 'kg', current_stock: 50, min_stock: 20, max_stock: 100, unit_price: 3.50 },
    { name: 'Lettuce', material_code: 'RM002', unit: 'kg', current_stock: 30, min_stock: 10, max_stock: 50, unit_price: 2.50 },
    { name: 'Onions', material_code: 'RM003', unit: 'kg', current_stock: 40, min_stock: 15, max_stock: 80, unit_price: 2.00 },
    { name: 'Garlic', material_code: 'RM004', unit: 'kg', current_stock: 15, min_stock: 5, max_stock: 30, unit_price: 5.00 },
    { name: 'Basil', material_code: 'RM005', unit: 'kg', current_stock: 5, min_stock: 2, max_stock: 10, unit_price: 12.00 },
    { name: 'Bell Peppers', material_code: 'RM006', unit: 'kg', current_stock: 25, min_stock: 10, max_stock: 50, unit_price: 4.00 },
    
    // Meats & Seafood
    { name: 'Chicken Breast', material_code: 'RM007', unit: 'kg', current_stock: 35, min_stock: 15, max_stock: 70, unit_price: 8.50 },
    { name: 'Ground Beef', material_code: 'RM008', unit: 'kg', current_stock: 40, min_stock: 20, max_stock: 80, unit_price: 10.00 },
    { name: 'Salmon Fillet', material_code: 'RM009', unit: 'kg', current_stock: 20, min_stock: 10, max_stock: 40, unit_price: 18.00 },
    { name: 'Shrimp', material_code: 'RM010', unit: 'kg', current_stock: 15, min_stock: 8, max_stock: 30, unit_price: 22.00 },
    { name: 'Veal', material_code: 'RM011', unit: 'kg', current_stock: 10, min_stock: 5, max_stock: 20, unit_price: 25.00 },
    { name: 'Bacon', material_code: 'RM012', unit: 'kg', current_stock: 12, min_stock: 5, max_stock: 25, unit_price: 12.00 },
    
    // Dairy
    { name: 'Mozzarella Cheese', material_code: 'RM013', unit: 'kg', current_stock: 30, min_stock: 15, max_stock: 60, unit_price: 9.00 },
    { name: 'Parmesan Cheese', material_code: 'RM014', unit: 'kg', current_stock: 15, min_stock: 8, max_stock: 30, unit_price: 15.00 },
    { name: 'Ricotta Cheese', material_code: 'RM015', unit: 'kg', current_stock: 10, min_stock: 5, max_stock: 20, unit_price: 7.50 },
    { name: 'Heavy Cream', material_code: 'RM016', unit: 'liter', current_stock: 20, min_stock: 10, max_stock: 40, unit_price: 4.50 },
    { name: 'Butter', material_code: 'RM017', unit: 'kg', current_stock: 15, min_stock: 8, max_stock: 30, unit_price: 6.00 },
    { name: 'Eggs', material_code: 'RM018', unit: 'dozen', current_stock: 40, min_stock: 20, max_stock: 80, unit_price: 3.50 },
    
    // Pasta & Grains
    { name: 'Spaghetti', material_code: 'RM019', unit: 'kg', current_stock: 50, min_stock: 25, max_stock: 100, unit_price: 2.50 },
    { name: 'Penne', material_code: 'RM020', unit: 'kg', current_stock: 45, min_stock: 20, max_stock: 90, unit_price: 2.50 },
    { name: 'Fettuccine', material_code: 'RM021', unit: 'kg', current_stock: 35, min_stock: 15, max_stock: 70, unit_price: 3.00 },
    { name: 'Lasagna Sheets', material_code: 'RM022', unit: 'kg', current_stock: 20, min_stock: 10, max_stock: 40, unit_price: 3.50 },
    { name: 'Arborio Rice', material_code: 'RM023', unit: 'kg', current_stock: 25, min_stock: 10, max_stock: 50, unit_price: 4.00 },
    { name: 'Pizza Dough', material_code: 'RM024', unit: 'kg', current_stock: 30, min_stock: 15, max_stock: 60, unit_price: 1.50 },
    
    // Sauces & Condiments
    { name: 'Tomato Sauce', material_code: 'RM025', unit: 'liter', current_stock: 40, min_stock: 20, max_stock: 80, unit_price: 3.00 },
    { name: 'Olive Oil', material_code: 'RM026', unit: 'liter', current_stock: 35, min_stock: 15, max_stock: 70, unit_price: 12.00 },
    { name: 'Balsamic Vinegar', material_code: 'RM027', unit: 'liter', current_stock: 10, min_stock: 5, max_stock: 20, unit_price: 8.00 },
    { name: 'Red Wine', material_code: 'RM028', unit: 'liter', current_stock: 15, min_stock: 8, max_stock: 30, unit_price: 10.00 },
    { name: 'White Wine', material_code: 'RM029', unit: 'liter', current_stock: 12, min_stock: 6, max_stock: 24, unit_price: 9.00 },
    
    // Dessert Ingredients
    { name: 'Flour', material_code: 'RM030', unit: 'kg', current_stock: 60, min_stock: 30, max_stock: 120, unit_price: 1.50 },
    { name: 'Sugar', material_code: 'RM031', unit: 'kg', current_stock: 40, min_stock: 20, max_stock: 80, unit_price: 2.00 },
    { name: 'Cocoa Powder', material_code: 'RM032', unit: 'kg', current_stock: 8, min_stock: 4, max_stock: 16, unit_price: 15.00 },
    { name: 'Vanilla Extract', material_code: 'RM033', unit: 'liter', current_stock: 3, min_stock: 1, max_stock: 6, unit_price: 35.00 },
    { name: 'Mascarpone Cheese', material_code: 'RM034', unit: 'kg', current_stock: 8, min_stock: 4, max_stock: 16, unit_price: 12.00 },
    { name: 'Coffee Beans', material_code: 'RM035', unit: 'kg', current_stock: 10, min_stock: 5, max_stock: 20, unit_price: 18.00 },
  ];

  for (const materialData of materials) {
    const exists = await rawMaterialRepo.findOne({
      where: { material_code: materialData.material_code },
    });
    if (!exists) {
      const material = rawMaterialRepo.create(materialData);
      await rawMaterialRepo.save(material);
      console.log(`✅ Raw material seeded: ${material.name}`);
    }
  }
}
