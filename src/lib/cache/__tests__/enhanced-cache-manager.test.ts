import { enhancedCache } from '../enhanced-cache-manager';

describe('EnhancedCacheManager', () => {
  beforeEach(() => {
    enhancedCache.clear();
  });

  afterAll(() => {
    enhancedCache.destroy();
  });

  it('should store and retrieve data', async () => {
    const key = 'test-key';
    const data = { foo: 'bar' };

    await enhancedCache.set(key, data);
    const retrieved = await enhancedCache.get(key);

    expect(retrieved).toEqual(data);
  });

  it('should handle expired items', async () => {
    const key = 'expired-key';
    const data = { foo: 'bar' };

    await enhancedCache.set(key, data, { ttl: 1 }); // 1ms TTL
    await new Promise(resolve => setTimeout(resolve, 2));
    
    const retrieved = await enhancedCache.get(key);
    expect(retrieved).toBeNull();
  });

  it('should evict items when cache is full', async () => {
    const config = {
      maxSize: 100, // Small size to force eviction
      defaultTTL: 1000
    };

    const cache = enhancedCache.getInstance(config);
    const data = 'x'.repeat(60); // 60 bytes

    await cache.set('key1', data);
    await cache.set('key2', data);

    const key1Data = await cache.get('key1');
    expect(key1Data).toBeNull(); // Should have been evicted

    const key2Data = await cache.get('key2');
    expect(key2Data).toBe(data);
  });

  it('should emit events on operations', async () => {
    const setHandler = jest.fn();
    const deleteHandler = jest.fn();
    const cleanupHandler = jest.fn();

    enhancedCache.on('set', setHandler);
    enhancedCache.on('delete', deleteHandler);
    enhancedCache.on('cleanup', cleanupHandler);

    await enhancedCache.set('test', 'data');
    enhancedCache.delete('test');

    expect(setHandler).toHaveBeenCalled();
    expect(deleteHandler).toHaveBeenCalled();
  });
}); 