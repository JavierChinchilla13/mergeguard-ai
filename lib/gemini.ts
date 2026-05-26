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

const SYSTEM_PROMPT = `You are MergeGuard AI, a senior software engineer and security researcher. 
Your task is to conduct a professional, deep-dive review of a GitHub Pull Request diff.

Focus on:
1. BUGS: Logical errors, race conditions, null pointers, off-by-one errors.
2. SECURITY: XSS, SQL injection, CSRF, insecure authentication, secrets exposure (API keys, etc.), unsafe async handling.
3. PERFORMANCE: Inefficient algorithms, unnecessary re-renders (React), large memory allocations, slow queries.
4. CODE SMELLS: Dead code, deep nesting, poor naming, violations of DRY/SOLID principles.
5. MAINTAINABILITY: Readability, documentation, complexity.

Guidelines:
- Provide high-signal, actionable feedback.
- If no meaningful issues are found in a category, return an empty array.
- Cite specific filenames and line numbers.
- For each finding, provide a clear 'recommendation' on how to fix it.
- Include the 'codeSnippet' showing the problematic area.
- Be objective and professional. Avoid generic praise.`;

/**
 * Initialize Gemini Client
 */
export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_key_here") {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: reviewSchema,
    },
    systemInstruction: SYSTEM_PROMPT,
  });
}

/**
 * AI Review Pipeline Service
 */
export async function runAIReview(diffContent: string, cacheName?: string): Promise<ReviewResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_key_here") {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let model;

    if (cacheName) {
      console.log(`[GEMINI] Using context cache: ${cacheName}`);
      model = genAI.getGenerativeModelFromCachedContent({ name: cacheName } as any);
    } else {
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: reviewSchema,
        },
        systemInstruction: SYSTEM_PROMPT,
      });
    }
    
    console.log(`[GEMINI] Starting AI review analysis...`);
    const prompt = cacheName 
      ? "Analyze the cached Pull Request diff and provide a structured review in JSON format."
      : `Analyze the following Pull Request diff and provide a structured review in JSON format:\n\n${diffContent}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const parsedResponse: ReviewResponse = JSON.parse(text);
    console.log(`[GEMINI] Review complete. Found ${parsedResponse.bugs.length + parsedResponse.security.length + parsedResponse.performance.length + parsedResponse.codeSmells.length} issues.`);
    
    return parsedResponse;
  } catch (error) {
    console.error(`[GEMINI] Error during AI review:`, error);
    throw error;
  }
}
