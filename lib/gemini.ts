import { 
  GoogleGenerativeAI, 
  SchemaType, 
  ResponseSchema 
} from "@google/generative-ai";
import { FileInsight } from "./chunking";

/**
 * Interface for AI Review Findings
 */
export interface ReviewFinding {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: "high" | "medium" | "low";
  category: string;
  description: string;
  impact: string; // Explains WHY this matters, exploitability, and consequences
  file: string;
  line: number;
  recommendation: string;
  codeSnippet: string;
  technicalReasoning: string; // The "senior engineer" deep dive
  cwe?: string; // Optional CWE identifier for security findings
}

export interface ReviewResponse {
  summary: string;
  overallRating: "excellent" | "good" | "needs_work" | "critical_issues";
  bugs: ReviewFinding[];
  security: ReviewFinding[];
  performance: ReviewFinding[];
  codeSmells: ReviewFinding[];
  architectureConcerns: ReviewFinding[];
  suggestions: ReviewFinding[];
  positiveFindings: string[]; // Concrete good engineering decisions (max 3)
}

export interface AnalysisMetadata {
  sessionId: string;
  fingerprint: string;
  model: string;
  totalTokens: number;
  chunkCount: number;
  filesAnalyzed: number;
  filesSkipped: number;
  duration: number;
  cacheStatus: 'hit' | 'miss' | 'invalidated';
  cachedAt?: number;
  latencies: {
    github: number;
    ai: number;
    chunking: number;
  };
  insights: FileInsight[];
  retryCount: number;
  cacheInvalidationReason?: string;
}

// Structured Output Schema
const reviewSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "A high-level technical summary of the PR quality and architectural impact."
    },
    overallRating: {
      type: SchemaType.STRING,
      description: "PR quality rating: excellent, good, needs_work, or critical_issues"
    },
    bugs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "category", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
      }
    },
    security: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING },
          cwe: { type: SchemaType.STRING, description: "CWE identifier (e.g. CWE-79) if security finding" }
        },
        required: ["title", "severity", "confidence", "category", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
      }
    },
    performance: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "category", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
      }
    },
    codeSmells: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "category", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
      }
    },
    architectureConcerns: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "category", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
      }
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "category", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
      }
    },
    positiveFindings: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Concrete good engineering decisions (e.g. 'Safe usage of prepared statements'). Max 3."
    }
  },
  required: ["summary", "overallRating", "bugs", "security", "performance", "codeSmells", "architectureConcerns", "suggestions", "positiveFindings"]
};

const SYSTEM_PROMPT = `You are MergeGuard Core, a Senior Staff Software Engineer and Security Architect. Conduct a comprehensive, high-fidelity production code review.

Scope of Analysis:
- SECURITY: OWASP Top 10, XSS, SQLi, CSRF, insecure auth, secrets exposure, and unsafe database mutations.
- CORRECTNESS: Race conditions, deadlocks, async/await gaps, edge cases, and state corruption.
- ARCHITECTURE: SOLID/DRY violations, server/client boundary mistakes (Next.js), leakage of internals, and scalability bottlenecks.
- PERFORMANCE: N+1 queries, memory leaks, unmemoized React components, and expensive O(n) operations.
- MAINTAINABILITY: Developer ergonomics, API design flaws, and complex logic that hinders long-term evolution.

Rules:
1. Balanced Intensity: Prioritize high-impact production risks, but do not ignore architectural or correctness issues. Surface medium-confidence concerns if they are technically justified and actionable.
2. No Stylistic Nitpicks: Avoid weak feedback on naming or minor stylistic preferences. Focus on what affects stability, security, or maintenance at scale.
3. Impact-Driven: For every finding, 'impact' must detail real-world consequences (production breaks, exploitability, or technical debt accumulation).
4. Evidence-Based: Always cite the specific file/line and provide the offending codeSnippet.
5. Technical Reasoning: Use 'technicalReasoning' for staff-level deep dives into WHY a pattern is problematic.
6. Framework-Aware: Tailor analysis to Next.js 15+, React, and modern TypeScript best practices.
7. Positive Findings: Identify up to 3 concrete GOOD engineering decisions. Never hallucinate.
8. CWE Mapping: Include specific CWE IDs for security findings where confidence is high.

Your review should feel like a Staff Engineer combined with a Security Auditor: critical, objective, and deeply technical. Output must be strictly valid JSON.`;

/**
 * Helper to get the model name from environment or fallback
 */
export function getModelName(): string {
  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  return modelName.replace("models/", "");
}

/**
 * Initialize Gemini Client
 */
export function getGeminiModel(modelId?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = modelId || getModelName();
  
  if (!apiKey || apiKey === "your_gemini_key_here") {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: reviewSchema,
    },
    systemInstruction: SYSTEM_PROMPT,
  });
}

/**
 * AI Review Pipeline Service with Retry Logic and ID Fallbacks
 */
export async function runAIReview(
  diffContent: string, 
  cacheName?: string, 
  retries: number = 1
): Promise<ReviewResponse & { retryCount: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_key_here") {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Exhaustive list of model IDs based on your specific API key's availability
  const modelIdsToTry = [
    getModelName(),
    "gemini-3.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-3.1-flash-lite"
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: unknown;
  let totalRetries = 0;
  
  for (let modelId of modelIdsToTry) {
    modelId = modelId.replace("models/", "");
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[GEMINI] Attempting analysis with ID: ${modelId} (Attempt ${attempt + 1})`);
        
        let model;
        if (cacheName) {
          console.log(`[GEMINI] Using context cache: ${cacheName}`);
          model = genAI.getGenerativeModelFromCachedContent({ name: cacheName } as any);
        } else {
          model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: reviewSchema,
            },
            systemInstruction: SYSTEM_PROMPT,
          });
        }
        
        const prompt = cacheName 
          ? "Analyze the cached Pull Request diff and provide a structured review in JSON format."
          : `Analyze the following Pull Request diff and provide a structured review in JSON format:\n\n${diffContent}`;
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        const parsedResponse: ReviewResponse = JSON.parse(text);
        console.log(`[GEMINI] SUCCESS with ${modelId}. Found ${parsedResponse.bugs.length + parsedResponse.security.length + parsedResponse.performance.length + parsedResponse.codeSmells.length} issues.`);
        
        return { ...parsedResponse, retryCount: totalRetries };

      } catch (error: unknown) {
        lastError = error;
        const errorMsg = error instanceof Error ? error.message.toLowerCase() : "";
        const status = (error as any).status;
        const isRateLimit = errorMsg.includes("429") || status === 429 || errorMsg.includes("quota");
        const isNotFound = errorMsg.includes("404") || status === 404 || errorMsg.includes("not found");

        if (isNotFound) {
          console.warn(`[GEMINI] Model ID ${modelId} not found. Trying next fallback...`);
          break; 
        }
        
        if (isRateLimit && attempt < retries) {
          totalRetries++;
          const delay = 5000 + (attempt * 5000);
          console.warn(`[GEMINI] Rate limit on ${modelId}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error(`[GEMINI] Error with ${modelId}:`, error instanceof Error ? error.message : "Unknown error");
        break; 
      }
    }
  }
  
  throw lastError instanceof Error ? lastError : new Error("AI review failed. No compatible Gemini models found for this API key.");
}
