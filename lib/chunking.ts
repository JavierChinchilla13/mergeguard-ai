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
  tokenCount?: number;
  chunkIndex?: number;
  category?: 'Security' | 'API' | 'Infrastructure' | 'Core Logic' | 'UI/UX' | 'Utility' | 'Config' | 'Generated' | 'Asset';
}

const IGNORED_PATTERNS = [
  { pattern: 'package-lock.json', reason: 'Generated lockfile', category: 'Generated' as const },
  { pattern: 'yarn.lock', reason: 'Generated lockfile', category: 'Generated' as const },
  { pattern: 'pnpm-lock.yaml', reason: 'Generated lockfile', category: 'Generated' as const },
  { pattern: 'node_modules/', reason: 'Dependency directory', category: 'Config' as const },
  { pattern: 'dist/', reason: 'Build artifact', category: 'Generated' as const },
  { pattern: 'build/', reason: 'Build artifact', category: 'Generated' as const },
  { pattern: '.next/', reason: 'Next.js internals', category: 'Generated' as const },
  { pattern: 'public/', reason: 'Static assets', category: 'Asset' as const },
  { pattern: '.ico', reason: 'Binary/Icon', category: 'Asset' as const },
  { pattern: '.png', reason: 'Image asset', category: 'Asset' as const },
  { pattern: '.jpg', reason: 'Image asset', category: 'Asset' as const },
  { pattern: '.jpeg', reason: 'Image asset', category: 'Asset' as const },
  { pattern: '.gif', reason: 'Image asset', category: 'Asset' as const },
  { pattern: '.svg', reason: 'Vector asset', category: 'Asset' as const },
  { pattern: '.pdf', reason: 'Document', category: 'Asset' as const },
  { pattern: '.bin', reason: 'Binary file', category: 'Asset' as const },
  { pattern: '.min.js', reason: 'Minified code', category: 'Generated' as const },
  { pattern: '.min.css', reason: 'Minified style', category: 'Generated' as const },
  { pattern: '.map', reason: 'Source map', category: 'Generated' as const },
];

const PRIORITY_PATTERNS = [
  { pattern: 'src/auth/', reason: 'High-risk security logic', category: 'Security' as const },
  { pattern: 'app/api/', reason: 'API endpoint logic', category: 'API' as const },
  { pattern: 'src/api/', reason: 'API endpoint logic', category: 'API' as const },
  { pattern: 'src/services/', reason: 'Core business services', category: 'Core Logic' as const },
  { pattern: 'server/', reason: 'Backend infrastructure', category: 'Infrastructure' as const },
  { pattern: 'models/', reason: 'Database schema/models', category: 'Infrastructure' as const },
  { pattern: 'controllers/', reason: 'Request handling logic', category: 'API' as const },
  { pattern: 'middleware/', reason: 'Request pipeline logic', category: 'Infrastructure' as const },
  { pattern: 'utils/security', reason: 'Critical security utility', category: 'Security' as const },
  { pattern: 'hooks/', reason: 'React state/lifecycle logic', category: 'UI/UX' as const },
  { pattern: 'components/', reason: 'UI components', category: 'UI/UX' as const },
  { pattern: 'src/', reason: 'Primary source code', category: 'Core Logic' as const },
  { pattern: 'app/', reason: 'Application routes/logic', category: 'Core Logic' as const },
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
      insights.push({ 
        filename: file.filename, 
        decision: 'skipped', 
        reason: skipMatch.reason,
        category: skipMatch.category,
        tokenCount: file.patch ? estimateTokens(file.patch) : 0
      });
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
      reason: priorityMatch ? priorityMatch.reason : 'Standard source analysis',
      category: priorityMatch?.category || 'Utility',
      tokenCount: file.patch ? estimateTokens(file.patch) : 0
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
  insights: FileInsight[],
  maxTokensPerChunk: number = 30000, 
  maxCharsPerFile: number = 12000
): ChunkedDiff[] {
  const chunks: ChunkedDiff[] = [];
  let currentChunkFiles: string[] = [];
  let currentChunkContent = "";
  let currentTokenCount = 0;

  files.forEach((file, index) => {
    if (!file.patch) return;

    let patch = file.patch;
    if (patch.length > maxCharsPerFile) {
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
    
    // Assign chunk index to insight
    const insight = insights.find(i => i.filename === file.filename);
    if (insight) {
      insight.chunkIndex = chunks.length; // 0-based
    }
  });

  if (currentChunkFiles.length > 0) {
    chunks.push({
      files: currentChunkFiles,
      content: currentChunkContent,
      tokenCount: currentTokenCount,
    });
  }

  return chunks;
}
