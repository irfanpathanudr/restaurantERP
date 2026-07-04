import 'reflect-metadata';
import dotenv from 'dotenv';
import app from './app';
import AppDataSource from './config/database';
import logger from './config/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected successfully');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    logger.error('Database connection failed', { error });
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  try {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error });
    process.exit(1);
  }
});
