# Restaurant ERP + POS Management System

A complete, production-ready Restaurant ERP and POS Management System built with enterprise-grade architecture and modern tech stack.

## 🚀 Features

### Core Modules (24 Complete Modules)

1. **Authentication & Authorization**
   - JWT-based authentication with access and refresh tokens
   - Role-Based Access Control (RBAC)
   - User-Based Access Control (UBAC)
   - Password reset with OTP verification
   - Session management and device tracking

2. **User Management**
   - Complete CRUD operations
   - Employee profiles
   - Password policy enforcement
   - Soft delete support

3. **Dashboard & Analytics**
   - Real-time business metrics
   - Sales analytics
   - Inventory alerts
   - Performance charts

4. **Menu Management**
   - Categories and sub-categories
   - Menu items with variants
   - Dynamic pricing
   - Nutritional information
   - Allergen tracking

5. **Order Management**
   - Dine-in, Take-away, and Delivery
   - Order tracking
   - Payment processing
   - Split and merge bills

6. **Table Management**
   - Visual table layout
   - Reservations
   - Table merging and splitting
   - Real-time status updates

7. **KOT (Kitchen Order Ticket)**
   - Live kitchen screen
   - Order prioritization
   - Cooking status tracking
   - Kitchen printer integration

8. **Inventory Management**
   - Raw material tracking
   - FIFO stock valuation
   - Auto-deduction on orders
   - Low stock alerts
   - Batch and expiry tracking

9. **Recipe Management**
   - Ingredient mapping
   - Cost calculation
   - Recipe versioning

10. **Vendor Management**
    - Supplier profiles
    - Purchase history
    - Payment tracking
    - Vendor ratings

11. **Customer Management**
    - Customer profiles
    - Loyalty programs
    - Membership tiers
    - Visit history

12. **Employee Management**
    - Employee records
    - Attendance tracking
    - Shift management
    - Document storage

13. **Payroll & Salary**
    - Salary structures
    - Attendance integration
    - Payslip generation
    - Deductions and allowances

14. **Expense Management**
    - Expense categorization
    - Approval workflows
    - Recurring expenses

15. **Accounting**
    - General ledger
    - Profit & Loss
    - Balance sheet
    - Trial balance

16. **Reports & Analytics**
    - Sales reports
    - Inventory reports
    - Financial reports
    - Custom date ranges

17. **Invoice Management**
    - GST-compliant invoices
    - Credit/Debit notes
    - PDF generation
    - QR code integration

18. **Notifications**
    - Email notifications
    - SMS alerts
    - WhatsApp integration
    - Push notifications

19. **Audit Logs**
    - Complete action tracking
    - User activity logs
    - Compliance reporting

20. **Settings**
    - System configuration
    - Theme management
    - Printer settings
    - Backup and restore

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **React Router** for navigation
- **TanStack Query** for server state
- **Redux Toolkit** for global state
- **React Hook Form** + **Zod** for forms
- **Framer Motion** for animations
- **Chart.js** / **Recharts** for charts

### Backend
- **Node.js** + **Express.js**
- **TypeScript** for type safety
- **TypeORM** for database ORM
- **MySQL 8.0** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Winston** for logging
- **Swagger** for API documentation
- **Jest** for testing

### Security
- Helmet for security headers
- Rate limiting
- CORS protection
- CSRF protection
- XSS protection
- SQL injection prevention
- Input sanitization

### DevOps
- **Docker** and **Docker Compose**
- **GitHub Actions** for CI/CD
- Environment-based configuration
- Health check endpoints

## 📦 Project Structure

```
restaurant-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access layer
│   │   ├── resources/       # SQL queries and constants
│   │   ├── database/
│   │   │   ├── entities/    # TypeORM entities
│   │   │   ├── migrations/  # Database migrations
│   │   │   └── seeders/     # Data seeders
│   │   ├── middlewares/     # Express middlewares
│   │   ├── routes/          # API routes
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── validators/      # Validation schemas
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── tests/               # Test files
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # Layout components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration
│   ├── Dockerfile
│   └── package.json
├── docker/                  # Docker configurations
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MySQL 8.0
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **One-click start (Windows — recommended)**

   Double-click **`START_ALL.bat`** in the project root.

   It will:
   - Auto-detect your PC LAN IP
   - Update `backend/.env`, `frontend/.env`, and `kot/.env` (API URL + CORS)
   - Install missing dependencies
   - Open Backend (5000), Frontend (3000), and KOT (3001) in separate windows

   Stop everything with **`STOP_ALL.bat`**.

   First-time DB setup (once): run **`SETUP_SCRIPT.bat`**, or:
   ```bash
   cd backend
   npm run migration:run
   npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:3000  (or http://YOUR_LAN_IP:3000)
   - KOT app: http://localhost:3001  (phone: http://YOUR_LAN_IP:3001)
   - Backend API: http://localhost:5000
   - Login: `admin@example.com` / `admin123`

### Database Setup

```bash
# Run migrations
cd backend
npm run migration:run

# Seed initial data
npm run seed
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_erp
DB_USER=restaurant_user
DB_PASSWORD=your_password

# Application
NODE_ENV=development
PORT=5000
FRONTEND_PORT=3000

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# API
VITE_API_URL=http://localhost:5000/api/v1
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- auth.test.ts
```

## 📚 API Documentation

API documentation is available via Swagger UI at:
```
http://localhost:5000/api-docs
```

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (10 salt rounds)
- Account lockout after 5 failed attempts
- Rate limiting (100 requests per minute)
- Helmet for security headers
- CORS protection
- XSS protection
- SQL injection prevention
- Input sanitization
- Audit logging

## 🎯 Architecture Principles

- **Clean Architecture** - Separation of concerns
- **SOLID Principles** - Maintainable code
- **Repository Pattern** - Data access abstraction
- **Service Pattern** - Business logic encapsulation
- **Dependency Injection** - Loose coupling
- **Resource Layer** - Centralized queries

## 📊 Database Design

- Normalized relational design (3NF)
- UUID primary keys
- Audit columns (created_at, updated_at, etc.)
- Soft delete support
- Foreign key constraints
- Indexed frequently queried columns
- Database migrations for version control

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. Build the applications:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run database migrations:
   ```bash
   npm run migration:run
   ```

4. Start the applications:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Built with enterprise-grade architecture
- Production-ready code
- Scalable and maintainable
- Complete security implementation

## 📞 Support

For support, email support@restaurant-erp.com

---

**Note**: This is a complete production-ready system. All modules are designed to handle thousands of customers and millions of records with enterprise-grade reliability, security, and performance.
