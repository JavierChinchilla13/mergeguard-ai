/**
 * Utility for intelligent PR diff chunking and prioritization with observability insights.
 */

export interface ChunkedDiff {
  files: string[];
  content: string;
  tokenCount: number;
}

export interface FileInsight {
  filename: string;
  decision: 'prioritized' | 'analyzed' | 'skipped';
  reason: string;
}

const IGNORED_PATTERNS = [
  { pattern: 'package-lock.json', reason: 'Generated lockfile' },
  { pattern: 'yarn.lock', reason: 'Generated lockfile' },
  { pattern: 'pnpm-lock.yaml', reason: 'Generated lockfile' },
  { pattern: 'node_modules/', reason: 'Dependency directory' },
  { pattern: 'dist/', reason: 'Build artifact' },
  { pattern: 'build/', reason: 'Build artifact' },
  { pattern: '.next/', reason: 'Next.js internals' },
  { pattern: 'public/', reason: 'Static assets' },
  { pattern: '.ico', reason: 'Binary/Icon' },
  { pattern: '.png', reason: 'Image asset' },
  { pattern: '.jpg', reason: 'Image asset' },
  { pattern: '.jpeg', reason: 'Image asset' },
  { pattern: '.gif', reason: 'Image asset' },
  { pattern: '.svg', reason: 'Vector asset' },
  { pattern: '.pdf', reason: 'Document' },
  { pattern: '.bin', reason: 'Binary file' },
  { pattern: '.min.js', reason: 'Minified code' },
  { pattern: '.min.css', reason: 'Minified style' },
  { pattern: '.map', reason: 'Source map' },
];

const PRIORITY_PATTERNS = [
  { pattern: 'src/auth/', reason: 'High-risk security logic' },
  { pattern: 'app/api/', reason: 'API endpoint logic' },
  { pattern: 'src/api/', reason: 'API endpoint logic' },
  { pattern: 'src/services/', reason: 'Core business services' },
  { pattern: 'server/', reason: 'Backend infrastructure' },
  { pattern: 'models/', reason: 'Database schema/models' },
  { pattern: 'controllers/', reason: 'Request handling logic' },
  { pattern: 'middleware/', reason: 'Request pipeline logic' },
  { pattern: 'utils/security', reason: 'Critical security utility' },
  { pattern: 'hooks/', reason: 'React state/lifecycle logic' },
  { pattern: 'src/', reason: 'Primary source code' },
  { pattern: 'app/', reason: 'Application routes/logic' },
];

/**
 * Filters and prioritizes files from a PR, generating technical insights for observability.
 */
export function filterAndPrioritizeFiles(files: any[]): { filtered: any[], insights: FileInsight[] } {
  const insights: FileInsight[] = [];
  
  // 1. Filter out ignored files
  const filtered = files.filter(file => {
    const skipMatch = IGNORED_PATTERNS.find(p => {
      if (p.pattern.startsWith('.')) return file.filename.endsWith(p.pattern);
      return file.filename.includes(p.pattern);
    });

    if (skipMatch) {
      insights.push({ filename: file.filename, decision: 'skipped', reason: skipMatch.reason });
      return false;
    }
    return true;
  });

  // 2. Prioritize remaining files
  const prioritized = filtered.sort((a, b) => {
    const aPriority = PRIORITY_PATTERNS.findIndex(p => a.filename.includes(p.pattern));
    const bPriority = PRIORITY_PATTERNS.findIndex(p => b.filename.includes(p.pattern));

    if (aPriority === -1 && bPriority === -1) return 0;
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    return aPriority - bPriority;
  });

  // 3. Generate insights for analyzed files
  prioritized.forEach(file => {
    const priorityMatch = PRIORITY_PATTERNS.find(p => file.filename.includes(p.pattern));
    insights.push({
      filename: file.filename,
      decision: priorityMatch ? 'prioritized' : 'analyzed',
      reason: priorityMatch ? priorityMatch.reason : 'Standard source analysis'
    });
  });

  return { filtered: prioritized, insights };
}

/**
 * Estimates token count based on character count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Chunks PR files and truncates large patches to save tokens
 */
export function chunkFiles(
  files: any[], 
  maxTokensPerChunk: number = 30000, 
  maxCharsPerFile: number = 12000
): ChunkedDiff[] {
  const chunks: ChunkedDiff[] = [];
  let currentChunkFiles: string[] = [];
  let currentChunkContent = "";
  let currentTokenCount = 0;

  for (const file of files) {
    if (!file.patch) continue;

    let patch = file.patch;
    if (patch.length > maxCharsPerFile) {
      console.log(`[CHUNKING] Truncating large patch: ${file.filename} (${patch.length} chars)`);
      patch = patch.substring(0, maxCharsPerFile) + "\n\n[... PATCH TRUNCATED FOR TOKEN LIMITS ...]";
    }

    const fileHeader = `\n--- FILE: ${file.filename} ---\n`;
    const fileContent = fileHeader + patch;
    const fileTokens = estimateTokens(fileContent);

    if (currentTokenCount + fileTokens > maxTokensPerChunk && currentChunkFiles.length > 0) {
      chunks.push({
        files: currentChunkFiles,
        content: currentChunkContent,
        tokenCount: currentTokenCount,
      });
      currentChunkFiles = [];
      currentChunkContent = "";
      currentTokenCount = 0;
    }

    currentChunkFiles.push(file.filename);
    currentChunkContent += fileContent;
    currentTokenCount += fileTokens;
  }

  if (currentChunkFiles.length > 0) {
    chunks.push({
      files: currentChunkFiles,
      content: currentChunkContent,
      tokenCount: currentTokenCount,
    });
  }

  return chunks;
}
