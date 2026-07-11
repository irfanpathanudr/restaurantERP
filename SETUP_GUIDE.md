# Restaurant ERP + POS System - Setup Guide

## 📋 Prerequisites

### Required Software:
1. **Node.js** v18.0.0 or higher
2. **MySQL** 8.0 or higher
3. **Git** (for version control)
4. **Docker Desktop** (optional - for containerized MySQL)

### Optional Tools:
- **Postman** or **Insomnia** (for API testing)
- **MySQL Workbench** or **DBeaver** (for database management)
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd restaurantERP
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Setup Database

#### Option A: Using Docker (Recommended)
```bash
# From project root
docker-compose up -d

# Wait for MySQL to be ready (30 seconds)
```

#### Option B: Using Local MySQL
1. Install MySQL 8.0+
2. Create database:
```sql
CREATE DATABASE restaurant_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'restaurant_pass';
GRANT ALL PRIVILEGES ON restaurant_erp.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configure Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

**Important Environment Variables:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=restaurant_user
DB_PASSWORD=restaurant_pass
DB_NAME=restaurant_erp

JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
```

#### Frontend (.env)
```bash
cd frontend
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
```

### 5. Run Database Seeders
```bash
cd backend
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@restaurant.com`
- Password: `Admin@123`

### 6. Start Development Servers

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:5000`

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:3000`

---

## 🔧 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run seed         # Run database seeders
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm test             # Run tests
npm test:watch       # Run tests in watch mode
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code
npm test             # Run tests
npm test:watch       # Run tests in watch mode
```

---

## 📁 Project Structure

```
restaurantERP/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── database/
│   │   │   ├── entities/    # TypeORM entities
│   │   │   ├── migrations/  # Database migrations
│   │   │   └── seeders/     # Database seeders
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── middlewares/     # Express middlewares
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── logs/               # Application logs
│   ├── uploads/            # File uploads
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── config/         # Frontend configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json
│
├── docker-compose.yml      # Docker configuration
├── .env.example           # Environment variables template
└── README.md              # Project documentation
```

---

## 🗄️ Database Schema

The system includes 25+ database entities:
- User, Role, Permission, UserPermission
- Restaurant, Branch, Kitchen, Table
- MenuItem, Category, Recipe, RecipeIngredient
- Order, OrderItem, KOT
- Customer, Employee, Attendance
- Payment, Invoice
- RawMaterial, Vendor, Expense
- Reservation, AuditLog

---

## 🔐 Authentication & Authorization

### JWT Token Flow:
1. User logs in → Receives access token (1 hour) + refresh token (7 days)
2. Access token stored in Redux + localStorage
3. Refresh token used to get new access token when expired
4. All API requests include: `Authorization: Bearer <access_token>`

### Permission System:
- **RBAC**: Role-Based Access Control
- **UBAC**: User-Based Access Control (overrides role permissions)
- Middleware: `checkPermission('permission.name')`

### Default Roles:
1. **Super Admin** - Full system access
2. **Restaurant Manager** - Manages operations & staff
3. **Waiter** - Handles tables & orders
4. **Chef** - Manages KOT & kitchen
5. **Cashier** - Handles billing & payments

---

## 🌐 API Endpoints

### Base URL: `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Roles & Permissions
- `GET /roles` - Get all roles
- `POST /roles` - Create role
- `POST /roles/:id/permissions` - Assign permissions
- `GET /permissions` - Get all permissions

### Restaurants & Branches
- `GET /restaurants` - Get all restaurants
- `POST /restaurants` - Create restaurant
- `GET /branches` - Get all branches
- `POST /branches` - Create branch

### Menu
- `GET /categories` - Get categories
- `GET /menu-items` - Get menu items
- `POST /menu-items` - Create menu item
- `PATCH /menu-items/:id/availability` - Toggle availability

### Orders & KOT
- `GET /orders` - Get all orders
- `POST /orders` - Create order
- `POST /orders/:id/complete` - Complete order
- `GET /kot` - Get KOTs
- `POST /kot` - Create KOT

### Tables
- `GET /tables` - Get all tables
- `POST /tables` - Create table
- `PATCH /tables/:id/status` - Change table status

### Customers
- `GET /customers` - Get all customers
- `POST /customers` - Create customer
- `GET /customers/:id/orders` - Get customer orders

### Inventory
- `GET /inventory` - Get inventory items
- `POST /inventory/:id/adjust-stock` - Adjust stock
- `GET /inventory/low-stock/alert` - Get low stock items

### Payments & Invoices
- `POST /payments` - Process payment
- `POST /payments/:id/refund` - Refund payment
- `POST /invoices` - Create invoice
- `GET /invoices/:id/pdf` - Download PDF

### Employees
- `GET /employees` - Get all employees
- `GET /employees/:id/attendance` - Get attendance

---

## 🧪 Testing

### Run Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

---

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u restaurant_user -p

# Check connection
telnet localhost 3306
```

### Port Already in Use
```bash
# Find process using port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Find process using port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear build cache
rm -rf dist
npm run build
```

---

## 📊 Health Checks

### Backend Health
```bash
curl http://localhost:5000/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-07-11T10:30:00.000Z"
}
```

### Database Health
```bash
# Connect to MySQL
mysql -u restaurant_user -p restaurant_erp

# Show tables
SHOW TABLES;
```

---

## 🚢 Production Deployment

### Build Applications
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Environment Variables (Production)
```env
NODE_ENV=production
DB_HOST=<production-db-host>
JWT_SECRET=<strong-secret-64-chars>
CORS_ORIGIN=https://yourdomain.com
```

### Run Production Server
```bash
# Backend
cd backend
npm start

# Frontend (serve with nginx or similar)
cd frontend/dist
# Deploy to web server
```

---

## 🔒 Security Best Practices

1. **Change default admin password** immediately
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Set secure CORS origins**
5. **Keep dependencies updated**: `npm audit fix`
6. **Use environment variables** for sensitive data
7. **Enable rate limiting** on production
8. **Regular database backups**
9. **Monitor logs** for suspicious activity
10. **Use prepared statements** (TypeORM handles this)

---

## 📞 Support & Resources

- **Documentation**: Check README.md
- **API Testing**: Import Postman collection (coming soon)
- **Issues**: Create GitHub issue
- **Logs**: Check `backend/logs/` directory

---

## 📝 License

Proprietary - All rights reserved

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

Last Updated: July 11, 2026
