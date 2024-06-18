import { LRUCache } from 'lru-cache';

export const cache = new LRUCache<string, any>({
  max: 200,
  maxSize: 500 * 1024, // 500KB
  sizeCalculation: (value, key) => {
    return typeof value === 'string'
      ? value.length
      : new TextEncoder().encode(JSON.stringify(value)).length;
  },
  ttl: 1000 * 60 * 5, // 5 minutes
  allowStale: false,
});
