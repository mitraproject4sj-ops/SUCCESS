interface CacheEntry {
  data: any;
  timestamp: number;
  size: number;
}

export class MemoryCache {
  private cache: Map<string, CacheEntry>;
  private maxMemoryMB: number;
  private currentSize: number;

  constructor(maxMemoryMB: number) {
    this.cache = new Map();
    this.maxMemoryMB = maxMemoryMB;
    this.currentSize = 0;
  }

  set(key: string, value: any, ttl: number = 3600000) { // Default TTL: 1 hour
    const size = this.calculateSize(value);
    
    // Check if adding this item would exceed memory limit
    if (this.currentSize + size > this.maxMemoryMB * 1024 * 1024) {
      this.clearSpace(size);
    }

    const entry: CacheEntry = {
      data: value,
      timestamp: Date.now(),
      size
    };

    this.cache.set(key, entry);
    this.currentSize += size;

    // Set expiry
    setTimeout(() => this.delete(key), ttl);
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < 3600000) {
      return entry.data;
    }
    this.delete(key);
    return null;
  }

  delete(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  clearOldEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > 3600000) {
        this.delete(key);
      }
    }
  }

  private calculateSize(value: any): number {
    // Rough estimation of object size in bytes
    const str = JSON.stringify(value);
    return str.length * 2; // Unicode characters can use 2 bytes
  }

  private clearSpace(requiredSize: number) {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (const [key] of entries) {
      this.delete(key);
      if (this.currentSize + requiredSize <= this.maxMemoryMB * 1024 * 1024) {
        break;
      }
    }
  }

  getStats() {
    return {
      entries: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.maxMemoryMB * 1024 * 1024
    };
  }
}