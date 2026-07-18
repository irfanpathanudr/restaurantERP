# Order Creation UI Guide

## Visual Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Order Management                                          [+ New Order]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Order history and management coming soon...                                 │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Create Order Modal Layout

When clicking "New Order", a full-screen modal opens:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│  Create New Order                                                           [✕]   │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────────────────────────────┬─────────────────────────────────────┐  │
│  │  MENU ITEMS (Left Side - 2/3 width) │  ORDER CART (Right Side - 1/3)      │  │
│  │                                      │                                       │  │
│  │  ┌────────────────────────────────┐ │  ┌─────────────────────────────────┐ │  │
│  │  │ 🔍 Search menu items...        │ │  │ 🛒 Order Cart (3)                │ │  │
│  │  └────────────────────────────────┘ │  ├─────────────────────────────────┤ │  │
│  │                                      │  │                                   │ │  │
│  │  Category Filters:                   │  │ Order Type: [Dine In ▼]          │ │  │
│  │  [All Items] [Appetizers] [Mains]... │  │ Table: [Table 5 ▼]               │ │  │
│  │                                      │  │                                   │ │  │
│  │  ┌──────────┬──────────┬──────────┐ │  │ ┌─────────────────────────────┐  │ │  │
│  │  │ [Image]  │ [Image]  │ [Image]  │ │  │ │ Margherita Pizza            │  │ │  │
│  │  │          │          │          │ │  │ │ $12.99 each                 │  │ │  │
│  │  │ Pizza    │ Burger   │ Pasta    │ │  │ │ [-] 2 [+]        $25.98    │  │ │  │
│  │  │ Italian  │ American │ Italian  │ │  │ └─────────────────────────────┘  │ │  │
│  │  │ $12.99   │ $10.99   │ $14.99   │ │  │                                   │ │  │
│  │  │ 15 min   │ 20 min   │ 25 min   │ │  │ ┌─────────────────────────────┐  │ │  │
│  │  └──────────┴──────────┴──────────┘ │  │ │ Classic Burger              │  │ │  │
│  │                                      │  │ │ $10.99 each                 │  │ │  │
│  │  ┌──────────┬──────────┬──────────┐ │  │ │ [-] 1 [+]        $10.99    │  │ │  │
│  │  │ [Image]  │ [Image]  │ [Image]  │ │  │ └─────────────────────────────┘  │ │  │
│  │  │          │          │          │ │  │                                   │ │  │
│  │  │ Salad    │ Tacos    │ Sushi    │ │  │ Order Notes:                      │ │  │
│  │  │ Healthy  │ Mexican  │ Japanese │ │  │ ┌─────────────────────────────┐  │ │  │
│  │  │ $8.99    │ $9.99    │ $18.99   │ │  │ │ Special instructions...     │  │ │  │
│  │  │ 10 min   │ 15 min   │ 30 min   │ │  │ └─────────────────────────────┘  │ │  │
│  │  └──────────┴──────────┴──────────┘ │  │                                   │ │  │
│  │                                      │  │ ───────────────────────────────   │ │  │
│  │  (More items scroll below...)        │  │ Total:              $36.97       │ │  │
│  │                                      │  │                                   │ │  │
│  └──────────────────────────────────────┘  │ [Cancel]    [Create Order]       │ │  │
│                                             └─────────────────────────────────┘  │  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Search Bar
```
┌───────────────────────────────────────────────────────┐
│ 🔍  Search menu items by name, category, or SKU...   │
└───────────────────────────────────────────────────────┘
```

**Features:**
- Real-time filtering as you type
- Searches across: name, description, SKU, category
- Case-insensitive
- Clear icon appears when text entered

### 2. Category Filter Pills
```
[All Items]  [Appetizers]  [Main Course]  [Desserts]  [Beverages]
   (blue)      (gray)         (gray)         (gray)      (gray)
```

**Features:**
- Horizontal scrollable on mobile
- Active category highlighted in blue
- Click to filter by category
- "All Items" shows everything

### 3. Menu Item Card
```
┌────────────────────┐
│                    │
│   [FOOD IMAGE]     │
│                [VEG]│  <- Badge
│                    │
├────────────────────┤
│ Margherita Pizza   │  <- Name
│ Italian            │  <- Category
│ $12.99      15 min │  <- Price & Prep Time
└────────────────────┘
```

**Visual Elements:**
- Square image (aspect-ratio 1:1)
- Vegetarian/Vegan badge on image
- Hover effect: shadow + scale
- Fallback icon if no image
- Click anywhere on card to add to cart

**Badge Colors:**
- 🟢 Green "Vegan" - for vegan items
- 🟢 Light Green "Veg" - for vegetarian items
- No badge - non-vegetarian items

### 4. Cart Item
```
┌─────────────────────────────────────┐
│ Margherita Pizza               [✕]  │
│ $12.99 each                         │
│                                     │
│ [ - ]    2    [ + ]      $25.98    │
└─────────────────────────────────────┘
```

**Features:**
- Item name at top
- Unit price shown
- Quantity controls (-/+)
- Total for this item
- Remove button (✕)

### 5. Order Configuration
```
┌─────────────────────────────┐
│ Order Type:                 │
│ ▼ Dine In                   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Table: *                    │
│ ▼ Table 5 (Floor 1)         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Order Notes:                │
│ ┌─────────────────────────┐ │
│ │ Special instructions... │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 6. Cart Summary
```
─────────────────────────────
Total:              $36.97
═════════════════════════════
[   Cancel   ]  [Create Order]
```

## Responsive Behavior

### Desktop (1920px+)
- 4 columns of menu items
- Side-by-side menu and cart
- Full modal width

### Tablet (768px - 1920px)
- 3 columns of menu items
- Side-by-side menu and cart
- Comfortable spacing

### Mobile (<768px)
- 2 columns of menu items
- Cart moves below menu
- Smaller card sizes
- Touch-optimized buttons

## Color Scheme

### Light Mode
- Background: White (#FFFFFF)
- Cards: White with shadow
- Text: Dark gray (#111827)
- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Hover: Light gray (#F3F4F6)

### Dark Mode
- Background: Dark gray (#1F2937)
- Cards: Darker gray (#374151)
- Text: Light gray (#F9FAFB)
- Primary: Blue (#3B82F6)
- Success: Green (#34D399)
- Hover: Medium gray (#4B5563)

## Interactive States

### Menu Item Card
```
Normal:    border-none, shadow-sm
Hover:     shadow-lg, scale-105 (image)
Click:     Brief flash, add to cart animation
```

### Quantity Buttons
```
Normal:    gray background
Hover:     darker gray
Click:     immediate quantity change
Disabled:  opacity-50 (when quantity = 0)
```

### Action Buttons
```
Cancel:       ghost style, gray
Create Order: primary style, blue
             (disabled when cart empty)
```

## User Flow

### Happy Path
```
1. Click "New Order"
   ↓
2. Modal opens with menu items
   ↓
3. [Optional] Search/filter items
   ↓
4. Click items to add to cart
   ↓
5. Adjust quantities as needed
   ↓
6. Select order type
   ↓
7. Select table (if dine-in)
   ↓
8. [Optional] Add order notes
   ↓
9. Click "Create Order"
   ↓
10. Success message appears
   ↓
11. Modal closes, cart resets
```

### Search Flow
```
1. Type in search box
   ↓
2. Results filter in real-time
   ↓
3. [If no results] "No menu items found" message
   ↓
4. Clear search to see all items again
```

### Category Filter Flow
```
1. Click category pill
   ↓
2. Items filter to that category
   ↓
3. Previous category deselects
   ↓
4. Click "All Items" to reset
```

## Empty States

### No Menu Items
```
┌─────────────────────┐
│   🍽️              │
│                     │
│ No menu items found │
└─────────────────────┘
```

### Empty Cart
```
┌─────────────────────┐
│   🛒              │
│                     │
│  Cart is empty      │
└─────────────────────┘
```

### No Tables Available
```
┌─────────────────────────────┐
│ Table: *                    │
│ ▼ No tables available       │
└─────────────────────────────┘
```

## Loading States

### Loading Menu Items
```
┌─────────────────────┐
│                     │
│    ⟳ (spinning)    │
│                     │
└─────────────────────┘
```

## Notifications

### Success Messages
✅ "Margherita Pizza added to cart"
✅ "Order created successfully"

### Error Messages
❌ "Failed to fetch menu items"
❌ "Please add items to cart"
❌ "Please select a table"
❌ "Failed to create order"

## Keyboard Shortcuts (Future)
- `/` - Focus search bar
- `Esc` - Close modal
- `Enter` - Create order (when valid)
- `Arrow keys` - Navigate menu items
- `Space` - Add selected item to cart

## Accessibility Features
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance (WCAG AA)
- Touch targets minimum 44x44px

## Performance Optimizations
- Lazy load images
- Virtual scrolling for large menus (future)
- Debounced search input
- Memoized filter functions
- Optimistic UI updates
