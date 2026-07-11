# Quick Database Setup (Without Docker)

## 🚀 3-Step Setup for Local MySQL

---

## Step 1: Create Database (One-Time Setup)

Open **MySQL Command Line** or **MySQL Workbench** and run:

```sql
CREATE DATABASE restaurant_erp 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'restaurant_user'@'localhost' 
  IDENTIFIED BY 'restaurant_pass';

GRANT ALL PRIVILEGES ON restaurant_erp.* 
  TO 'restaurant_user'@'localhost';

FLUSH PRIVILEGES;
```

**OR** run this command from your terminal:

```bash
mysql -u root -p < backend/setup-database.sql
```

---

## Step 2: Start Backend (Tables Auto-Create)

```bash
cd backend
npm run dev
```

✅ **That's it!** TypeORM will automatically:
- Connect to MySQL
- Create all 27 tables based on your entity files
- Start the server on port 5000

**No migration commands needed for development!**

---

## Step 3: Seed Initial Data

In a **new terminal** (keep backend running):

```bash
cd backend
npm run seed
```

This creates:
- ✅ 60+ permissions
- ✅ 5 default roles
- ✅ Admin user (admin@restaurant.com / Admin@123)

---

## ✅ Verify Setup

### Check Backend Logs

You should see:
```
✓ Database connected successfully
✓ Server is running on port 5000
```

### Check Database

```bash
mysql -u restaurant_user -p
# Password: restaurant_pass

USE restaurant_erp;
SHOW TABLES;
```

You should see 27 tables!

### Test API

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy"
}
```

---

## 🎯 You're Done!

Now you can:
1. Open http://localhost:3001
2. Login with: admin@restaurant.com / Admin@123
3. Start building!

---

## ⚡ Why No Migration Commands?

Your backend is configured with **`synchronize: true`** in development mode, which means:

- TypeORM automatically creates/updates tables
- Changes to entities sync instantly
- No need to run migration commands manually
- Perfect for rapid development

**For production**, you'll want to:
1. Set `synchronize: false`
2. Use proper migrations: `npm run migration:generate`
3. Run migrations: `npm run migration:run`

But for now, enjoy the automatic setup! 🚀

---

## 🆘 Troubleshooting

**MySQL not running?**
```bash
# Windows
net start MySQL80

# Check services
services.msc
# Look for MySQL80, ensure it's running
```

**Connection denied?**
```sql
-- Fix authentication
ALTER USER 'restaurant_user'@'localhost' 
  IDENTIFIED WITH mysql_native_password BY 'restaurant_pass';
FLUSH PRIVILEGES;
```

**Port 3306 in use?**
```bash
netstat -ano | findstr :3306
```

---

Need more details? Check **MIGRATION_GUIDE.md** for comprehensive instructions.
