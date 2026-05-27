import { filterAndPrioritizeFiles, chunkFiles, ChunkedDiff, FileInsight } from "./chunking";
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
  latencies: {
    github: number;
    ai: number;
    chunking: number;
  };
  insights: FileInsight[];
  retryCount: number;
}

/**
 * Executes a full AI review pipeline with deep observability instrumentation.
 */
export async function executeAIReviewPipeline(
  url: string,
  allFiles: any[],
  githubLatency: number
): Promise<{ review: ReviewResponse; metadata: AnalysisMetadata }> {
  const startTime = Date.now();
  const chunkingStartTime = Date.now();
  
  // 1. Filter and Prioritize (with Insight generation)
  const { filtered: relevantFiles, insights } = filterAndPrioritizeFiles(allFiles);
  const skippedCount = allFiles.length - relevantFiles.length;
  
  // 2. Chunking
  const chunks = chunkFiles(relevantFiles);
  const totalTokens = chunks.reduce((acc, c) => acc + c.tokenCount, 0);
  const chunkingLatency = Date.now() - chunkingStartTime;
  
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

  const CHUNK_PROCESS_LIMIT = 1; 
  const chunksToProcess = chunks.slice(0, CHUNK_PROCESS_LIMIT);
  
  let aiTotalLatency = 0;
  let totalRetries = 0;

  for (let i = 0; i < chunksToProcess.length; i++) {
    const chunk = chunksToProcess[i];
    console.log(`[PIPELINE] Processing chunk ${i + 1}/${chunksToProcess.length}...`);
    
    // Attempt context caching
    let cacheName = null;
    try {
      const cache = getContextCache();
      cacheName = await cache.getOrCreateCache(`${url}-chunk-${i}`, chunk.content);
    } catch (e) {
      console.warn(`[PIPELINE] Cache initialization failed for chunk ${i}`);
    }

    const aiCallStartTime = Date.now();
    const chunkResult = await runAIReview(chunk.content, cacheName || undefined);
    aiTotalLatency += (Date.now() - aiCallStartTime);
    totalRetries += chunkResult.retryCount;
    
    // Merge results
    if (i === 0) {
      mergedReview.summary = chunkResult.summary;
      mergedReview.overallRating = chunkResult.overallRating;
    } else {
      mergedReview.summary += `\n\n[Chunk ${i + 1}]: ${chunkResult.summary}`;
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

  const totalDuration = Date.now() - startTime;
  
  const metadata: AnalysisMetadata = {
    model: getModelName(),
    totalTokens,
    chunkCount: chunks.length,
    filesAnalyzed: relevantFiles.length,
    filesSkipped: skippedCount,
    duration: totalDuration,
    cacheStatus: 'miss',
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
