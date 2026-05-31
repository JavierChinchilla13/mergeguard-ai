import { filterAndPrioritizeFiles, chunkFiles } from "./chunking";
import { runAIReview, ReviewResponse, getModelName, AnalysisMetadata } from "./gemini";
import { getContextCache } from "./cache";
import { PRFile } from "./github";
import { CacheStatus } from "./cache-service";

import crypto from 'crypto';

/**
 * Executes a full AI review pipeline with deep observability instrumentation.
 */
export async function executeAIReviewPipeline(
  url: string,
  allFiles: PRFile[],
  githubLatency: number,
  cacheStatus: CacheStatus = 'miss',
  cacheInvalidationReason?: string
): Promise<{ review: ReviewResponse; metadata: AnalysisMetadata }> {
  const startTime = Date.now();
  const chunkingStartTime = Date.now();
  
  const sessionId = `SES-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const contentToHash = allFiles.map(f => f.filename + (f.patch || "")).join("|");
  const fingerprint = crypto.createHash('sha256').update(contentToHash).digest('hex');

  // 1. Filter and Prioritize (with Insight generation)
  const { filtered: relevantFiles, insights } = filterAndPrioritizeFiles(allFiles);
  const skippedCount = allFiles.length - relevantFiles.length;
  
  if (relevantFiles.length === 0) {
    return {
      review: {
        summary: "No source files found to analyze. The PR may contain only ignored files (lockfiles, assets, etc.) or is empty.",
        overallRating: "excellent",
        bugs: [],
        security: [],
        performance: [],
        codeSmells: [],
        architectureConcerns: [],
        suggestions: [],
        positiveFindings: ["PR contains only non-source files."]
      },
      metadata: {
        sessionId,
        fingerprint,
        model: getModelName(),
        totalTokens: 0,
        chunkCount: 0,
        filesAnalyzed: 0,
        filesSkipped: skippedCount,
        duration: Date.now() - startTime,
        cacheStatus,
        cacheMode: 'gemini',
        cacheInvalidationReason,
        latencies: { github: githubLatency, ai: 0, chunking: Date.now() - chunkingStartTime },
        insights,
        retryCount: 0
      }
    };
  }

  // 2. Chunking
  const chunks = chunkFiles(relevantFiles, insights);
  const totalTokens = chunks.reduce((acc, c) => acc + c.tokenCount, 0);
  const chunkingLatency = Date.now() - chunkingStartTime;
  
  console.log(`[PIPELINE] [ID: ${sessionId}] Starting analysis for ${relevantFiles.length} files across ${chunks.length} chunks (~${totalTokens} tokens).`);

  const mergedReview: ReviewResponse = {
    summary: "",
    overallRating: "good",
    bugs: [],
    security: [],
    performance: [],
    codeSmells: [],
    architectureConcerns: [],
    suggestions: [],
    positiveFindings: []
  };

  // We now process ALL chunks in parallel for maximum coverage and minimum latency
  // No silent discarding of data.
  const chunksToProcess = chunks; 
  
  let aiTotalLatency = 0;
  let totalRetries = 0;
  let finalCacheMode: 'gemini' | 'local-fallback' = 'gemini';

  // Process chunks in PARALLEL for significantly reduced latency
  const chunkResults = await Promise.all(chunksToProcess.map(async (chunk, i) => {
    console.log(`[PIPELINE] [ID: ${sessionId}] Processing chunk ${i + 1}/${chunksToProcess.length}...`);
    
    // Attempt context caching with content-aware fingerprints
    let cacheName = null;
    try {
      const cache = getContextCache();
      // FIX: Passing chunk content ensures cache is invalidated on ANY content change
      const cacheResult = await cache.getOrCreateCache(url, chunk.content);
      cacheName = cacheResult.name;
      if (cacheResult.mode === 'local-fallback') {
        finalCacheMode = 'local-fallback';
      }
    } catch {
      console.warn(`[PIPELINE] [ID: ${sessionId}] Cache initialization failed for chunk ${i}`);
      finalCacheMode = 'local-fallback';
    }

    const aiCallStartTime = Date.now();
    const result = await runAIReview(chunk.content, cacheName || undefined);
    const latency = Date.now() - aiCallStartTime;
    
    return { result, latency };
  }));

  // Merge results with high-fidelity deduplication
  const deduplicate = <T extends { title: string; file: string; line: number }>(findings: T[]): T[] => {
    const seen = new Set<string>();
    return findings.filter(f => {
      const key = `${f.title}|${f.file}|${f.line}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  chunkResults.forEach(({ result: chunkResult, latency }, i) => {
    aiTotalLatency += latency;
    totalRetries += chunkResult.retryCount;
    
    if (i === 0) {
      mergedReview.summary = chunkResult.summary;
      mergedReview.overallRating = chunkResult.overallRating;
    } else {
      // Append secondary summaries
      mergedReview.summary += `\n\n[Secondary Segment Audit]: ${chunkResult.summary}`;
      
      // Escalate rating if any chunk finds critical issues
      const ratingsRank = { "critical_issues": 3, "needs_work": 2, "good": 1, "excellent": 0 };
      if (ratingsRank[chunkResult.overallRating] > ratingsRank[mergedReview.overallRating]) {
        mergedReview.overallRating = chunkResult.overallRating;
      }
    }
    
    // Collect all findings
    mergedReview.bugs.push(...chunkResult.bugs);
    mergedReview.security.push(...chunkResult.security);
    mergedReview.performance.push(...chunkResult.performance);
    mergedReview.codeSmells.push(...chunkResult.codeSmells);
    mergedReview.architectureConcerns.push(...chunkResult.architectureConcerns);
    mergedReview.suggestions.push(...chunkResult.suggestions);
    mergedReview.positiveFindings.push(...chunkResult.positiveFindings);
  });

  // Final deduplication to ensure professional, non-redundant reports
  mergedReview.bugs = deduplicate(mergedReview.bugs);
  mergedReview.security = deduplicate(mergedReview.security);
  mergedReview.performance = deduplicate(mergedReview.performance);
  mergedReview.codeSmells = deduplicate(mergedReview.codeSmells);
  mergedReview.architectureConcerns = deduplicate(mergedReview.architectureConcerns);
  mergedReview.suggestions = deduplicate(mergedReview.suggestions);
  mergedReview.positiveFindings = Array.from(new Set(mergedReview.positiveFindings));


  const totalDuration = Date.now() - startTime;
  
  const metadata: AnalysisMetadata = {
    sessionId,
    fingerprint,
    model: getModelName(),
    totalTokens,
    chunkCount: chunks.length,
    filesAnalyzed: relevantFiles.length,
    filesSkipped: skippedCount,
    duration: totalDuration,
    cacheStatus,
    cacheMode: finalCacheMode,
    cacheInvalidationReason,
    latencies: {
      github: githubLatency,
      ai: aiTotalLatency,
      chunking: chunkingLatency
    },
    insights,
    retryCount: totalRetries
  };

  return { review: mergedReview, metadata };
}
