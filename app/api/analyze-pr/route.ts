import { NextRequest, NextResponse } from "next/server";
import { parseGitHubPRUrl, PRFile } from "@/lib/github";

/**
 * API Route: /api/analyze-pr
 * Handles fetching PR data from GitHub for analysis
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "PR URL is required" },
        { status: 400 }
      );
    }

    // 1. Parse the URL
    const prDetails = parseGitHubPRUrl(url);

    if (!prDetails) {
      return NextResponse.json(
        { error: "Invalid GitHub Pull Request URL" },
        { status: 400 }
      );
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

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
      { headers }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API] GitHub API Error: ${response.status}`, errorData);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Pull Request not found. It might be private or deleted." },
          { status: 404 }
        );
      }
      
      if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `GitHub API error: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }

    const files: PRFile[] = await response.json();

    // 3. Return the results
    return NextResponse.json({
      details: prDetails,
      filesCount: files.length,
      files: files.map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch // This is the diff/patch
      }))
    });

  } catch (error) {
    console.error("[API] Unexpected Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the request." },
      { status: 500 }
    );
  }
}
