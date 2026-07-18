# KOT App UI Description

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Kitchen Orders (KOT)                                                     │
│ Create kitchen order tickets for tables                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬───────────────────────────────────┐
│                                      │                                   │
│  MENU ITEMS (2/3 width)             │  KOT CART (1/3 width)            │
│                                      │  [Sticky Sidebar]                 │
│                                      │                                   │
│  ┌────────────────────────────────┐ │  ┌─────────────────────────────┐ │
│  │ 🔍 Search menu items...     [X]│ │  │ 🛒 KOT Cart      [3 items] │ │
│  └────────────────────────────────┘ │  └─────────────────────────────┘ │
│                                      │                                   │
│  [All] [Appetizers] [Pasta] [Pizza] │  Table Number *                   │
│                                      │  ┌─────────────────────────────┐ │
│  ┌────────────┬────────────┐        │  │ Enter table number...       │ │
│  │ [Image]    │ [Image]    │        │  └─────────────────────────────┘ │
│  │            │            │        │                                   │
│  │ 🟢 Pizza   │ 🔴 Chicken │        │  ┌─────────────────────────────┐ │
│  │ Margherita │ Parmigiana │        │  │ [img] Pizza    $13.99       │ │
│  │ Desc...    │ Desc...    │        │  │       [ - ] 2 [ + ]         │ │
│  │ $13.99     │ $19.99     │        │  └─────────────────────────────┘ │
│  │ Category   │ Category   │        │                                   │
│  │ Prep: 15m  │ Prep: 20m  │        │  ┌─────────────────────────────┐ │
│  └────────────┴────────────┘        │  │ [img] Pasta    $15.99       │ │
│                                      │  │       [ - ] 1 [ + ]         │ │
│  ┌────────────┬────────────┐        │  └─────────────────────────────┘ │
│  │ [Image]    │ [Image]    │        │                                   │
│  │            │            │        │  Total Items: 3                   │
│  │ ...        │ ...        │        │                                   │
│  └────────────┴────────────┘        │  [Submit KOT]                     │
│                                      │  [Clear All]                      │
└──────────────────────────────────────┴───────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
```
┌─────────────────────────────────────────────────────────┐
│ Kitchen Orders (KOT)                          [Icon]    │
│ Create kitchen order tickets for tables                 │
└─────────────────────────────────────────────────────────┘
```
- Large heading with page title
- Subtitle explaining purpose
- Clean, professional styling

### 2. Search Bar
```
┌──────────────────────────────────────────────────────┐
│ 🔍  Search menu items by name, category, or SKU... [X]│
└──────────────────────────────────────────────────────┘
```
**Features:**
- Search icon on left
- Placeholder text guides user
- Clear button (X) on right when text entered
- Real-time filtering
- Full-width, prominent placement

### 3. Category Filter Pills
```
┌─────────────────────────────────────────────────────────┐
│ [All Items] [Appetizers] [Pasta] [Pizza] [Main Course] │
│ [Seafood] [Desserts] [Beverages] [Wine] →              │
└─────────────────────────────────────────────────────────┘
```
**Features:**
- Pill-shaped buttons
- Active category highlighted in primary color
- Inactive categories in gray
- Horizontal scrollable on mobile
- Smooth transitions

### 4. Menu Item Card
```
┌──────────────────────────┐
│                          │
│    [Food Image]          │
│    Hover: Zoom In        │
│                          │
├──────────────────────────┤
│ 🟢 Margherita Pizza      │
│ Tomato, mozzarella,      │
│ and basil                │
│                          │
│ $13.99          Pizza    │
│ Prep time: 15 mins       │
└──────────────────────────┘
```
**Features:**
- Large image area (192px height)
- Food type indicator (🟢 🔴 🟡 🟠)
- Item name in bold
- Description (2 line clamp)
- Price in large, primary color
- Category badge
- Preparation time
- Hover effect: shadow and image zoom
- Click anywhere to add to cart

### 5. KOT Cart (Sidebar)
```
┌─────────────────────────────┐
│ 🛒 KOT Cart    [Badge: 3]  │
├─────────────────────────────┤
│ Table Number *              │
│ ┌─────────────────────────┐ │
│ │ 5                       │ │
│ └─────────────────────────┘ │
│                             │
│ ─────────────────────────── │
│                             │
│ ┌───┬───────────┬─────────┐ │
│ │[I]│ Pizza     │ [ - ]   │ │
│ │   │ $13.99    │   2     │ │
│ │   │           │ [ + ]   │ │
│ └───┴───────────┴─────────┘ │
│                             │
│ ┌───┬───────────┬─────────┐ │
│ │[I]│ Pasta     │ [ - ]   │ │
│ │   │ $15.99    │   1     │ │
│ │   │           │ [ + ]   │ │
│ └───┴───────────┴─────────┘ │
│                             │
│ ─────────────────────────── │
│ Total Items: 3              │
│                             │
│ ┌─────────────────────────┐ │
│ │   Submit KOT            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │   Clear All             │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```
**Features:**
- Sticky positioning (stays visible when scrolling)
- Cart icon with item count badge
- Required table number input
- Scrollable item list (max height)
- Each item shows:
  - Thumbnail image
  - Name
  - Price
  - Quantity controls
- Total item count
- Primary action button (Submit)
- Secondary action button (Clear)

### 6. Cart Item Card
```
┌─────────────────────────────────────┐
│ [Img] Pizza Margherita    [ - ]     │
│       $13.99                2       │
│                           [ + ]     │
└─────────────────────────────────────┘
```
**Features:**
- Compact layout
- Small thumbnail (48px)
- Name truncated if long
- Price displayed
- Minus button (decreases qty or removes)
- Quantity display (centered)
- Plus button (increases qty)
- Light background for separation

### 7. Empty States

**Empty Menu (No Results)**
```
┌─────────────────────────┐
│                         │
│     🍽️ (Large Icon)    │
│                         │
│   No menu items found   │
│                         │
└─────────────────────────┘
```

**Empty Cart**
```
┌─────────────────────────┐
│                         │
│     🛒 (Large Icon)     │
│                         │
│   No items added yet    │
│ Click on menu items to  │
│          add            │
└─────────────────────────┘
```

### 8. Loading State
```
┌─────────────────────────┐
│                         │
│   Loading menu items... │
│                         │
└─────────────────────────┘
```

## Color Scheme

### Food Type Indicators
- **Vegetarian**: Green (#16A34A)
  - Icon: Filled leaf
- **Non-Vegetarian**: Red (#DC2626)
  - Icon: Red circle outline
- **Egg**: Yellow (#CA8A04)
  - Icon: Yellow circle outline
- **Jain**: Orange (#EA580C)
  - Icon: Orange leaf

### Button States
- **Primary (Submit)**: Primary brand color
- **Outline (Clear)**: Border with transparent background
- **Disabled**: Gray, reduced opacity
- **Hover**: Slightly darker shade
- **Active Category**: Primary color background, white text
- **Inactive Category**: Gray background, dark text

### Card Shadows
- **Default**: Subtle shadow
- **Hover**: Enhanced shadow (lifted effect)
- **Active**: Maintains hover shadow

## Responsive Behavior

### Desktop (≥1024px)
- Two-column layout
- Menu items: 2 columns grid
- Cart: Fixed 1/3 width sidebar
- All categories visible

### Tablet (768px - 1023px)
- Two-column layout maintained
- Menu items: 2 columns grid (smaller)
- Cart: Narrower sidebar
- Categories may scroll horizontally

### Mobile (<768px)
- Single column layout
- Menu items: 1 column (full width)
- Cart: Full width below search
- Categories: Horizontal scroll
- Sticky cart at bottom (alternative design)

## Interactions

### Hover Effects
- **Menu Cards**: Shadow increases, image zooms in
- **Buttons**: Background darkens slightly
- **Category Pills**: Background color change

### Click Actions
- **Menu Item Card**: Adds item to cart
- **Plus Button in Cart**: Increases quantity
- **Minus Button in Cart**: Decreases quantity / removes item
- **Category Pill**: Filters menu by category
- **Clear X in Search**: Clears search query
- **Submit KOT**: Submits order (requires table number)
- **Clear All**: Empties cart and table number

### Feedback
- **Toast Notifications**: 
  - Success: Green toast, "Item added to KOT"
  - Success: Green toast, "KOT submitted for Table X"
  - Success: Green toast, "KOT cleared"
  - Error: Red toast, "Please enter table number"
  - Error: Red toast, "Please add items to KOT"

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons
- Focus visible on all interactive elements

### Screen Readers
- Semantic HTML structure
- Descriptive aria-labels
- Image alt texts
- Button labels clear

### Color Contrast
- Text meets WCAG AA standards
- Icons visible in dark/light mode
- Food type indicators distinctive

## Dark Mode Support

All components support dark mode:
- Background: Dark gray
- Text: Light gray/white
- Cards: Slightly lighter dark gray
- Borders: Subtle gray
- Shadows: Adjusted for dark backgrounds
- Food type indicators: Same colors (already distinct)

## Animation & Transitions

- **Card Hover**: 200ms ease-in-out
- **Image Zoom**: 300ms ease-in-out
- **Button Hover**: 150ms ease
- **Category Selection**: 200ms ease
- **Toast Notifications**: Slide in from top

## Typography

- **Page Title**: 3xl, bold
- **Subtitle**: Normal weight, muted color
- **Menu Item Name**: Semibold
- **Menu Item Description**: Small, muted
- **Price**: Large, bold, primary color
- **Cart Title**: XL, bold
- **Cart Item Name**: Medium, semibold
- **Buttons**: Medium, semibold

---

This UI provides a clean, modern, efficient interface for creating kitchen orders with visual appeal and functional design.
