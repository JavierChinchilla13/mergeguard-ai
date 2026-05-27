/**
 * Advanced AI review pipeline with large PR support, file prioritization, and result merging.
 */

import { filterAndPrioritizeFiles, chunkFiles, ChunkedDiff } from "./chunking";
import { runAIReview, ReviewResponse, getModelName } from "./gemini";
import { getContextCache } from "./cache";

export interface AnalysisMetadata {
  model: string;
  totalTokens: number;
  chunkCount: number;
  filesAnalyzed: number;
  filesSkipped: number;
  duration: number;
  cacheStatus: 'hit' | 'miss';
  cachedAt?: number;
}

/**
 * Executes a full AI review pipeline, handling large PRs via incremental chunking.
 */
export async function executeAIReviewPipeline(
  url: string,
  allFiles: any[]
): Promise<{ review: ReviewResponse; metadata: AnalysisMetadata }> {
  const startTime = Date.now();
  
  // 1. Filter and Prioritize
  const relevantFiles = filterAndPrioritizeFiles(allFiles);
  const skippedCount = allFiles.length - relevantFiles.length;
  
  // 2. Chunking
  const chunks = chunkFiles(relevantFiles);
  const totalTokens = chunks.reduce((acc, c) => acc + c.tokenCount, 0);
  
  console.log(`[PIPELINE] Starting analysis for ${relevantFiles.length} files across ${chunks.length} chunks (~${totalTokens} tokens).`);

  const mergedReview: ReviewResponse = {
    summary: "",
    overallRating: "good",
    bugs: [],
    security: [],
    performance: [],
    codeSmells: [],
    architectureConcerns: [],
    suggestions: [],
    positiveFeedback: []
  };

  // 3. Process Chunks
  const CHUNK_PROCESS_LIMIT = 3;
  const chunksToProcess = chunks.slice(0, CHUNK_PROCESS_LIMIT);

  for (let i = 0; i < chunksToProcess.length; i++) {
    const chunk = chunksToProcess[i];
    console.log(`[PIPELINE] Processing chunk ${i + 1}/${chunksToProcess.length} (${chunk.files.length} files)...`);
    
    // Attempt context caching per chunk or per PR URL
    let cacheName = null;
    try {
      const cache = getContextCache();
      cacheName = await cache.getOrCreateCache(`${url}-chunk-${i}`, chunk.content);
    } catch (e) {
      console.warn(`[PIPELINE] Cache failed for chunk ${i}, skipping...`);
    }

    const chunkResult = await runAIReview(chunk.content, cacheName || undefined);
    
    // 4. Merge results
    if (i === 0) {
      mergedReview.summary = chunkResult.summary;
      mergedReview.overallRating = chunkResult.overallRating;
    } else {
      mergedReview.summary += `\n\n[Chunk ${i + 1}]: ${chunkResult.summary}`;
      
      // Merge Rating (take the most severe)
      const ratingsRank = { "critical_issues": 3, "needs_work": 2, "good": 1, "excellent": 0 };
      if (ratingsRank[chunkResult.overallRating] > ratingsRank[mergedReview.overallRating]) {
        mergedReview.overallRating = chunkResult.overallRating;
      }
    }
    
    mergedReview.bugs.push(...chunkResult.bugs);
    mergedReview.security.push(...chunkResult.security);
    mergedReview.performance.push(...chunkResult.performance);
    mergedReview.codeSmells.push(...chunkResult.codeSmells);
    mergedReview.architectureConcerns.push(...chunkResult.architectureConcerns);
    mergedReview.suggestions.push(...chunkResult.suggestions);
    mergedReview.positiveFeedback.push(...chunkResult.positiveFeedback);
  }

  if (chunks.length > CHUNK_PROCESS_LIMIT) {
    mergedReview.summary += `\n\n⚠️ NOTE: Only the first ${CHUNK_PROCESS_LIMIT} chunks were analyzed due to PR size limits.`;
  }

  const duration = Date.now() - startTime;
  
  const metadata: AnalysisMetadata = {
    model: getModelName(),
    totalTokens,
    chunkCount: chunks.length,
    filesAnalyzed: relevantFiles.length,
    filesSkipped: skippedCount,
    duration,
    cacheStatus: 'miss'
  };

  return { review: mergedReview, metadata };
}
