# TypeORM Migrations - Quick Start

## 🚀 5 Commands to Get Started

### 1. Create Database (One-Time)
```bash
mysql -u root -p
```
```sql
CREATE DATABASE restaurant_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'restaurant_pass';
GRANT ALL PRIVILEGES ON restaurant_erp.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Generate Migration from Your Entities
```bash
cd backend
npm run migration:generate src/database/migrations/InitialSchema
```

This scans all files in `backend/src/database/entities/` and creates migration.

### 3. Run Migration (Creates All Tables)
```bash
cd backend
npm run migration:run
```

This executes the migration and creates all 27 tables in your database.

### 4. Seed Initial Data
```bash
cd backend
npm run seed
```

### 5. Start Backend
```bash
cd backend
npm run dev
```

---

## ✅ Verify It Worked

```bash
mysql -u restaurant_user -p
```
```sql
USE restaurant_erp;
SHOW TABLES;  -- Should show 28 tables
SELECT * FROM migrations;  -- Should show your migration
```

---

## 📝 Common Commands

```bash
# Generate migration when you change entities
npm run migration:generate src/database/migrations/AddNewFeature

# Run all pending migrations
npm run migration:run

# Undo last migration
npm run migration:revert

# Create empty migration for custom SQL
npm run migration:create src/database/migrations/CustomMigration
```

---

## 🔄 Typical Workflow

1. **Modify/Add Entity** → Change files in `backend/src/database/entities/`
2. **Generate Migration** → `npm run migration:generate src/database/migrations/DescriptiveName`
3. **Review Migration** → Check generated file in `backend/src/database/migrations/`
4. **Run Migration** → `npm run migration:run`
5. **Test** → Verify changes in database

---

## 🎯 What You Need to Know

**Entity Files Location:**
```
backend/src/database/entities/*.entity.ts
```

**Migration Files Location:**
```
backend/src/database/migrations/{timestamp}-Name.ts
```

**Configuration:**
- ✅ `synchronize: false` (migrations enabled)
- ✅ `data-source.ts` (migration CLI config)
- ✅ Migration scripts in `package.json`

---

## ⚡ Quick Example

Let's say you want to add a `middleName` field to User:

```bash
# 1. Edit entity
# backend/src/database/entities/User.entity.ts
# Add: @Column({ nullable: true }) middleName?: string;

# 2. Generate migration
npm run migration:generate src/database/migrations/AddMiddleNameToUser

# 3. Run migration
npm run migration:run

# 4. Verify
mysql -u restaurant_user -p restaurant_erp
DESCRIBE user;  -- Should show middleName column
```

---

That's it! Three main commands:
1. `migration:generate` - Create from entities
2. `migration:run` - Execute migrations
3. `migration:revert` - Undo last one

For complete details, see **TYPEORM_MIGRATION_GUIDE.md**
