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
│   └── page.tsx         # Main Landing Page (State orchestration)
├── components/
│   ├── sections/        # Hero, PR Input, and Results sections
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

### 1. Production AI Review Engine
- **Gemini 3.5 Flash Integration:** Powered by the latest Flash model for superior analysis speed.
- **Incremental Chunking:** Supports large PRs by splitting diffs into safe token-sized chunks and merging results incrementally.
- **Intelligent Prioritization:** Automatically focuses on critical code (e.g., `auth/`, `api/`, `src/`) while skipping noise (lockfiles, binaries, generated assets).
- **Structured JSON Outputs:** Uses strict response schemas to ensure feedback is always actionable and parseable.

### 2. High-Performance Caching
- **Server-Side Result Caching:** Persists analysis results based on PR URL and content hash (SHA-256). Detects if a PR has changed to invalidate cache automatically.
- **Verifiable Context Caching:** Leverages `GoogleAICacheManager` to reuse analysis context in the Gemini engine, reducing token overhead.
- **Visible Cache Indicators:** The UI explicitly displays "Cache Hit" badges and timestamps to demonstrate performance optimizations.

### 3. Advanced Analysis Metadata
- **Stats Dashboard:** A new "Stats" panel in the UI shows:
    - **Total Tokens:** Estimated resource usage.
    - **Analysis Duration:** Precise timing of the AI engine.
    - **Chunk Count:** Breakdown of how the PR was segmented.
    - **Skip Logic:** Transparent reporting on which files were excluded from analysis.
    - **Model Details:** Which specific Gemini variant was utilized.

### 4. GitHub Workflow Integration
- **Direct PR Commenting:** Post AI reviews directly to GitHub with professionally formatted Markdown.
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
