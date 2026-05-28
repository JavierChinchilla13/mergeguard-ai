# MergeGuard Implementation Details

This document outlines the architectural choices, tech stack, and features implemented for the MergeGuard landing page.

## 🚀 Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **AI:** Gemini 3.5 Flash (Google AI SDK)
- **Styling:** Tailwind CSS v4 (Alpha)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Utilities:** clsx, tailwind-merge, class-variance-authority

## 📂 Project Structure

```text
merge-guard/
├── app/
│   ├── api/
│   │   ├── analyze-pr/  # AI Review Pipeline (Observability, Caching, Chunking)
│   │   └── post-review/ # GitHub Comment Posting Service
│   ├── globals.css      # Custom Tailwind v4 config
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main Landing Page (Streaming orchestration)
├── components/
│   ├── sections/        # Hero, PR Input, Streaming, and Results
│   └── ui/              # Reusable atomic UI components
├── lib/
│   ├── gemini.ts        # AI Engine (Retries, Quota, ID Fallbacks)
│   ├── pipeline.ts      # Multi-stage Review Pipeline (Observability Metrics)
│   ├── cache.ts         # Gemini Context Caching (Google SDK)
│   ├── cache-service.ts # PR Result Caching (SHA-256 persistence)
│   ├── chunking.ts      # Intelligent Diff Prioritization & Insight logic
│   ├── github.ts        # GitHub API Integration
│   ├── github-format.ts # Professional Markdown Comment Formatting
│   └── utils.ts         # Utility functions
├── scripts/
│   └── list-models.ts   # Debug utility to identify available Gemini IDs
└── CHANGES.md           # This file
```

## ✨ Key Features Implemented

### 0. Production-Grade UI/UX & Observability (May 2026 Update)
- **Technical Dashboard:** Transformed the UI into a high-density engineering tool inspired by GitHub and Vercel.
- **Enhanced Observability:** Added a compact metadata bar and dedicated "Observability" tab with latency instrumentation and decision logs.
- **Technical Terminal:** Implemented a live, auto-scrolling system log with granular technical feedback (Cache states, Chunks, Prioritization).
- **Technical Documentation:** Created a comprehensive "How It Works" page explaining chunking, hashing, and AI reasoning strategies.
- **Improved AI Core:** Added "Architecture" and "Suggestions" categories to the analysis core for more comprehensive reviews.
- **UI Simplification:** Streamlined the Navbar and Footer by removing redundant links and branding for a more focused user experience.
- **Markdown Preview Flow:** Interactive review preview and clipboard support before GitHub posting.
- **Hardened Pipeline:** Robust error handling for empty PRs, rate limits, and detailed cache invalidation reasoning.

### 1. Engineering Observability (Production Ready)
- **Analysis Metrics Dashboard:** A comprehensive statistics panel displaying total tokens, pipeline duration, and per-service latency (GitHub API vs. Gemini Reasoning).
- **Developer Insights Log:** A detailed decision log that exposes why specific files were prioritized (e.g., "High-risk security logic") or skipped (e.g., "Generated lockfile").
- **Latency Instrumentation:** Real-time performance monitoring showing exact millisecond counts for backend operations with visual progress bars.
- **Reliability Tracking:** Visible reporting of retry attempts, cache hit ratios, and model fallback status.

### 2. High-Fidelity Streaming Experience
- **Live Terminal Logs:** A developer-first "Terminal" UI that streams real-time analysis logs with timestamps and severity labels.
- **Execution Flow Tracking:** Animated stage indicators that highlight the current step of the AI reasoning process.
- **Real-time Metrics:** Displays elapsed analysis time and percentage completion with high-precision timers.

### 3. Senior AI Review Engine
- **Lead Engineer Reasoning:** Gemini is prompted to provide senior-level feedback focusing on production impacts, technical root causes, and actionable fix recommendations.
- **Deep Technical Insights:** Every finding includes a "Production Impact" and "Technical Reasoning" deep-dive with confidence scoring.
- **Overall Rating:** PRs are graded (Excellent, Good, Needs Work, Critical) to provide an immediate quality signal.
- **Positive Feedback:** Automatically identifies and acknowledges high-quality code patterns.

### 4. High-Performance Caching & Scalability
- **SHA-256 Content Hashing:** Server-side result caching that survives PR updates unless the code actually changes.
- **Intelligent Chunking:** Safely processes large diffs by prioritizing core logic and splitting files into token-safe segments.
- **Verifiable Context Caching:** Leverages `GoogleAICacheManager` to reduce AI reasoning latency and token costs.

### 5. GitHub Workflow Integration
- **Direct PR Commenting:** Post AI reviews directly to GitHub with professionally formatted Markdown reports.
- **Live File Inspection:** Tabbable interface to switch between AI Review, Changed Files (with patches), and Observability Stats.

## 🛠️ Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env.local` file with your credentials:
    ```bash
    GITHUB_TOKEN=your_github_token
    GEMINI_API_KEY=your_gemini_api_key
    GEMINI_MODEL=gemini-3.5-flash
    ```

3.  **Run development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```
