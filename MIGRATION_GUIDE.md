# Database Migration Guide

## 🗄️ Running Migrations Without Docker

Since you're using a local MySQL installation instead of Docker, follow these steps:

---

## Step 1: Install MySQL (If Not Already Installed)

Download and install MySQL 8.0 from:
- **Windows**: https://dev.mysql.com/downloads/installer/
- During installation, remember your root password

---

## Step 2: Create Database and User

Open MySQL Command Line or MySQL Workbench and run:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS restaurant_erp 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'restaurant_user'@'localhost' 
  IDENTIFIED BY 'restaurant_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON restaurant_erp.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
USE restaurant_erp;
```

**OR use the provided SQL file:**

```bash
# From project root
mysql -u root -p < backend/setup-database.sql
```

---

## Step 3: Configure Backend Environment

Make sure your `backend/.env` file has the correct database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=restaurant_user
DB_PASSWORD=restaurant_pass
DB_NAME=restaurant_erp

PORT=5000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_min_32_characters_long_change_production
JWT_REFRESH_SECRET=refresh_secret_key_min_32_characters_long_change_prod
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
APP_URL=http://localhost:5000
```

---

## Step 4: Understanding TypeORM Synchronization

**Good News!** Your backend is currently configured with `synchronize: true` in development mode, which means:

✅ **No manual migrations needed for development!**
- TypeORM will automatically create/update tables based on your entities
- Tables will be created when you start the backend server
- Schema changes sync automatically

**How it works:**

When you run `npm run dev` in the backend:
1. TypeORM reads all entity files in `backend/src/database/entities/`
2. Compares them with the database schema
3. Automatically creates/updates tables to match entities
4. You get instant schema updates during development

---

## Step 5: Start Backend (Auto-Migration)

```bash
cd backend
npm run dev
```

**What happens:**
1. Backend connects to MySQL
2. TypeORM auto-creates all 25+ tables based on entities
3. Server starts on port 5000
4. Database is ready!

**Check the logs for:**
```
Database connected successfully
Server is running on port 5000
```

---

## Step 6: Seed Initial Data

After tables are created, run seeders to populate initial data:

```bash
cd backend
npm run seed
```

**This will create:**
- ✅ 60+ permissions
- ✅ 5 default roles (Super Admin, Manager, Waiter, Chef, Cashier)
- ✅ Admin user (admin@restaurant.com / Admin@123)

---

## 🔧 Manual Migration Commands (For Production)

For production, you should use migrations instead of auto-sync. Here's how:

### Generate Migration from Entities

```bash
cd backend
npm run migration:generate -- -n InitialSchema
```

This creates a migration file in `backend/src/database/migrations/`

### Run Migrations

```bash
cd backend
npm run migration:run
```

### Revert Last Migration

```bash
cd backend
npm run migration:revert
```

---

## 📊 Verify Database Setup

### Option 1: MySQL Command Line

```bash
mysql -u restaurant_user -p
# Enter password: restaurant_pass

USE restaurant_erp;
SHOW TABLES;
```

**Expected output (after backend starts):**
```
+---------------------------+
| Tables_in_restaurant_erp  |
+---------------------------+
| attendance                |
| audit_log                 |
| branch                    |
| category                  |
| customer                  |
| employee                  |
| expense                   |
| invoice                   |
| kitchen                   |
| kot                       |
| menu_item                 |
| order                     |
| order_item                |
| payment                   |
| permission                |
| permission_group          |
| raw_material              |
| recipe                    |
| recipe_ingredient         |
| reservation               |
| restaurant                |
| role                      |
| role_permissions_permission|
| table                     |
| user                      |
| user_permission           |
| vendor                    |
+---------------------------+
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to localhost
3. Navigate to restaurant_erp database
4. Check tables in left sidebar

---

## 🚀 Complete Setup Flow

Here's the complete process from start to finish:

```bash
# 1. Create database (one-time)
mysql -u root -p < backend/setup-database.sql

# 2. Configure environment
cd backend
# Edit .env file with your database credentials

# 3. Start backend (creates tables automatically)
npm run dev

# 4. In another terminal, seed data
cd backend
npm run seed

# 5. Verify by checking API
curl http://localhost:5000/health
```

---

## 🔍 Troubleshooting

### Error: "Access denied for user"

**Solution 1**: Check credentials
```bash
mysql -u restaurant_user -p
# Enter password: restaurant_pass
```

**Solution 2**: Recreate user
```sql
DROP USER IF EXISTS 'restaurant_user'@'localhost';
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'restaurant_pass';
GRANT ALL PRIVILEGES ON restaurant_erp.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Database does not exist"

```sql
CREATE DATABASE restaurant_erp 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

### Error: "Cannot connect to MySQL"

**Check if MySQL is running:**

Windows:
```bash
# Open Services (Win + R, type 'services.msc')
# Look for 'MySQL80' service
# Make sure it's running

# OR from Command Prompt:
net start MySQL80
```

**Check MySQL port:**
```bash
netstat -ano | findstr :3306
```

### Error: "ER_NOT_SUPPORTED_AUTH_MODE"

MySQL 8.0 uses a new authentication method. Fix it:

```sql
ALTER USER 'restaurant_user'@'localhost' 
  IDENTIFIED WITH mysql_native_password BY 'restaurant_pass';
FLUSH PRIVILEGES;
```

### Backend doesn't start / Database connection timeout

1. **Verify MySQL is running**
2. **Check credentials in .env**
3. **Test connection manually:**

```bash
mysql -h localhost -P 3306 -u restaurant_user -p restaurant_erp
```

4. **Check backend logs:**

```bash
# View logs
cat backend/logs/application-*.log
```

---

## 🎯 Production Migration Strategy

For production, **disable auto-sync** and use proper migrations:

### 1. Update Database Config (Production)

Edit `backend/src/config/database.ts`:

```typescript
export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'restaurant_user',
  password: process.env.DB_PASSWORD || 'restaurant_pass',
  database: process.env.DB_NAME || 'restaurant_erp',
  synchronize: process.env.NODE_ENV === 'development', // FALSE in production
  logging: process.env.NODE_ENV === 'development',
  // ... rest of config
};
```

### 2. Generate Initial Migration

```bash
npm run migration:generate -- -n InitialSchema
```

### 3. Create Migration for Changes

When you add/modify entities:

```bash
npm run migration:generate -- -n AddNewFeature
```

### 4. Deploy to Production

```bash
# On production server
npm run migration:run
npm start
```

---

## 📋 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start backend (auto-creates tables) |
| `npm run seed` | Populate initial data |
| `npm run migration:generate -- -n Name` | Create new migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Undo last migration |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] MySQL is running
- [ ] Database `restaurant_erp` exists
- [ ] User `restaurant_user` can connect
- [ ] Backend starts without errors
- [ ] Tables are created (27 tables)
- [ ] Seeders run successfully
- [ ] Can login with admin@restaurant.com
- [ ] API health check returns success

---

## 💡 Pro Tips

1. **Development**: Use `synchronize: true` for quick iteration
2. **Production**: Always use migrations (`synchronize: false`)
3. **Backup**: Always backup database before running migrations
4. **Testing**: Test migrations on staging environment first
5. **Version Control**: Commit migration files to git

---

## 🆘 Still Having Issues?

1. **Check MySQL service is running**
2. **Verify credentials** by connecting manually
3. **Check logs** in `backend/logs/`
4. **Test connection:**

```bash
cd backend
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'localhost',
  user: 'restaurant_user',
  password: 'restaurant_pass',
  database: 'restaurant_erp'
}).then(() => console.log('✓ Connection successful!'))
  .catch(err => console.error('✗ Connection failed:', err.message));
"
```

---

**Need more help?** Check:
- Backend logs: `backend/logs/application-*.log`
- MySQL error log: Usually in MySQL installation directory
- TypeORM documentation: https://typeorm.io/

---

You're all set! Your database will be automatically set up when you start the backend. 🚀
