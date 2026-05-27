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
│   │   ├── analyze-pr/  # AI Review Pipeline (Caching, Chunking, Priority)
│   │   └── post-review/ # GitHub Comment Posting Service
│   ├── globals.css      # Custom Tailwind v4 config
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main Landing Page (Streaming orchestration)
├── components/
│   ├── sections/        # Hero, PR Input, Streaming, and Results
│   └── ui/              # Reusable atomic UI components
├── lib/
│   ├── gemini.ts        # AI Engine (Retries, Quota, ID Fallbacks)
│   ├── pipeline.ts      # Multi-stage Review Pipeline (Chunking, Merging)
│   ├── cache.ts         # Gemini Context Caching (Google SDK)
│   ├── cache-service.ts # PR Result Caching (Server-side persistence)
│   ├── chunking.ts      # Intelligent Diff Prioritization & Batching
│   ├── github.ts        # GitHub API Integration
│   ├── github-format.ts # Professional Markdown Comment Formatting
│   └── utils.ts         # Utility functions
├── scripts/
│   └── list-models.ts   # Debug utility to identify available Gemini IDs
└── CHANGES.md           # This file
```

## ✨ Key Features Implemented

### 1. High-Fidelity Streaming Experience
- **Live Terminal Logs:** A developer-first "Terminal" UI that streams real-time analysis logs (e.g., `[INFO] Parsing changed files`, `[SECURITY] Scanning vulnerabilities`).
- **Execution Flow Tracking:** Animated stage indicators that highlight the current step of the AI reasoning process.
- **Progressive Reveal:** UI sections appear incrementally as the AI completes different facets of the review (Security, Bugs, Performance).
- **Real-time Metrics:** Displays elapsed analysis time and percentage completion with high-precision timers.

### 2. Production AI Review Engine
- **Gemini 3.5 Flash Integration:** Powered by the latest Flash model for superior analysis speed.
- **Incremental Chunking:** Supports large PRs by splitting diffs into safe token-sized chunks.
- **Intelligent Prioritization:** Automatically focuses on critical code while skipping noise (lockfiles, binaries).
- **Structured JSON Outputs:** Uses strict response schemas for parseable feedback.

### 3. High-Performance Caching
- **SHA-256 Content Caching:** Persists analysis results based on PR content hashes to avoid redundant API calls.
- **Verifiable Context Caching:** Leverages `GoogleAICacheManager` to reuse analysis context in the Gemini engine.
- **Cache Hit UI:** Visibly badges results that were served from the high-speed server cache.

### 4. GitHub Workflow Integration
- **Direct PR Commenting:** Post AI reviews directly to GitHub with professionally formatted Markdown reports.
- **Live File Inspection:** Tabbable interface to switch between AI Review, Changed Files (with patches), and Analysis Stats.

### 5. Technical Quality & Resilience
- **Multi-Model Fallback:** Automatically cycles through verified model IDs if the primary one is unavailable.
- **Rate-Limit Resilience:** Exponential backoff and retry logic for 429 errors.
- **State Mutex:** Client-side locking to prevent concurrent redundant submissions.

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
