import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import logger from './config/logger';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
  }

  public initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
      });
    });

    // Import routes (lazy loaded after database connection)
    const authRoutes = require('./routes/auth.routes').default;
    const userRoutes = require('./routes/user.routes').default;
    const roleRoutes = require('./routes/role.routes').default;
    const permissionRoutes = require('./routes/permission.routes').default;
    const restaurantRoutes = require('./routes/restaurant.routes').default;
    const branchRoutes = require('./routes/branch.routes').default;
    const categoryRoutes = require('./routes/category.routes').default;
    const menuItemRoutes = require('./routes/menu-item.routes').default;
    const tableRoutes = require('./routes/table.routes').default;
    const orderRoutes = require('./routes/order.routes').default;
    const kotRoutes = require('./routes/kot.routes').default;
    const customerRoutes = require('./routes/customer.routes').default;
    const inventoryRoutes = require('./routes/inventory.routes').default;
    const paymentRoutes = require('./routes/payment.routes').default;
    const invoiceRoutes = require('./routes/invoice.routes').default;
    const employeeRoutes = require('./routes/employee.routes').default;
    const recipeRoutes = require('./routes/recipe.routes').default;
    const vendorRoutes = require('./routes/vendor.routes').default;
    const kitchenRoutes = require('./routes/kitchen.routes').default;
    const expenseRoutes = require('./routes/expense.routes').default;
    const reservationRoutes = require('./routes/reservation.routes').default;
    const auditLogRoutes = require('./routes/audit-log.routes').default;
    const purchaseOrderRoutes = require('./routes/purchase-order.routes').default;
    const reportRoutes = require('./routes/report.routes').default;
    const dashboardRoutes = require('./routes/dashboard.routes').default;
    const settingRoutes = require('./routes/setting.routes').default;

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/roles', roleRoutes);
    this.app.use('/api/v1/permissions', permissionRoutes);
    this.app.use('/api/v1/restaurants', restaurantRoutes);
    this.app.use('/api/v1/branches', branchRoutes);
    this.app.use('/api/v1/categories', categoryRoutes);
    this.app.use('/api/v1/menu-items', menuItemRoutes);
    this.app.use('/api/v1/tables', tableRoutes);
    this.app.use('/api/v1/orders', orderRoutes);
    this.app.use('/api/v1/kot', kotRoutes);
    this.app.use('/api/v1/customers', customerRoutes);
    this.app.use('/api/v1/inventory', inventoryRoutes);
    this.app.use('/api/v1/payments', paymentRoutes);
    this.app.use('/api/v1/invoices', invoiceRoutes);
    this.app.use('/api/v1/employees', employeeRoutes);
    this.app.use('/api/v1/recipes', recipeRoutes);
    this.app.use('/api/v1/vendors', vendorRoutes);
    this.app.use('/api/v1/kitchens', kitchenRoutes);
    this.app.use('/api/v1/expenses', expenseRoutes);
    this.app.use('/api/v1/reservations', reservationRoutes);
    this.app.use('/api/v1/audit-logs', auditLogRoutes);
    this.app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
    this.app.use('/api/v1/reports', reportRoutes);
    this.app.use('/api/v1/dashboard', dashboardRoutes);
    this.app.use('/api/v1/settings', settingRoutes);
    
    // API documentation (Swagger) will be added here
    
    // Error handling must be added AFTER all routes
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS — allow localhost + LAN IPs (needed for mobile on same Wi‑Fi)
    const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const isDev = process.env.NODE_ENV !== 'production';
    const isPrivateLan = (origin: string) =>
      /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
        origin
      );

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin) {
            callback(null, true);
            return;
          }
          if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
            callback(null, true);
            return;
          }
          // In development, allow phone/tablet on the same Wi‑Fi
          if (isDev && isPrivateLan(origin)) {
            callback(null, true);
            return;
          }
          callback(null, false);
        },
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Cookie parser
    this.app.use(cookieParser());

    // Compression middleware
    this.app.use(compression());

    // HTTP parameter pollution protection
    this.app.use(hpp());

    // Data sanitization
    this.app.use(mongoSanitize());

    // Morgan HTTP logger
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(
        morgan('combined', {
          stream: {
            write: (message: string) => logger.info(message.trim()),
          },
        })
      );
    }

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }
}

const appInstance = new App();
export default appInstance;
