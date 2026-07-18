# Database Seeding Instructions

## Overview
This guide will help you reseed the database with menu items that include images.

## Prerequisites
- Backend server dependencies installed (`npm install`)
- Database connection configured in `.env` file
- Database created and accessible

## Steps to Reseed Database

### Option 1: Full Database Reset (Recommended for Development)

If you want to start fresh with all seed data including the new menu images:

```bash
# Navigate to backend directory
cd backend

# Drop and recreate database schema (WARNING: This deletes all data!)
npm run migration:revert

# Run migrations
npm run migration:run

# Seed all data including menu items with images
npm run seed
```

### Option 2: Reseed Only Menu Items

If you want to keep existing data and only update menu items:

**Step 1: Delete existing menu items**
```sql
-- Connect to your database and run:
DELETE FROM menu_items;
```

**Step 2: Run menu seeder**
```bash
cd backend
npm run seed
```

### Option 3: Manual Update (If items exist)

If you have existing menu items and want to add images without recreating them:

```sql
-- Update individual items with image URLs
UPDATE menu_items SET image = 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' WHERE sku = 'APP001';
UPDATE menu_items SET image = 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' WHERE sku = 'APP002';
-- ... (continue for all items)
```

Or use a script to batch update (see `backend/scripts/update-menu-images.sql` if created).

## Verify Seeding

After seeding, verify the data:

### 1. Check Menu Items Count
```sql
SELECT COUNT(*) FROM menu_items;
-- Expected: 31 items
```

### 2. Check Items with Images
```sql
SELECT COUNT(*) FROM menu_items WHERE image IS NOT NULL;
-- Expected: 31 items (all items should have images)
```

### 3. View Sample Items
```sql
SELECT id, name, sku, price, image, category_id 
FROM menu_items 
LIMIT 5;
```

### 4. Test in Frontend
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to KOT page
4. Verify images are displayed
5. Test search and filtering

## Seed Data Details

The seeder creates 31 menu items across 9 categories:

| Category | Items | Image Source |
|----------|-------|--------------|
| Appetizers | 3 | Unsplash |
| Soups & Salads | 3 | Unsplash |
| Pasta | 5 | Unsplash |
| Pizza | 4 | Unsplash |
| Main Course | 3 | Unsplash |
| Seafood | 3 | Unsplash |
| Desserts | 4 | Unsplash |
| Beverages | 4 | Unsplash |
| Wine | 3 | Unsplash |

## Image URLs

All images are sourced from Unsplash with the following format:
```
https://images.unsplash.com/photo-{photo-id}?w=400
```

- Width: 400px (optimized for performance)
- Free to use under Unsplash license
- High-quality food photography

## Troubleshooting

### Seeding Fails - "Category not found"
**Solution**: Ensure categories are seeded first
```bash
cd backend
npm run seed:categories
npm run seed:menu-items
```

### Images Not Displaying
**Possible causes**:
1. **CORS Issues**: Unsplash should work, but if blocked, check browser console
2. **Network Issues**: Check internet connection
3. **Image Field Name**: Verify frontend uses `image` not `image_url`

**Solution**:
- Check browser console for errors
- Verify API response includes `image` field
- Test image URL directly in browser

### Duplicate SKU Errors
**Solution**: Clear existing menu items first
```sql
DELETE FROM menu_items;
```

### Database Connection Error
**Solution**: Verify `.env` configuration
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```

## Custom Image URLs

If you want to use your own images instead of Unsplash:

### Option 1: Update Seeder File
Edit `backend/src/database/seeders/menu-item.seeder.ts`:
```typescript
{ 
  name: 'Bruschetta', 
  sku: 'APP001', 
  // ... other fields
  image: 'https://your-cdn.com/images/bruschetta.jpg'  // Your URL
}
```

### Option 2: Upload to Your Server
1. Create `backend/public/images/menu/` directory
2. Add image files
3. Update seeder:
```typescript
image: '/images/menu/bruschetta.jpg'
```

### Option 3: Use Cloud Storage
1. Upload images to AWS S3, Cloudinary, or similar
2. Get public URLs
3. Update seeder with those URLs

## Production Deployment

For production:

1. **Use CDN**: Host images on CDN for better performance
2. **Image Optimization**: Use optimized formats (WebP, AVIF)
3. **Multiple Sizes**: Provide different sizes for responsive design
4. **Lazy Loading**: Frontend already supports lazy loading
5. **Fallback**: System shows icon if image fails to load

## Database Migration

If you need to add images to existing production database:

1. **Backup First**: Always backup production database
```bash
mysqldump -u username -p database_name > backup.sql
```

2. **Add Image Column** (if not exists):
```sql
ALTER TABLE menu_items 
ADD COLUMN image VARCHAR(255) NULL 
AFTER preparation_time;
```

3. **Update with Images**:
```sql
UPDATE menu_items SET image = 'url' WHERE sku = 'SKU001';
```

4. **Verify**:
```sql
SELECT COUNT(*) FROM menu_items WHERE image IS NOT NULL;
```

## Seeder Script Location

The menu item seeder with images is located at:
```
backend/src/database/seeders/menu-item.seeder.ts
```

Main seeder entry point:
```
backend/src/database/seeders/index.ts
```

## Running Individual Seeders

If your seeder setup supports it:
```bash
# Seed only categories
npm run seed:categories

# Seed only menu items
npm run seed:menu-items

# Seed all
npm run seed
```

## Notes

- Images are loaded from external URLs (Unsplash)
- No local image storage required
- Fast initial loading
- Suitable for development and testing
- For production, consider hosting images yourself
- All images are food/beverage related and appropriate
- Images are professional quality
- URLs use HTTPS for security

## Support

If you encounter issues:
1. Check database logs
2. Verify network connectivity
3. Review seeder error messages
4. Check database constraints
5. Ensure categories exist before menu items

---

**Last Updated**: After adding image URLs to menu item seeder
**Seeder Version**: 1.1.0 (with images)
