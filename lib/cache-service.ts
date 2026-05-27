import crypto from 'crypto';

interface CachedReview {
  data: any;
  timestamp: number;
  hash: string;
}

/**
 * Enhanced server-side caching service for AI reviews
 */
class ReviewCacheService {
  private cache = new Map<string, CachedReview>();
  private readonly TTL = 1000 * 60 * 60; // 1 hour TTL

  /**
   * Generates a unique hash for the PR content to detect changes
   */
  generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Gets a cached review if it exists and hasn't expired
   */
  get(url: string, currentHash: string): any | null {
    const cached = this.cache.get(url);
    
    if (!cached) {
      console.log(`[CACHE MISS] No entry for URL: ${url}`);
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.TTL;
    const isHashMatch = cached.hash === currentHash;

    if (!isExpired && isHashMatch) {
      console.log(`[CACHE HIT] Valid entry found for URL: ${url}`);
      return {
        ...cached.data,
        cacheMetadata: {
          hit: true,
          cachedAt: cached.timestamp,
          reused: true
        }
      };
    }

    if (isExpired) {
      console.log(`[CACHE EXPIRED] Entry for URL: ${url} has expired.`);
      this.cache.delete(url);
    } else if (!isHashMatch) {
      console.log(`[CACHE MISS] Content changed for URL: ${url}. Hash mismatch.`);
    }

    return null;
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
