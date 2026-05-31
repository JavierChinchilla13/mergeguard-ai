import { GoogleAICacheManager } from "@google/generative-ai/server";
import { getModelName } from "./gemini";
import crypto from "crypto";

/**
 * Utility for verifiable Gemini Context Caching
 */

export interface CacheMetadata {
  name: string;
  model: string;
  ttlSeconds: number;
  expireTime: string;
}

/**
 * Manages Gemini context caches
 */
export class ContextCacheManager {
  private cacheManager: GoogleAICacheManager;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_key_here") {
      throw new Error("Missing GEMINI_API_KEY for cache manager.");
    }
    this.cacheManager = new GoogleAICacheManager(apiKey);
  }

  /**
   * Helper to get the canonical model name for caching
   */
  private getCacheModelName(): string {
    const baseModel = getModelName();
    return baseModel.startsWith("models/") ? baseModel : `models/${baseModel}`;
  }

  /**
   * Generates a deterministic cache key based on the PR URL and content hash
   */
  private generateDisplayName(url: string, content: string): string {
    // Generate a unique hash for the chunk content
    const contentHash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
    
    // Clean URL for descriptive display (last 20 chars)
    const cleanUrl = url.replace(/[^a-zA-Z0-9]/g, '-').slice(-20);
    
    // Format: mg-{url-segment}-{short-hash}
    return `mg-${cleanUrl}-${contentHash}`;
  }

  /**
   * Attempts to create or retrieve a cache for the given content
   */
  async getOrCreateCache(url: string, content: string): Promise<{ name: string | null; mode: 'gemini' | 'local-fallback' }> {
    try {
      const displayName = this.generateDisplayName(url, content);
      
      console.log(`[CACHE] Looking for content-aware cache: ${displayName}`);
      
      // List existing caches and look for a match
      const caches = await this.cacheManager.list();
      const existingCache = caches.cachedContents?.find(c => c.displayName === displayName);

      if (existingCache && existingCache.name) {
        console.log(`[CACHE HIT] Valid context cache found: ${existingCache.name}`);
        return { name: existingCache.name, mode: 'gemini' };
      }

      console.log(`[CACHE MISS] No valid cache for this content version. Creating...`);
      
      // Create new cache with 1 hour TTL
      const cache = await this.cacheManager.create({
        model: this.getCacheModelName(),
        displayName: displayName,
        contents: [
          {
            role: "user",
            parts: [{ text: content }]
          }
        ],
        ttlSeconds: 3600 // 1 hour
      });

      console.log(`[CACHE CREATED] Name: ${cache.name}, Expires: ${cache.expireTime}`);
      return { name: cache.name || null, mode: 'gemini' };

    } catch (error: any) {
      const errorMsg = error?.message || "";
      const isQuotaExceeded = errorMsg.includes("429") || 
                             errorMsg.includes("quota") || 
                             errorMsg.includes("TotalCachedContentStorageTokensPerModelFreeTier");
      
      const isTooSmall = errorMsg.includes("too small") || 
                         errorMsg.includes("1024") || 
                         (error?.status === 400 && errorMsg.includes("token_count"));

      if (isQuotaExceeded) {
        console.warn(`[CACHE FALLBACK] Gemini cache storage unavailable on current free tier`);
        console.warn(`[CACHE FALLBACK] Using deterministic local SHA-256 cache instead`);
        return { name: null, mode: 'local-fallback' };
      }

      if (isTooSmall) {
        console.log(`[CACHE SKIP] Content size below Gemini's 1024 token minimum for context caching`);
        console.log(`[CACHE SKIP] Proceeding with standard local SHA-256 cache verification`);
        return { name: null, mode: 'local-fallback' };
      }

      console.error(`[CACHE ERROR] Unexpected failure in Gemini cache manager:`, error);
      return { name: null, mode: 'local-fallback' };
    }
  }

  /**
   * Cleanup expired or specific caches
   */
  async deleteCache(name: string): Promise<void> {
    try {
      await this.cacheManager.delete(name);
      console.log(`[CACHE DELETED] ${name}`);
    } catch (error) {
      console.error(`[CACHE DELETE ERROR]`, error);
    }
  }
}

let cacheManagerInstance: ContextCacheManager | null = null;

export function getContextCache() {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new ContextCacheManager();
  }
  return cacheManagerInstance;
}
