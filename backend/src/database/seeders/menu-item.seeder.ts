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
    { name: 'Bruschetta', sku: 'APP001', category_id: getCategoryByName('Appetizers')?.id, price: 8.99, cost_price: 3.50, description: 'Toasted bread with tomatoes and basil', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' },
    { name: 'Calamari Fritti', sku: 'APP002', category_id: getCategoryByName('Appetizers')?.id, price: 12.99, cost_price: 5.00, description: 'Fried calamari with marinara sauce', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
    { name: 'Caprese Salad', sku: 'APP003', category_id: getCategoryByName('Appetizers')?.id, price: 10.99, cost_price: 4.00, description: 'Fresh mozzarella, tomatoes, and basil', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400' },
    
    // Soups & Salads
    { name: 'Minestrone Soup', sku: 'SOUP001', category_id: getCategoryByName('Soups & Salads')?.id, price: 7.99, cost_price: 2.50, description: 'Traditional Italian vegetable soup', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400' },
    { name: 'Caesar Salad', sku: 'SAL001', category_id: getCategoryByName('Soups & Salads')?.id, price: 9.99, cost_price: 3.00, description: 'Romaine lettuce with Caesar dressing', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
    { name: 'Greek Salad', sku: 'SAL002', category_id: getCategoryByName('Soups & Salads')?.id, price: 10.99, cost_price: 3.50, description: 'Mixed greens with feta cheese', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
    
    // Pasta
    { name: 'Spaghetti Carbonara', sku: 'PASTA001', category_id: getCategoryByName('Pasta')?.id, price: 16.99, cost_price: 6.00, description: 'Spaghetti with bacon and cream sauce', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400' },
    { name: 'Fettuccine Alfredo', sku: 'PASTA002', category_id: getCategoryByName('Pasta')?.id, price: 15.99, cost_price: 5.50, description: 'Fettuccine with creamy Alfredo sauce', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400' },
    { name: 'Penne Arrabbiata', sku: 'PASTA003', category_id: getCategoryByName('Pasta')?.id, price: 14.99, cost_price: 5.00, description: 'Penne with spicy tomato sauce', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
    { name: 'Lasagna Bolognese', sku: 'PASTA004', category_id: getCategoryByName('Pasta')?.id, price: 18.99, cost_price: 7.00, description: 'Layered pasta with meat sauce', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400' },
    { name: 'Ravioli Ricotta', sku: 'PASTA005', category_id: getCategoryByName('Pasta')?.id, price: 17.99, cost_price: 6.50, description: 'Ricotta filled ravioli', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=400' },
    
    // Pizza
    { name: 'Margherita Pizza', sku: 'PIZZA001', category_id: getCategoryByName('Pizza')?.id, price: 13.99, cost_price: 4.50, description: 'Tomato, mozzarella, and basil', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
    { name: 'Pepperoni Pizza', sku: 'PIZZA002', category_id: getCategoryByName('Pizza')?.id, price: 15.99, cost_price: 5.50, description: 'Classic pepperoni pizza', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
    { name: 'Quattro Formaggi', sku: 'PIZZA003', category_id: getCategoryByName('Pizza')?.id, price: 17.99, cost_price: 6.50, description: 'Four cheese pizza', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400' },
    { name: 'Hawaiian Pizza', sku: 'PIZZA004', category_id: getCategoryByName('Pizza')?.id, price: 16.99, cost_price: 6.00, description: 'Ham and pineapple pizza', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
    
    // Main Course
    { name: 'Chicken Parmigiana', sku: 'MAIN001', category_id: getCategoryByName('Main Course')?.id, price: 19.99, cost_price: 8.00, description: 'Breaded chicken with marinara', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400' },
    { name: 'Veal Marsala', sku: 'MAIN002', category_id: getCategoryByName('Main Course')?.id, price: 24.99, cost_price: 10.00, description: 'Veal with Marsala wine sauce', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400' },
    { name: 'Osso Buco', sku: 'MAIN003', category_id: getCategoryByName('Main Course')?.id, price: 28.99, cost_price: 12.00, description: 'Braised veal shanks', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
    
    // Seafood
    { name: 'Grilled Salmon', sku: 'SEA001', category_id: getCategoryByName('Seafood')?.id, price: 22.99, cost_price: 10.00, description: 'Fresh Atlantic salmon', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400' },
    { name: 'Shrimp Scampi', sku: 'SEA002', category_id: getCategoryByName('Seafood')?.id, price: 21.99, cost_price: 9.50, description: 'Shrimp in garlic butter sauce', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b2?w=400' },
    { name: 'Seafood Risotto', sku: 'SEA003', category_id: getCategoryByName('Seafood')?.id, price: 23.99, cost_price: 10.50, description: 'Creamy risotto with mixed seafood', is_available: true, food_type: 'non_veg', image: 'https://images.unsplash.com/photo-1476124369491-c4298c5dea0e?w=400' },
    
    // Desserts
    { name: 'Tiramisu', sku: 'DES001', category_id: getCategoryByName('Desserts')?.id, price: 8.99, cost_price: 3.00, description: 'Classic Italian coffee dessert', is_available: true, food_type: 'egg', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
    { name: 'Panna Cotta', sku: 'DES002', category_id: getCategoryByName('Desserts')?.id, price: 7.99, cost_price: 2.50, description: 'Italian cream custard', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
    { name: 'Gelato', sku: 'DES003', category_id: getCategoryByName('Desserts')?.id, price: 6.99, cost_price: 2.00, description: 'Italian ice cream', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
    { name: 'Cannoli', sku: 'DES004', category_id: getCategoryByName('Desserts')?.id, price: 7.99, cost_price: 2.50, description: 'Sicilian pastry', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=400' },
    
    // Beverages
    { name: 'Espresso', sku: 'BEV001', category_id: getCategoryByName('Beverages')?.id, price: 3.99, cost_price: 0.50, description: 'Italian espresso', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
    { name: 'Cappuccino', sku: 'BEV002', category_id: getCategoryByName('Beverages')?.id, price: 4.99, cost_price: 0.75, description: 'Espresso with steamed milk', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
    { name: 'Italian Soda', sku: 'BEV003', category_id: getCategoryByName('Beverages')?.id, price: 3.99, cost_price: 0.50, description: 'Flavored soda water', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1546171753-97d7676e9da8?w=400' },
    { name: 'Fresh Lemonade', sku: 'BEV004', category_id: getCategoryByName('Beverages')?.id, price: 3.99, cost_price: 0.75, description: 'Freshly squeezed lemonade', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9f?w=400' },
    
    // Wine
    { name: 'Chianti Classico', sku: 'WINE001', category_id: getCategoryByName('Wine')?.id, price: 45.00, cost_price: 18.00, description: 'Red wine from Tuscany', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
    { name: 'Pinot Grigio', sku: 'WINE002', category_id: getCategoryByName('Wine')?.id, price: 38.00, cost_price: 15.00, description: 'White wine from Veneto', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400' },
    { name: 'Prosecco', sku: 'WINE003', category_id: getCategoryByName('Wine')?.id, price: 42.00, cost_price: 16.00, description: 'Italian sparkling wine', is_available: true, food_type: 'veg', image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400' },
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
