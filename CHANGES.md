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
│   ├── api/analyze-pr/  # AI Review Pipeline (with Server Caching)
│   ├── globals.css      # Custom Tailwind v4 config
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main Landing Page (State orchestration)
├── components/
│   ├── sections/        # Hero, PR Input, and Results sections
│   └── ui/              # Reusable atomic UI components
├── lib/
│   ├── gemini.ts        # AI Engine (Retries, Quota, ID Fallbacks)
│   ├── cache.ts         # Gemini Context Caching Manager
│   ├── chunking.ts      # Intelligent Diff Prioritization & Batching
│   ├── github.ts        # GitHub API Integration
│   └── utils.ts         # Utility functions
├── scripts/
│   └── list-models.ts   # Debug utility to identify available Gemini IDs
└── CHANGES.md           # This file
```

## ✨ Key Features Implemented

### 1. AI Review Engine (Core Feature)
- **Gemini 3.5 Flash Integration:** Upgraded to the latest 3.5 Flash model for superior analysis speed and reasoning.
- **Exhaustive Model Resolution:** Implemented a multi-model fallback cycle (`3.5-flash` -> `2.0-flash` -> `flash-latest`) to ensure maximum availability across different API key tiers.
- **Server-Side Result Caching:** Implemented a global in-memory cache for analysis results to avoid redundant API calls for the same PR.
- **Structured JSON Outputs:** Uses strict response schemas to ensure AI feedback is always parseable and consistent.
- **Intelligent Diff Chunking:** Handles large PRs by prioritizing critical directories (e.g., `auth/`, `api/`, `src/`) and ignoring noise (lockfiles, binaries).
- **Aggressive Token Optimization:** Shrinked prompts and truncated oversized patches (cap at 12k chars) to stay within strict quota limits.
- **Verifiable Context Caching:** Implements `GoogleAICacheManager` to cache PR context, reducing latency and token costs.

### 2. Interactive Analysis Flow
- **Real-time GitHub Integration:** Backend engine fetches real PR data (files, diffs, metadata) via the GitHub REST API.
- **PR Input:** A high-fidelity search bar with URL validation for GitHub Pull Requests.
- **Loading Progress:** A multi-step animated progress bar showing the real stages of fetching and AI reasoning.
- **Stability Safeguards:** Client-side mutex (analysisLock) and debouncing to prevent duplicate or race-condition submissions.

### 3. Review Results UI
- **Live File Inspection:** A "Files" tab displays real-time data from the PR, including additions, deletions, and file statuses.
- **Git Patch Viewer:** Integrated a collapsible patch viewer to see raw diffs directly in the tool.
- **Categorization:** Issues are grouped into Bugs, Security, Performance, Code Smells, and Suggestions.
- **Severity Badges:** Color-coded badges (Critical, High, Medium, Low) for quick triage.

### 4. Technical Quality
- **API Architecture:** Next.js 15 Route Handlers with secure GitHub and Gemini authentication.
- **Resilient AI Pipeline:** Exponential backoff with increased delays (5s+) for 429 quota errors.
- **Type Safety:** Comprehensive TypeScript interfaces for AI responses and internal data structures.
- **Debug Tooling:** Included `scripts/list-models.ts` to help developers troubleshoot API key permissions.

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
