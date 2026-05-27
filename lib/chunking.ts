/**
 * Utility for intelligent PR diff chunking and prioritization
 */

export interface ChunkedDiff {
  files: string[];
  content: string;
  tokenCount: number;
}

const IGNORED_PATTERNS = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'node_modules/',
  'dist/',
  'build/',
  '.next/',
  'public/',
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.pdf',
  '.bin',
  '.min.js',
  '.min.css',
  '.map',
];

const PRIORITY_PATTERNS = [
  'src/auth/',
  'app/api/',
  'src/api/',
  'src/services/',
  'server/',
  'models/',
  'controllers/',
  'middleware/',
  'utils/security',
  'hooks/',
  'src/',
  'app/',
];

/**
 * Estimates token count based on character count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Filters and prioritizes files from a PR
 */
export function filterAndPrioritizeFiles(files: any[]): any[] {
  // 1. Filter out ignored files
  const filtered = files.filter(file => {
    const isIgnored = IGNORED_PATTERNS.some(pattern => {
      if (pattern.startsWith('.')) return file.filename.endsWith(pattern);
      return file.filename.includes(pattern);
    });
    if (isIgnored) console.log(`[CHUNKING] Skipped noise file: ${file.filename}`);
    return !isIgnored;
  });

  // 2. Sort by priority
  return filtered.sort((a, b) => {
    const aPriority = PRIORITY_PATTERNS.findIndex(p => a.filename.includes(p));
    const bPriority = PRIORITY_PATTERNS.findIndex(p => b.filename.includes(p));

    if (aPriority === -1 && bPriority === -1) return 0;
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    return aPriority - bPriority;
  });
}

/**
 * Chunks PR files and truncates large patches to save tokens
 */
export function chunkFiles(
  files: any[], 
  maxTokensPerChunk: number = 30000, // Reduced for free tier reliability
  maxCharsPerFile: number = 12000   // ~3000 tokens max per file
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
