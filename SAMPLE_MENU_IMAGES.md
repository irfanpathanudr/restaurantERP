# Sample Menu Item Images

## Free Image URLs for Testing

You can use these free image URLs from Unsplash to populate your menu items with images:

### Appetizers
```
https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80
(Bruschetta)

https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&q=80
(Spring Rolls)

https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80
(Chicken Wings)
```

### Main Courses
```
https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80
(Salad Bowl)

https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80
(Margherita Pizza)

https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80
(Pancakes)

https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80
(Grilled Chicken)

https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80
(Burger)

https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80
(Pasta)

https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80
(Tacos)

https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80
(Ramen)

https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80
(Sushi)
```

### Desserts
```
https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80
(Cheesecake)

https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400&q=80
(Ice Cream)

https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80
(Cake)

https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80
(Chocolate Cake)
```

### Beverages
```
https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80
(Coffee)

https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80
(Smoothie)

https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80
(Cocktail)

https://images.unsplash.com/photo-1582654596888-371fd61e2674?w=400&q=80
(Juice)
```

## How to Add Images to Menu Items

### Method 1: Via Web Interface
1. Go to **Menu Management** page
2. Click **Edit** on any menu item
3. Scroll to the **Image URL** field
4. Copy one of the URLs above
5. Paste it into the field
6. The preview will appear below
7. Click **Update**

### Method 2: Via Database (Bulk Update)
You can update multiple menu items at once using SQL:

```sql
-- Update specific menu items with images
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'
WHERE name = 'Margherita Pizza';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80'
WHERE name = 'Classic Burger';

-- Add more updates as needed
```

## Image Requirements

### Recommended Specifications:
- **Format**: JPG, PNG, or WebP
- **Dimensions**: Minimum 400x400px (square aspect ratio preferred)
- **File Size**: Under 500KB for fast loading
- **Quality**: Medium to high (60-80% compression)

### Best Practices:
1. Use square or 4:3 aspect ratio images
2. Ensure good lighting and clear food visibility
3. Use consistent styling across all images
4. Avoid heavily filtered or edited images
5. Show the actual dish your restaurant serves

## Alternative Image Sources

### Free Stock Photos:
- **Unsplash** - https://unsplash.com/s/photos/food
- **Pexels** - https://www.pexels.com/search/food/
- **Pixabay** - https://pixabay.com/images/search/restaurant%20food/

### Professional Options:
- Hire a food photographer
- Use smartphone with good camera
- DIY food photography with proper lighting
- Purchase from stock photo sites (Shutterstock, iStock, etc.)

## Image Upload Feature (Coming Soon)

Currently, the system accepts image URLs. A future update will include:
- Direct file upload from device
- Image cropping and resizing
- Automatic optimization
- Cloud storage integration
- Multiple images per item
- Image gallery selection

## Troubleshooting

### Image Not Displaying?
1. Check if URL is accessible in browser
2. Ensure URL starts with `https://`
3. Verify image file extension (.jpg, .png, .webp)
4. Check for CORS restrictions
5. Try a different image URL

### Image Loads Slowly?
1. Use smaller image files
2. Add `?w=400&q=80` to Unsplash URLs for optimization
3. Consider using a CDN
4. Compress images before uploading

### Broken Image Icon?
- The system shows a fallback icon (crossed utensils)
- This happens when image_url is null or invalid
- Update the URL to fix it
