# Frontend Quick Start Guide

## 🚀 Start the Frontend

### 1. Navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies (if not done)
```bash
npm install
```

### 3. Create .env file
Create `frontend/.env` file with:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Start development server
```bash
npm run dev
```

The app should open at `http://localhost:3000`

## 🎯 What You'll See

### Without Authentication:
- Login page at `/login`
- Register page at `/register`
- Forgot password page at `/forgot-password`

### With Authentication:
- Dashboard with stats and charts
- Sidebar with 19 menu items (collapsible)
- Header with theme controller, notifications, user menu
- Vendors page (full CRUD example)
- All other pages show "Under Development" placeholder

## 🔑 Test Login

Since backend may not be running yet, you can test the UI by:

1. **Skip authentication temporarily** - Comment out the auth check in App.tsx
2. **Or start the backend** first:
   ```bash
   cd backend
   npm run dev
   ```
   Then use these credentials:
   - Email: `admin@restaurant.com`
   - Password: `Admin@123`

## 🎨 Theme Features to Test

1. **Theme Mode Toggle:**
   - Click the theme buttons in header (Sun/Moon/Monitor icons)
   - Watch the UI switch between Light/Dark/System modes

2. **Theme Color:**
   - Click the palette icon in header
   - Choose from 6 colors: Blue, Green, Purple, Orange, Red, Pink

3. **Sidebar:**
   - Desktop: Click the collapse arrow to minimize sidebar
   - Mobile: Click burger menu to open/close

## 📋 Features Checklist

### ✅ Available Now:
- [x] Dashboard page with stats
- [x] Vendors page (full CRUD with DataTable)
- [x] Dark/Light mode toggle
- [x] Theme color customization
- [x] Responsive sidebar
- [x] Permission-based UI
- [x] DataTable with pagination, search, export

### 🔄 Coming Soon:
- [ ] Orders management page
- [ ] Menu items page
- [ ] Customers page
- [ ] Inventory page
- [ ] Reports page
- [ ] Settings page
- [ ] All other 15+ pages

## 🐛 Troubleshooting

### Blank page?
1. Check browser console (F12) for errors
2. Verify `npm run dev` is running without errors
3. Check if port 3000 is already in use
4. Try clearing browser cache

### "Cannot find module" errors?
```bash
npm install
```

### TypeScript errors?
```bash
npm run build
```

### API connection errors?
1. Check backend is running on port 5000
2. Verify VITE_API_URL in .env
3. Check CORS is enabled in backend

## 📦 Build for Production

```bash
npm run build
```

Built files will be in `frontend/dist/`

## 🔧 Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

## 📝 Next Steps

1. Start backend server
2. Login with admin credentials
3. Explore the Dashboard
4. Test the Vendors page (full CRUD)
5. Try theme switching
6. Test sidebar collapse/expand
7. Check responsive design (resize browser)
