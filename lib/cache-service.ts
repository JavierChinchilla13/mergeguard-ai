import crypto from 'crypto';

export type CacheStatus = 'HIT' | 'MISS' | 'INVALIDATED' | 'EXPIRED';

interface CachedReview {
  data: any;
  timestamp: number;
  hash: string;
}

/**
 * Advanced production-grade caching service with verifiable state tracking
 */
class ReviewCacheService {
  private cache = new Map<string, CachedReview>();
  private readonly TTL = 1000 * 60 * 60; // 1 hour TTL

  /**
   * Generates a deterministic hash for the PR content
   */
  generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Gets a cached review with explicit status reporting
   */
  get(url: string, currentHash: string): { data: any | null, status: string, cachedAt?: number, invalidationReason?: string } {
    const cached = this.cache.get(url);
    
    if (!cached) {
      return { data: null, status: 'miss' };
    }

    const isExpired = Date.now() - cached.timestamp > this.TTL;
    const isHashMatch = cached.hash === currentHash;

    if (isExpired) {
      this.cache.delete(url);
      return { data: null, status: 'miss', invalidationReason: 'Cache TTL expired' };
    }

    if (!isHashMatch) {
      console.log(`[CACHE] Hash mismatch for ${url}. Old: ${cached.hash.slice(0,8)}, New: ${currentHash.slice(0,8)}`);
      return { data: null, status: 'invalidated', invalidationReason: 'PR diff hash changed (new commits detected)' };
    }

    return {
      data: {
        ...cached.data,
        metadata: {
          ...cached.data.metadata,
          cacheStatus: 'hit',
          cachedAt: cached.timestamp
        }
      },
      status: 'hit',
      cachedAt: cached.timestamp
    };
  }

  /**
   * Sets a review in the cache
   */
  set(url: string, hash: string, data: any): void {
    this.cache.set(url, {
      data,
      hash,
      timestamp: Date.now()
    });
    console.log(`[CACHE SET] Stored entry for URL: ${url}`);
  }

  /**
   * Cleans up expired entries periodically
   */
  prune(): void {
    const now = Date.now();
    for (const [url, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.TTL) {
        this.cache.delete(url);
      }
    }
  }
}

// Singleton instance
export const reviewCache = new ReviewCacheService();
