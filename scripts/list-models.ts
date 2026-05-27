import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_key_here") {
    console.error("❌ GEMINI_API_KEY is not set in .env.local");
    return;
  }

  console.log("🔍 Fetching available models for your API key...");
  
  try {
    // We have to use fetch because the current SDK doesn't expose listModels easily 
    // without the admin/server packages which have different requirements.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:", data.error?.message || response.statusText);
      return;
    }

    console.log("\n✅ Available Models:");
    console.table(data.models.map((m: any) => ({
      name: m.name,
      displayName: m.displayName,
      supportedMethods: m.supportedGenerationMethods.join(", ")
    })));

    console.log("\n💡 Use the 'name' (without models/ prefix) in your GEMINI_MODEL env var.");
  } catch (error) {
    console.error("❌ Unexpected Error:", error);
  }
}

listModels();
