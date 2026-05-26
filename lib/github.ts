/**
 * Interface representing structured GitHub PR data
 */
export interface GitHubPRDetails {
  owner: string;
  repo: string;
  pullNumber: number;
}

/**
 * Interface for a file changed in a Pull Request
 */
export interface PRFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
}

/**
 * Parses a GitHub Pull Request URL into its components
 * @param url The GitHub PR URL (e.g., https://github.com/vercel/next.js/pull/12345)
 * @returns Structured data or null if invalid
 */
export function parseGitHubPRUrl(url: string): GitHubPRDetails | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') return null;

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    // Pattern: /owner/repo/pull/number
    if (pathParts.length < 4 || pathParts[2] !== 'pull') return null;

    const owner = pathParts[0];
    const repo = pathParts[1];
    const pullNumber = parseInt(pathParts[3], 10);

    if (isNaN(pullNumber)) return null;

    return { owner, repo, pullNumber };
  } catch (e) {
    return null;
  }
}
