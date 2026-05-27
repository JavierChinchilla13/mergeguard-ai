import { GoogleAICacheManager } from "@google/generative-ai/server";
import { getModelName } from "./gemini";

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
    // Cache manager requires 'models/' prefix
    // For 2.0-flash, we use a specific stable version for caching if needed
    // However, the base model name usually works if prepended with models/
    return baseModel.startsWith("models/") ? baseModel : `models/${baseModel}`;
  }

  /**
   * Generates a cache key based on the PR URL and content hash
   */
  private generateDisplayName(url: string): string {
    // Display names must be unique and descriptive
    const cleanUrl = url.replace(/[^a-zA-Z0-9]/g, '-').slice(-40);
    return `mergeguard-cache-${cleanUrl}`;
  }

  /**
   * Attempts to create or retrieve a cache for the given content
   */
  async getOrCreateCache(url: string, content: string): Promise<string | null> {
    try {
      const displayName = this.generateDisplayName(url);
      
      console.log(`[CACHE] Checking for existing cache: ${displayName}`);
      
      // List existing caches and look for a match
      const caches = await this.cacheManager.list();
      const existingCache = caches.cachedContents?.find(c => c.displayName === displayName);

      if (existingCache && existingCache.name) {
        console.log(`[CACHE HIT] Found existing cache: ${existingCache.name}`);
        return existingCache.name;
      }

      console.log(`[CACHE MISS] Creating new cache for: ${url}`);
      
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
      return cache.name || null;

    } catch (error) {
      console.error(`[CACHE ERROR] Failed to manage context cache:`, error);
      return null; // Fallback to non-cached request
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
