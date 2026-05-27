import { NextRequest, NextResponse } from "next/server";
import { parseGitHubPRUrl, PRFile } from "@/lib/github";
import { reviewCache } from "@/lib/cache-service";
import { executeAIReviewPipeline } from "@/lib/pipeline";

/**
 * API Route: /api/analyze-pr
 * Handles fetching PR data from GitHub and performing AI review using Gemini with advanced caching and chunking.
 */
export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[API INVOCATION] [ID: ${requestId}] [${new Date().toISOString()}]`);

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

    // 3. Generate content hash for cache verification
    // We hash the filenames + patches to detect any changes in the PR
    const contentToHash = allFiles.map(f => f.filename + (f.patch || "")).join("|");
    const prHash = reviewCache.generateHash(contentToHash);

    // 4. Check Advanced Server Cache
    const cachedResult = reviewCache.get(url, prHash);
    if (cachedResult) {
      console.log(`[API CACHE HIT] [ID: ${requestId}] Returning verified cached results for: ${url}`);
      return NextResponse.json(cachedResult);
    }

    // 5. Run AI Review Pipeline (Intelligent Chunking & Processing)
    const { review, metadata } = await executeAIReviewPipeline(url, allFiles);

    // 6. Construct Final Response
    const finalResponse = {
      details: prDetails,
      filesCount: allFiles.length,
      files: allFiles.map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch
      })),
      review,
      metadata
    };

    // 7. Store in Cache
    reviewCache.set(url, prHash, finalResponse);

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    console.error(`[API ERROR] [ID: ${requestId}]:`, error);
    
    const errorMessage = error.message || "An unexpected error occurred while processing the request.";
    let status = 500;
    
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
