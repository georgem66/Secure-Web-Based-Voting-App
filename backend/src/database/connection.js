import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

class Database {
  constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    this.pool.on('connect', () => {
      logger.info('Database connected successfully');
    });

    this.pool.on('error', (err) => {
      logger.error('Database connection error:', err);
    });
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Executed query', { 
        text: text.substring(0, 100), 
        duration, 
        rows: res.rowCount 
      });
      
      return res;
    } catch (error) {
      logger.error('Database query error:', { 
        text: text.substring(0, 100), 
        error: error.message 
      });
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
    logger.info('Database connection closed');
  }
}

export const database = new Database();