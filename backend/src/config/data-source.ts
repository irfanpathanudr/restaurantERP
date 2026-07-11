import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database';

// This file is specifically for TypeORM CLI commands (migrations)
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
