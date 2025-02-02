import { ErrorLogger } from '@/lib/errors/logger';
import { EventEmitter } from 'events';

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

interface CacheItem<T> {
  data: T;
  expiresAt: number;
  lastAccessed: number;
  size: number;
}

export class EnhancedCacheManager extends EventEmitter {
  private static instance: EnhancedCacheManager;
  private cache: Map<string, CacheItem<any>>;
  private currentSize: number = 0;
  private cleanupTimer: NodeJS.Timer | null = null;
  private readonly config: CacheConfig;

  private constructor(config: Partial<CacheConfig> = {}) {
    super();
    this.cache = new Map();
    this.config = {
      maxSize: config.maxSize || 100 * 1024 * 1024, // 100MB default
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes default
      cleanupInterval: config.cleanupInterval || 60 * 1000 // 1 minute default
    };
    this.startCleanupTimer();
  }

  static getInstance(config?: Partial<CacheConfig>): EnhancedCacheManager {
    if (!this.instance) {
      this.instance = new EnhancedCacheManager(config);
    }
    return this.instance;
  }

  async set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      size?: number;
      priority?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<void> {
    try {
      const size = options.size || this.calculateSize(data);
      
      // Check if we need to make space
      if (this.currentSize + size > this.config.maxSize) {
        await this.evictItems(size);
      }

      const expiresAt = Date.now() + (options.ttl || this.config.defaultTTL);
      
      this.cache.set(key, {
        data,
        expiresAt,
        lastAccessed: Date.now(),
        size
      });

      this.currentSize += size;
      this.emit('set', { key, size });
    } catch (error) {
      ErrorLogger.error('Cache set error:', error as Error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (item.expiresAt < Date.now()) {
      this.delete(key);
      return null;
    }

    item.lastAccessed = Date.now();
    return item.data as T;
  }

  delete(key: string): void {
    const item = this.cache.get(key);
    if (item) {
      this.currentSize -= item.size;
      this.cache.delete(key);
      this.emit('delete', { key, size: item.size });
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.emit('clear');
  }

  private async evictItems(requiredSize: number): Promise<void> {
    // Sort items by last accessed time and priority
    const items = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    let freedSpace = 0;
    const evictedKeys: string[] = [];

    for (const [key, item] of items) {
      if (freedSpace >= requiredSize) break;
      
      freedSpace += item.size;
      evictedKeys.push(key);
    }

    // Remove evicted items
    evictedKeys.forEach(key => this.delete(key));
    
    if (freedSpace < requiredSize) {
      throw new Error('Unable to free enough cache space');
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    let freedSpace = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        freedSpace += item.size;
        this.delete(key);
      }
    }

    if (freedSpace > 0) {
      this.emit('cleanup', { freedSpace });
    }
  }

  private calculateSize(data: any): number {
    try {
      const str = JSON.stringify(data);
      return str.length * 2; // Approximate size in bytes
    } catch {
      return 1024; // Default size if can't calculate
    }
  }

  getStats(): {
    itemCount: number;
    currentSize: number;
    maxSize: number;
    utilizationPercentage: number;
  } {
    return {
      itemCount: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.config.maxSize,
      utilizationPercentage: (this.currentSize / this.config.maxSize) * 100
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
    this.removeAllListeners();
  }
}

export const enhancedCache = EnhancedCacheManager.getInstance(); 