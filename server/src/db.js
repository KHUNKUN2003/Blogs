import pg from 'pg';
import { config } from './config.js';

const sslConfig = config.databaseUrl.includes('sslmode=require')
  ? { rejectUnauthorized: false }
  : undefined;

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: sslConfig
});

export function query(text, params) {
  return pool.query(text, params);
}
