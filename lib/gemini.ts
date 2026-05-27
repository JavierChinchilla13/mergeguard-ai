import { 
  GoogleGenerativeAI, 
  SchemaType, 
  ResponseSchema 
} from "@google/generative-ai";

/**
 * Interface for AI Review Findings
 */
export interface ReviewFinding {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: "high" | "medium" | "low";
  description: string;
  impact: string; // Explains WHY this matters
  file: string;
  line: number;
  recommendation: string;
  codeSnippet: string;
  technicalReasoning: string; // The "senior engineer" deep dive
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
  positiveFeedback: string[]; // Acknowledging good patterns
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
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
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
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
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
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
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
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
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
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
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
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING },
          technicalReasoning: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "confidence", "description", "impact", "file", "line", "recommendation", "codeSnippet", "technicalReasoning"]
      }
    },
    positiveFeedback: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Acknowledge good engineering practices or well-designed components found in the PR."
    }
  },
  required: ["summary", "overallRating", "bugs", "security", "performance", "codeSmells", "architectureConcerns", "suggestions", "positiveFeedback"]
};

const SYSTEM_PROMPT = `You are MergeGuard AI, a Lead Software Engineer and Security Architect. Conduct a deep-dive production code review.

Technical Priorities:
- SECURITY: OWASP Top 10, XSS, SQLi, CSRF, insecure auth, secrets exposure, unsafe database mutations.
- LOGIC & CONCURRENCY: Race conditions, deadlocks, async/await gaps, edge cases, state corruption.
- PERFORMANCE: N+1 queries, memory leaks, unmemoized React components, expensive O(n) ops, blocking IO.
- ARCHITECTURE: SOLID/DRY violations, server/client boundary mistakes (Next.js), leakage of internals, tight coupling.

Rules:
1. No generic feedback. Explain WHY (root cause), IMPACT (production risk), and FIX (actionable code).
2. Evidence-based: Always cite specific file/line and provide the offending codeSnippet.
3. Framework-Aware: Tailor analysis to Next.js, React, Node.js, or detected stack best practices.
4. Professional Tone: Be critical but objective. Use 'technicalReasoning' for deep dives.
5. Acknowledge Quality: Use 'positiveFeedback' for excellent patterns.
6. Confidence Scoring: Assign 'confidence' (high/medium/low) and 'severity' (critical/high/medium/low).

Focus on what could break in a high-scale production environment.`;

/**
 * Helper to get the model name from environment or fallback
 */
export function getModelName(): string {
  let modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
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

  let lastError: any;
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

      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message?.toLowerCase() || "";
        const isRateLimit = errorMsg.includes("429") || error.status === 429 || errorMsg.includes("quota");
        const isNotFound = errorMsg.includes("404") || error.status === 404 || errorMsg.includes("not found");

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
        
        console.error(`[GEMINI] Error with ${modelId}:`, error.message);
        break; 
      }
    }
  }
  
  throw lastError || new Error("AI review failed. No compatible Gemini models found for this API key.");
}
