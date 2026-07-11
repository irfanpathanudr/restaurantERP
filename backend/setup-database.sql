-- Create database
CREATE DATABASE IF NOT EXISTS restaurant_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (if not exists)
CREATE USER IF NOT EXISTS 'restaurant_user'@'localhost' IDENTIFIED BY 'restaurant_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON restaurant_erp.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;

-- Show databases to confirm
SHOW DATABASES;

-- Use the database
USE restaurant_erp;

-- Show current database
SELECT DATABASE();
