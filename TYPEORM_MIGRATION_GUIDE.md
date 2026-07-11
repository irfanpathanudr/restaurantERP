# TypeORM Migrations - Complete Guide

## 🗄️ Using TypeORM Migrations (Proper Way)

This guide shows you how to use **TypeORM migrations** instead of auto-sync.

---

## ⚙️ Setup (Already Done)

✅ Updated `backend/src/config/database.ts` - Set `synchronize: false`  
✅ Created `backend/src/config/data-source.ts` - For migration CLI  
✅ Created `backend/src/database/migrations/` - Migration files directory  
✅ Updated `package.json` - Migration scripts configured  

---

## 🚀 Migration Workflow

### Step 1: Create Database (One-Time)

First, create the empty database:

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

---

### Step 2: Generate Initial Migration from Entities

This command will scan all your entity files and create a migration:

```bash
cd backend
npm run migration:generate src/database/migrations/InitialSchema
```

**What this does:**
- Reads all entities from `backend/src/database/entities/`
- Compares with current database (empty)
- Generates migration file with CREATE TABLE statements
- Creates file: `backend/src/database/migrations/{timestamp}-InitialSchema.ts`

**Expected output:**
```
Migration {timestamp}-InitialSchema.ts has been generated successfully.
```

---

### Step 3: Run the Migration

Execute the generated migration to create all tables:

```bash
cd backend
npm run migration:run
```

**What this does:**
- Executes the `up()` method in migration files
- Creates all 27 tables in database
- Records migration in `migrations` table
- Shows which migrations were executed

**Expected output:**
```
query: SELECT * FROM `restaurant_erp`.`migrations`
query: CREATE TABLE `user` ...
query: CREATE TABLE `role` ...
... (all tables created)
Migration InitialSchema has been executed successfully.
```

---

### Step 4: Verify Tables Created

```bash
mysql -u restaurant_user -p
```

```sql
USE restaurant_erp;
SHOW TABLES;
```

You should see 28 tables (27 entities + 1 migrations table):
```
attendance
audit_log
branch
category
customer
employee
expense
invoice
kitchen
kot
menu_item
migrations          ← TypeORM migrations tracking table
order
order_item
payment
permission
permission_group
raw_material
recipe
recipe_ingredient
reservation
restaurant
role
role_permissions_permission
table
user
user_permission
vendor
```

---

### Step 5: Seed Data

```bash
cd backend
npm run seed
```

This creates:
- 60+ permissions
- 5 roles
- Admin user

---

### Step 6: Start Backend

```bash
cd backend
npm run dev
```

---

## 📝 Common Migration Commands

### Generate Migration from Entity Changes

When you modify/add entities:

```bash
# Generate migration for changes
npm run migration:generate src/database/migrations/AddNewFeature

# Example names:
npm run migration:generate src/database/migrations/AddVendorTable
npm run migration:generate src/database/migrations/UpdateUserTable
npm run migration:generate src/database/migrations/AddIndexes
```

### Create Empty Migration

For custom SQL or data migrations:

```bash
npm run migration:create src/database/migrations/SeedDefaultData
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

### Show Migration Status

```bash
cd backend
npx typeorm migration:show -d src/config/data-source.ts
```

---

## 🔄 Development Workflow

### Scenario 1: Adding a New Entity

1. **Create entity file:**
   ```typescript
   // backend/src/database/entities/NewEntity.entity.ts
   @Entity('new_entity')
   export class NewEntity extends BaseEntity {
     @Column()
     name: string;
   }
   ```

2. **Generate migration:**
   ```bash
   npm run migration:generate src/database/migrations/AddNewEntity
   ```

3. **Review generated migration:**
   ```typescript
   // Check the generated file
   // backend/src/database/migrations/{timestamp}-AddNewEntity.ts
   ```

4. **Run migration:**
   ```bash
   npm run migration:run
   ```

### Scenario 2: Modifying Existing Entity

1. **Update entity:**
   ```typescript
   @Entity('user')
   export class User extends BaseEntity {
     // Add new column
     @Column({ nullable: true })
     middleName?: string;
   }
   ```

2. **Generate migration:**
   ```bash
   npm run migration:generate src/database/migrations/AddMiddleNameToUser
   ```

3. **Run migration:**
   ```bash
   npm run migration:run
   ```

### Scenario 3: Custom Data Migration

1. **Create empty migration:**
   ```bash
   npm run migration:create src/database/migrations/MigrateOldData
   ```

2. **Edit migration file:**
   ```typescript
   import { MigrationInterface, QueryRunner } from 'typeorm';
   
   export class MigrateOldData1234567890 implements MigrationInterface {
     public async up(queryRunner: QueryRunner): Promise<void> {
       // Your custom SQL
       await queryRunner.query(`
         UPDATE user SET status = 'active' WHERE status IS NULL
       `);
     }
   
     public async down(queryRunner: QueryRunner): Promise<void> {
       // Revert changes
       await queryRunner.query(`
         UPDATE user SET status = NULL WHERE status = 'active'
       `);
     }
   }
   ```

3. **Run migration:**
   ```bash
   npm run migration:run
   ```

---

## 📂 Migration File Structure

Generated migration file example:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1720684800000 implements MigrationInterface {
    name = 'InitialSchema1720684800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` varchar(36) NOT NULL,
                \`firstName\` varchar(255) NOT NULL,
                \`lastName\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                -- ... more columns
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
        
        // Create more tables...
        // Add foreign keys...
        // Create indexes...
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.query(`DROP TABLE \`user\``);
        // Drop more tables...
    }
}
```

---

## 🎯 Complete Setup Process

Here's the full process from scratch:

```bash
# 1. Create database
mysql -u root -p < backend/setup-database.sql

# 2. Configure environment
cd backend
# Edit .env with database credentials

# 3. Generate initial migration from entities
npm run migration:generate src/database/migrations/InitialSchema

# 4. Run migration (creates all tables)
npm run migration:run

# 5. Seed initial data
npm run seed

# 6. Start backend
npm run dev

# 7. Start frontend (in another terminal)
cd frontend
npm run dev
```

---

## ✅ Verify Migrations

### Check migration table

```sql
SELECT * FROM migrations;
```

Output:
```
| id | timestamp     | name                   |
|----|---------------|------------------------|
| 1  | 1720684800000 | InitialSchema          |
```

### Check if tables exist

```sql
SHOW TABLES;
```

### Check table structure

```sql
DESCRIBE user;
DESCRIBE restaurant;
DESCRIBE order;
```

---

## 🔍 Troubleshooting

### Error: "No changes in database schema were found"

**Cause:** Database already has the schema or no entity changes detected

**Solution:**
```bash
# Drop all tables and regenerate
mysql -u restaurant_user -p restaurant_erp

DROP DATABASE restaurant_erp;
CREATE DATABASE restaurant_erp CHARACTER SET utf8mb4;
EXIT;

# Generate migration again
npm run migration:generate src/database/migrations/InitialSchema
```

### Error: "Cannot find module 'data-source'"

**Cause:** Path issue in migration command

**Solution:**
```bash
# Use full path
npm run migration:generate src/database/migrations/InitialSchema
```

### Error: "QueryFailedError: Table already exists"

**Cause:** Trying to run migration when tables exist

**Solution:**
```bash
# Check migration status
npx typeorm migration:show -d src/config/data-source.ts

# If needed, drop database and start fresh
```

### Error: "synchronize: true causing conflicts"

**Cause:** Auto-sync is enabled

**Solution:**
Already fixed! `synchronize` is set to `false` in database config.

---

## 📊 Migration vs Synchronize

| Feature | synchronize: true | Migrations |
|---------|-------------------|------------|
| **Use Case** | Development only | Development & Production |
| **Control** | Automatic | Manual, versioned |
| **Safety** | Can lose data | Reversible |
| **Team Work** | Difficult | Easy to share |
| **Production** | ❌ Never use | ✅ Required |
| **Data Loss Risk** | ⚠️ High | ✅ Low |

---

## 🚀 Production Deployment

For production:

1. **Never use synchronize: true**
   ```typescript
   synchronize: false  // Already set!
   ```

2. **Run migrations on deploy:**
   ```bash
   npm run migration:run
   npm start
   ```

3. **Backup database first:**
   ```bash
   mysqldump -u restaurant_user -p restaurant_erp > backup.sql
   ```

4. **Test migrations on staging:**
   ```bash
   # Test on staging first
   npm run migration:run
   
   # If issues, revert
   npm run migration:revert
   ```

---

## 💡 Best Practices

1. ✅ **Always review generated migrations** before running
2. ✅ **Test migrations on local/staging first**
3. ✅ **Backup database before running migrations in production**
4. ✅ **Use descriptive migration names**
5. ✅ **Commit migration files to Git**
6. ✅ **Never modify executed migrations**
7. ✅ **Write both `up()` and `down()` methods**
8. ✅ **Keep migrations small and focused**

---

## 📚 Quick Reference

```bash
# Generate migration from entity changes
npm run migration:generate src/database/migrations/MigrationName

# Create empty migration
npm run migration:create src/database/migrations/MigrationName

# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npx typeorm migration:show -d src/config/data-source.ts
```

---

## 🎓 Example: Complete Flow

Let's add a new `Supplier` entity:

```bash
# 1. Create entity
cat > backend/src/database/entities/Supplier.entity.ts << 'EOF'
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('supplier')
export class Supplier extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;
}
EOF

# 2. Generate migration
npm run migration:generate src/database/migrations/AddSupplierTable

# 3. Review the generated file
# Check: backend/src/database/migrations/{timestamp}-AddSupplierTable.ts

# 4. Run migration
npm run migration:run

# 5. Verify
mysql -u restaurant_user -p
USE restaurant_erp;
DESCRIBE supplier;
```

---

You're all set with proper TypeORM migrations! 🚀

**Key takeaway:** Use `npm run migration:generate` to create migrations from your entities, then `npm run migration:run` to execute them.
