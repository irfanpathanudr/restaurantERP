import { DataSource } from 'typeorm';
import { MenuItem } from '../entities/MenuItem.entity';
import { Category } from '../entities/Category.entity';

export async function seedMenuItems(dataSource: DataSource): Promise<void> {
  const menuItemRepo = dataSource.getRepository(MenuItem);
  const categoryRepo = dataSource.getRepository(Category);

  const categories = await categoryRepo.find();
  if (categories.length === 0) {
    console.log('⚠️ Categories not found. Please seed categories first.');
    return;
  }

  const getCategoryByName = (name: string) => categories.find(c => c.name === name);

  const menuItems = [
    // Appetizers
    { name: 'Bruschetta', sku: 'APP001', category_id: getCategoryByName('Appetizers')?.id, price: 8.99, cost_price: 3.50, description: 'Toasted bread with tomatoes and basil', is_available: true, food_type: 'veg' },
    { name: 'Calamari Fritti', sku: 'APP002', category_id: getCategoryByName('Appetizers')?.id, price: 12.99, cost_price: 5.00, description: 'Fried calamari with marinara sauce', is_available: true, food_type: 'non_veg' },
    { name: 'Caprese Salad', sku: 'APP003', category_id: getCategoryByName('Appetizers')?.id, price: 10.99, cost_price: 4.00, description: 'Fresh mozzarella, tomatoes, and basil', is_available: true, food_type: 'veg' },
    
    // Soups & Salads
    { name: 'Minestrone Soup', sku: 'SOUP001', category_id: getCategoryByName('Soups & Salads')?.id, price: 7.99, cost_price: 2.50, description: 'Traditional Italian vegetable soup', is_available: true, food_type: 'veg' },
    { name: 'Caesar Salad', sku: 'SAL001', category_id: getCategoryByName('Soups & Salads')?.id, price: 9.99, cost_price: 3.00, description: 'Romaine lettuce with Caesar dressing', is_available: true, food_type: 'veg' },
    { name: 'Greek Salad', sku: 'SAL002', category_id: getCategoryByName('Soups & Salads')?.id, price: 10.99, cost_price: 3.50, description: 'Mixed greens with feta cheese', is_available: true, food_type: 'veg' },
    
    // Pasta
    { name: 'Spaghetti Carbonara', sku: 'PASTA001', category_id: getCategoryByName('Pasta')?.id, price: 16.99, cost_price: 6.00, description: 'Spaghetti with bacon and cream sauce', is_available: true, food_type: 'non_veg' },
    { name: 'Fettuccine Alfredo', sku: 'PASTA002', category_id: getCategoryByName('Pasta')?.id, price: 15.99, cost_price: 5.50, description: 'Fettuccine with creamy Alfredo sauce', is_available: true, food_type: 'veg' },
    { name: 'Penne Arrabbiata', sku: 'PASTA003', category_id: getCategoryByName('Pasta')?.id, price: 14.99, cost_price: 5.00, description: 'Penne with spicy tomato sauce', is_available: true, food_type: 'veg' },
    { name: 'Lasagna Bolognese', sku: 'PASTA004', category_id: getCategoryByName('Pasta')?.id, price: 18.99, cost_price: 7.00, description: 'Layered pasta with meat sauce', is_available: true, food_type: 'non_veg' },
    { name: 'Ravioli Ricotta', sku: 'PASTA005', category_id: getCategoryByName('Pasta')?.id, price: 17.99, cost_price: 6.50, description: 'Ricotta filled ravioli', is_available: true, food_type: 'veg' },
    
    // Pizza
    { name: 'Margherita Pizza', sku: 'PIZZA001', category_id: getCategoryByName('Pizza')?.id, price: 13.99, cost_price: 4.50, description: 'Tomato, mozzarella, and basil', is_available: true, food_type: 'veg' },
    { name: 'Pepperoni Pizza', sku: 'PIZZA002', category_id: getCategoryByName('Pizza')?.id, price: 15.99, cost_price: 5.50, description: 'Classic pepperoni pizza', is_available: true, food_type: 'non_veg' },
    { name: 'Quattro Formaggi', sku: 'PIZZA003', category_id: getCategoryByName('Pizza')?.id, price: 17.99, cost_price: 6.50, description: 'Four cheese pizza', is_available: true, food_type: 'veg' },
    { name: 'Hawaiian Pizza', sku: 'PIZZA004', category_id: getCategoryByName('Pizza')?.id, price: 16.99, cost_price: 6.00, description: 'Ham and pineapple pizza', is_available: true, food_type: 'non_veg' },
    
    // Main Course
    { name: 'Chicken Parmigiana', sku: 'MAIN001', category_id: getCategoryByName('Main Course')?.id, price: 19.99, cost_price: 8.00, description: 'Breaded chicken with marinara', is_available: true, food_type: 'non_veg' },
    { name: 'Veal Marsala', sku: 'MAIN002', category_id: getCategoryByName('Main Course')?.id, price: 24.99, cost_price: 10.00, description: 'Veal with Marsala wine sauce', is_available: true, food_type: 'non_veg' },
    { name: 'Osso Buco', sku: 'MAIN003', category_id: getCategoryByName('Main Course')?.id, price: 28.99, cost_price: 12.00, description: 'Braised veal shanks', is_available: true, food_type: 'non_veg' },
    
    // Seafood
    { name: 'Grilled Salmon', sku: 'SEA001', category_id: getCategoryByName('Seafood')?.id, price: 22.99, cost_price: 10.00, description: 'Fresh Atlantic salmon', is_available: true, food_type: 'non_veg' },
    { name: 'Shrimp Scampi', sku: 'SEA002', category_id: getCategoryByName('Seafood')?.id, price: 21.99, cost_price: 9.50, description: 'Shrimp in garlic butter sauce', is_available: true, food_type: 'non_veg' },
    { name: 'Seafood Risotto', sku: 'SEA003', category_id: getCategoryByName('Seafood')?.id, price: 23.99, cost_price: 10.50, description: 'Creamy risotto with mixed seafood', is_available: true, food_type: 'non_veg' },
    
    // Desserts
    { name: 'Tiramisu', sku: 'DES001', category_id: getCategoryByName('Desserts')?.id, price: 8.99, cost_price: 3.00, description: 'Classic Italian coffee dessert', is_available: true, food_type: 'egg' },
    { name: 'Panna Cotta', sku: 'DES002', category_id: getCategoryByName('Desserts')?.id, price: 7.99, cost_price: 2.50, description: 'Italian cream custard', is_available: true, food_type: 'veg' },
    { name: 'Gelato', sku: 'DES003', category_id: getCategoryByName('Desserts')?.id, price: 6.99, cost_price: 2.00, description: 'Italian ice cream', is_available: true, food_type: 'veg' },
    { name: 'Cannoli', sku: 'DES004', category_id: getCategoryByName('Desserts')?.id, price: 7.99, cost_price: 2.50, description: 'Sicilian pastry', is_available: true, food_type: 'veg' },
    
    // Beverages
    { name: 'Espresso', sku: 'BEV001', category_id: getCategoryByName('Beverages')?.id, price: 3.99, cost_price: 0.50, description: 'Italian espresso', is_available: true, food_type: 'veg' },
    { name: 'Cappuccino', sku: 'BEV002', category_id: getCategoryByName('Beverages')?.id, price: 4.99, cost_price: 0.75, description: 'Espresso with steamed milk', is_available: true, food_type: 'veg' },
    { name: 'Italian Soda', sku: 'BEV003', category_id: getCategoryByName('Beverages')?.id, price: 3.99, cost_price: 0.50, description: 'Flavored soda water', is_available: true, food_type: 'veg' },
    { name: 'Fresh Lemonade', sku: 'BEV004', category_id: getCategoryByName('Beverages')?.id, price: 3.99, cost_price: 0.75, description: 'Freshly squeezed lemonade', is_available: true, food_type: 'veg' },
    
    // Wine
    { name: 'Chianti Classico', sku: 'WINE001', category_id: getCategoryByName('Wine')?.id, price: 45.00, cost_price: 18.00, description: 'Red wine from Tuscany', is_available: true, food_type: 'veg' },
    { name: 'Pinot Grigio', sku: 'WINE002', category_id: getCategoryByName('Wine')?.id, price: 38.00, cost_price: 15.00, description: 'White wine from Veneto', is_available: true, food_type: 'veg' },
    { name: 'Prosecco', sku: 'WINE003', category_id: getCategoryByName('Wine')?.id, price: 42.00, cost_price: 16.00, description: 'Italian sparkling wine', is_available: true, food_type: 'veg' },
  ];

  for (const itemData of menuItems) {
    if (!itemData.category_id) continue;
    
    const exists = await menuItemRepo.findOne({
      where: { sku: itemData.sku },
    });
    if (!exists) {
      const menuItem = menuItemRepo.create(itemData);
      await menuItemRepo.save(menuItem);
      console.log(`✅ Menu item seeded: ${menuItem.name}`);
    }
  }
}
