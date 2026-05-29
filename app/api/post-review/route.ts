import { NextRequest, NextResponse } from "next/server";
import { formatGitHubComment } from "@/lib/github-format";

/**
 * API Route: /api/post-review
 * Posts the AI review results as a comment on the GitHub PR
 */
export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[POST-REVIEW] [ID: ${requestId}] Request received`);

  try {
    const { owner, repo, pullNumber, review, metadata } = await req.json();

    if (!owner || !repo || !pullNumber || !review || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields (owner, repo, pullNumber, review, or metadata)" },
        { status: 400 }
      );
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN || GITHUB_TOKEN === "your_token_here") {
      return NextResponse.json(
        { error: "GitHub token is not configured on the server." },
        { status: 500 }
      );
    }

    // 1. Format the Markdown comment
    const commentBody = formatGitHubComment(review, metadata);

    // 2. Post to GitHub REST API
    // Endpoint: POST /repos/{owner}/{repo}/issues/{issue_number}/comments
    // Note: GitHub treats PRs as issues for the sake of commenting.
    console.log(`[POST-REVIEW] [ID: ${requestId}] Posting to ${owner}/${repo}#${pullNumber}...`);

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "Authorization": `token ${GITHUB_TOKEN}`,
          "User-Agent": "MergeGuard-AI",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: commentBody }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`[POST-REVIEW] [ID: ${requestId}] GitHub API Error:`, data);
      return NextResponse.json(
        { error: `GitHub API error: ${data.message || response.statusText}` },
        { status: response.status }
      );
    }

    console.log(`[POST-REVIEW] [ID: ${requestId}] Success: ${data.html_url}`);

    return NextResponse.json({
      success: true,
      commentUrl: data.html_url,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while posting the comment.";
    console.error(`[POST-REVIEW ERROR] [ID: ${requestId}]:`, error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
