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
  '*.min.js',
  '*.min.css',
  '*.map',
  '*.svg',
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.gif',
  '*.ico',
  '*.pdf',
  '*.bin',
];

const PRIORITY_PATTERNS = [
  'src/auth/',
  'src/api/',
  'src/services/',
  'app/api/',
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
 * Estimates token count based on character count (rough approximation)
 * Gemini models use ~4 chars per token on average for code
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
    return !IGNORED_PATTERNS.some(pattern => {
      if (pattern.startsWith('*.')) {
        return file.filename.endsWith(pattern.substring(1));
      }
      return file.filename.includes(pattern);
    });
  });

  // 2. Sort by priority
  return filtered.sort((a, b) => {
    const aPriority = PRIORITY_PATTERNS.findIndex(pattern => a.filename.includes(pattern));
    const bPriority = PRIORITY_PATTERNS.findIndex(pattern => b.filename.includes(pattern));

    // If both are not in priority list, keep original order
    if (aPriority === -1 && bPriority === -1) return 0;
    // If one is not in priority list, it goes to the end
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    
    // Both are in priority list, lower index = higher priority
    return aPriority - bPriority;
  });
}

/**
 * Chunks PR files into batches that fit within token limits
 */
export function chunkFiles(files: any[], maxTokensPerChunk: number = 50000): ChunkedDiff[] {
  const chunks: ChunkedDiff[] = [];
  let currentChunkFiles: string[] = [];
  let currentChunkContent = "";
  let currentTokenCount = 0;

  for (const file of files) {
    if (!file.patch) continue;

    const fileHeader = `\n--- FILE: ${file.filename} ---\n`;
    const fileContent = fileHeader + file.patch;
    const fileTokens = estimateTokens(fileContent);

    // If a single file is larger than the limit, we still include it but it might be truncated by the model
    // or we could split it further. For now, we keep it as one unit.
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

  console.log(`[CHUNKING] Split PR into ${chunks.length} chunks.`);
  chunks.forEach((chunk, i) => {
    console.log(`  Chunk ${i + 1}: ${chunk.files.length} files, ~${chunk.tokenCount} tokens`);
  });

  return chunks;
}
