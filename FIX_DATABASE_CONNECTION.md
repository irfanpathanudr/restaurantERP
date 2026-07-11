# Fix Database Connection for Migrations

## 🔧 Issue
The migration is trying to connect but credentials are incorrect.

## ✅ Solution

### Option 1: Use Root User (If you know root password)

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password_here
DB_NAME=restaurant_erp
```

Then create the database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS restaurant_erp 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Option 2: Create Dedicated User (Recommended)

1. **Connect to MySQL as root:**
   ```bash
   mysql -u root -p
   ```

2. **Create database and user:**
   ```sql
   CREATE DATABASE IF NOT EXISTS restaurant_erp 
     CHARACTER SET utf8mb4 
     COLLATE utf8mb4_unicode_ci;
   
   CREATE USER IF NOT EXISTS 'restaurant_user'@'localhost' 
     IDENTIFIED BY 'restaurant_pass';
   
   GRANT ALL PRIVILEGES ON restaurant_erp.* 
     TO 'restaurant_user'@'localhost';
   
   FLUSH PRIVILEGES;
   
   EXIT;
   ```

3. **Update `backend/.env`:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=restaurant_user
   DB_PASSWORD=restaurant_pass
   DB_NAME=restaurant_erp
   ```

## ▶️ Then Run Migrations

```bash
cd backend

# Generate migration from entities
npm run migration:generate src/database/migrations/InitialSchema

# Run the migration
npm run migration:run

# Seed data
npm run seed

# Start backend
npm run dev
```

## 🔍 Test Connection

Test if credentials work:

```bash
mysql -u restaurant_user -p
# Enter password: restaurant_pass

USE restaurant_erp;
SHOW TABLES;
```

---

**Choose Option 2 (dedicated user) for better security!**
