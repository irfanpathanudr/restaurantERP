import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'restaurant_user',
  password: process.env.DB_PASSWORD || 'restaurant_pass',
  database: process.env.DB_NAME || 'restaurant_erp',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '../database/entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../database/migrations/**/*.{ts,js}')],
  subscribers: [path.join(__dirname, '../database/subscribers/**/*.{ts,js}')],
  charset: 'utf8mb4',
  timezone: 'Z',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  extra: {
    connectionLimit: 20,
  },
  poolSize: 20,
  maxQueryExecutionTime: 1000,
  cache: {
    duration: 30000,
  },
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
