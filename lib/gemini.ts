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
  description: string;
  file: string;
  line: number;
  recommendation: string;
  codeSnippet: string;
}

export interface ReviewResponse {
  summary: string;
  bugs: ReviewFinding[];
  security: ReviewFinding[];
  performance: ReviewFinding[];
  codeSmells: ReviewFinding[];
  suggestions: ReviewFinding[];
}

// Structured Output Schema
const reviewSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "A brief high-level summary of the overall PR quality and major findings."
    },
    bugs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "description", "file", "line", "recommendation", "codeSnippet"]
      }
    },
    security: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "description", "file", "line", "recommendation", "codeSnippet"]
      }
    },
    performance: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "description", "file", "line", "recommendation", "codeSnippet"]
      }
    },
    codeSmells: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "description", "file", "line", "recommendation", "codeSnippet"]
      }
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          file: { type: SchemaType.STRING },
          line: { type: SchemaType.NUMBER },
          recommendation: { type: SchemaType.STRING },
          codeSnippet: { type: SchemaType.STRING }
        },
        required: ["title", "severity", "description", "file", "line", "recommendation", "codeSnippet"]
      }
    }
  },
  required: ["summary", "bugs", "security", "performance", "codeSmells", "suggestions"]
};

const SYSTEM_PROMPT = `You are MergeGuard AI, a senior security researcher and engineer. Review the following GitHub PR diff.
Report meaningful findings for:
1. BUGS: Logic errors, race conditions, async safety.
2. SECURITY: OWASP Top 10, secrets exposure, unsafe validation.
3. PERFORMANCE: Inefficiency, memory leaks, slow queries.
4. CODE QUALITY: Solid/DRY violations, dead code, poor architecture.

Rules:
- High-signal feedback only.
- Cite specific file/line.
- Provide actionable fix recommendation and code snippet.
- Be concise.`;

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
): Promise<ReviewResponse> {
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
  
  for (let modelId of modelIdsToTry) {
    modelId = modelId.replace("models/", "");
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[GEMINI] Attempting analysis with ID: ${modelId} (Attempt ${attempt + 1})`);
        
        let model;
        if (cacheName) {
          // Note: createCachedContent also requires the modelId to be one that supports it
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
        
        return parsedResponse;

      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message?.toLowerCase() || "";
        const isRateLimit = errorMsg.includes("429") || error.status === 429 || errorMsg.includes("quota");
        const isNotFound = errorMsg.includes("404") || error.status === 404 || errorMsg.includes("not found");

        if (isNotFound) {
          console.warn(`[GEMINI] Model ID ${modelId} not found. Trying next fallback...`);
          break; // Move to next modelId
        }
        
        if (isRateLimit && attempt < retries) {
          const delay = 5000 + (attempt * 5000);
          console.warn(`[GEMINI] Rate limit on ${modelId}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error(`[GEMINI] Error with ${modelId}:`, error.message);
        break; // Try next model ID
      }
    }
  }
  
  throw lastError || new Error("AI review failed. No compatible Gemini models found for this API key.");
}
