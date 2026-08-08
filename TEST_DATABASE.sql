-- ================================
-- DATABASE VERIFICATION SCRIPT
-- Run this to check your database
-- ================================

-- Use this command to run:
-- mysql -u root -p < TEST_DATABASE.sql
-- or copy-paste into MySQL console

-- 1. Show all databases
SHOW DATABASES;

-- 2. Use restaurant database
USE restaurant_erp;

-- 3. Show all tables
SHOW TABLES;

-- 4. Count records in each table
SELECT 'Categories' as Table_Name, COUNT(*) as Record_Count FROM categories
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'Menu Items with Images', COUNT(*) FROM menu_items WHERE image IS NOT NULL
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Branches', COUNT(*) FROM branches
UNION ALL
SELECT 'Tables', COUNT(*) FROM tables
UNION ALL
SELECT 'Kitchens', COUNT(*) FROM kitchens;

-- 5. Show sample menu items with images
SELECT 
    id,
    name,
    sku,
    price,
    food_type,
    is_available,
    CASE 
        WHEN image IS NOT NULL THEN 'YES' 
        ELSE 'NO' 
    END as Has_Image
FROM menu_items 
LIMIT 10;

-- 6. Show categories
SELECT id, name, is_active FROM categories;

-- 7. Check admin user exists
SELECT id, email, first_name, last_name, is_active FROM users;

-- 8. Show menu items by category
SELECT 
    c.name as Category,
    COUNT(m.id) as Item_Count
FROM categories c
LEFT JOIN menu_items m ON c.id = m.category_id
GROUP BY c.id, c.name
ORDER BY c.name;
