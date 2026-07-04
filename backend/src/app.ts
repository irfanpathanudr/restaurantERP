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
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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

  private initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
      });
    });

    // Import routes
    const authRoutes = require('./routes/auth.routes').default;

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    
    // API documentation (Swagger) will be added here
  }

  private initializeErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
