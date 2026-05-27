import { NextRequest, NextResponse } from "next/server";
import { parseGitHubPRUrl, PRFile } from "@/lib/github";
import { filterAndPrioritizeFiles, chunkFiles } from "@/lib/chunking";
import { runAIReview, ReviewResponse } from "@/lib/gemini";
import { getContextCache } from "@/lib/cache";

// Global in-memory cache for PR results to avoid redundant API calls
const resultsCache = new Map<string, any>();

/**
 * API Route: /api/analyze-pr
 * Handles fetching PR data from GitHub and performing AI review using Gemini
 */
export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "PR URL is required" }, { status: 400 });
    }

    // Check if we already have a cached result for this URL
    if (resultsCache.has(url)) {
      console.log(`[API CACHE HIT] [ID: ${requestId}] Returning cached results for: ${url}`);
      return NextResponse.json(resultsCache.get(url));
    }

    console.log(`[API INVOCATION] [ID: ${requestId}] [${new Date().toISOString()}] URL: ${url}`);

    // 1. Parse the URL
    const prDetails = parseGitHubPRUrl(url);
    if (!prDetails) {
      return NextResponse.json({ error: "Invalid GitHub Pull Request URL" }, { status: 400 });
    }

    const { owner, repo, pullNumber } = prDetails;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // 2. Fetch PR files from GitHub API
    console.log(`[API] [ID: ${requestId}] Fetching PR files for ${owner}/${repo}#${pullNumber}...`);
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MergeGuard-AI",
    };

    if (GITHUB_TOKEN && GITHUB_TOKEN !== "your_token_here") {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    const ghResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`,
      { headers }
    );

    if (!ghResponse.ok) {
      const errorData = await ghResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: `GitHub API error: ${errorData.message || ghResponse.statusText}` },
        { status: ghResponse.status }
      );
    }

    const allFiles: PRFile[] = await ghResponse.json();

    // 3. Filter and Prioritize Files
    const relevantFiles = filterAndPrioritizeFiles(allFiles);
    
    // 4. Chunk Diffs for AI analysis
    const chunks = chunkFiles(relevantFiles);
    const totalEstimatedTokens = chunks.reduce((acc, c) => acc + c.tokenCount, 0);
    console.log(`[API] [ID: ${requestId}] Total estimated tokens: ${totalEstimatedTokens} across ${chunks.length} chunks.`);

    if (chunks.length === 0) {
      return NextResponse.json({
        details: prDetails,
        filesCount: 0,
        review: {
          summary: "No relevant source files found to analyze in this Pull Request.",
          bugs: [], security: [], performance: [], codeSmells: [], suggestions: []
        }
      });
    }

    // 5. Run AI Analysis with aggressive safeguards
    const CHUNK_LIMIT = 1;
    if (chunks.length > CHUNK_LIMIT) {
      console.warn(`[API] [ID: ${requestId}] PR is too large (${chunks.length} chunks). Only analyzing the first chunk.`);
    }

    const mainDiff = chunks[0].content;
    
    // Attempt to use context caching
    let cacheName = null;
    try {
      const cache = getContextCache();
      cacheName = await cache.getOrCreateCache(url, mainDiff);
    } catch (e) {
      console.warn(`[API] [ID: ${requestId}] Cache manager failed, proceeding without cache.`);
    }
    
    console.log(`[GEMINI REQUEST #1] [ID: ${requestId}] Sending chunk to AI review pipeline...`);
    const reviewResult = await runAIReview(mainDiff, cacheName || undefined);

    // If PR was truncated, add a warning to the summary
    if (chunks.length > CHUNK_LIMIT) {
      reviewResult.summary = `[⚠️ PARTIAL REVIEW] ${reviewResult.summary} (Note: This PR was too large for full analysis; only core logic was reviewed.)`;
    }

    const duration = Date.now() - startTime;
    console.log(`[API SUCCESS] [ID: ${requestId}] Completed in ${duration}ms`);

    const finalResponse = {
      details: prDetails,
      filesCount: allFiles.length,
      files: relevantFiles.map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch
      })),
      review: reviewResult
    };

    // Store in cache
    resultsCache.set(url, finalResponse);

    // 6. Return the results
    return NextResponse.json(finalResponse);

  } catch (error: any) {
    console.error(`[API ERROR] [ID: ${requestId}]:`, error);
    
    const errorMessage = error.message || "An unexpected error occurred while processing the request.";
    let status = 500;
    
    // Categorize errors for the frontend, but avoid using 404 for model missing errors
    // as it confuses the browser into thinking the route itself is missing.
    if (errorMessage.includes("quota exceeded") || errorMessage.includes("429")) {
      status = 429;
    } else if (errorMessage.includes("invalid") || errorMessage.includes("required")) {
      status = 400;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
