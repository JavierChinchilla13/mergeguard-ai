import { NextRequest, NextResponse } from "next/server";
import { parseGitHubPRUrl, PRFile } from "@/lib/github";
import { filterAndPrioritizeFiles, chunkFiles } from "@/lib/chunking";
import { runAIReview, ReviewResponse } from "@/lib/gemini";
import { getContextCache } from "@/lib/cache";

/**
 * API Route: /api/analyze-pr
 * Handles fetching PR data from GitHub and performing AI review using Gemini
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "PR URL is required" }, { status: 400 });
    }

    // 1. Parse the URL
    const prDetails = parseGitHubPRUrl(url);
    if (!prDetails) {
      return NextResponse.json({ error: "Invalid GitHub Pull Request URL" }, { status: 400 });
    }

    const { owner, repo, pullNumber } = prDetails;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // 2. Fetch PR files from GitHub API
    console.log(`[API] Fetching PR files for ${owner}/${repo}#${pullNumber}...`);
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
    // We aim for chunks that fit within Gemini's context window comfortably
    const chunks = chunkFiles(relevantFiles);

    if (chunks.length === 0) {
      return NextResponse.json({
        details: prDetails,
        filesCount: 0,
        review: {
          summary: "No relevant files found to analyze in this Pull Request.",
          bugs: [],
          security: [],
          performance: [],
          codeSmells: [],
          suggestions: []
        }
      });
    }

    // 5. Run AI Analysis
    // For now, we analyze the first chunk (highest priority files)
    // In a full production system, we would analyze all chunks and merge results
    const mainDiff = chunks[0].content;
    
    // Attempt to use context caching for the main diff
    let cacheName = null;
    try {
      const cache = getContextCache();
      cacheName = await cache.getOrCreateCache(url, mainDiff);
    } catch (e) {
      console.warn("[API] Cache manager initialization failed, proceeding without cache.");
    }
    
    const reviewResult = await runAIReview(mainDiff, cacheName || undefined);

    // 6. Return the results
    return NextResponse.json({
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
    });

  } catch (error: any) {
    console.error("[API] Unexpected Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while processing the request." },
      { status: 500 }
    );
  }
}
