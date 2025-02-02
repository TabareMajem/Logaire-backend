import { Pool, PoolClient, PoolConfig } from 'pg';
import { ErrorLogger } from '../errors/logger';

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
}

export class DatabaseConnectionManager {
  private pool: Pool;
  private readonly metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    waitingClients: 0
  };

  constructor(config: PoolConfig) {
    this.pool = new Pool({
      ...config,
      max: config.max || 20, // Maximum pool size
      idleTimeoutMillis: config.idleTimeoutMillis || 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000 // Return an error after 2 seconds if connection could not be established
    });

    this.setupEventListeners();
    this.startMetricsCollection();
  }

  private setupEventListeners(): void {
    this.pool.on('connect', (client: PoolClient) => {
      this.metrics.totalConnections++;
      this.metrics.activeConnections++;
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.metrics.totalConnections--;
      this.metrics.activeConnections--;
    });

    this.pool.on('error', (err: Error, client: PoolClient) => {
      ErrorLogger.error('Unexpected error on idle client', err);
    });
  }

  private startMetricsCollection(): void {
    setInterval(async () => {
      try {
        const poolState = await this.pool.query('SELECT count(*) from pg_stat_activity');
        this.metrics.activeConnections = parseInt(poolState.rows[0].count);
        this.metrics.idleConnections = this.metrics.totalConnections - this.metrics.activeConnections;
      } catch (error) {
        ErrorLogger.error('Error collecting connection metrics:', error as Error);
      }
    }, 60000); // Collect metrics every minute
  }

  async getConnection(): Promise<PoolClient> {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      ErrorLogger.error('Error getting database connection:', error as Error);
      throw error;
    }
  }

  async query<T>(sql: string, params?: any[]): Promise<T> {
    const client = await this.getConnection();
    try {
      const result = await client.query(sql, params);
      return result.rows as T;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getConnection();
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

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  async cleanup(): Promise<void> {
    await this.pool.end();
  }
}

// Create and export singleton instance
export const dbManager = new DatabaseConnectionManager({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}); 