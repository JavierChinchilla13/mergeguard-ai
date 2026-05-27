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
│   │   ├── analyze-pr/  # AI Review Pipeline (with Server Caching)
│   │   └── post-review/ # GitHub Comment Posting Service
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
│   ├── github-format.ts # Professional Markdown Comment Formatting
│   └── utils.ts         # Utility functions
├── scripts/
│   └── list-models.ts   # Debug utility to identify available Gemini IDs
└── CHANGES.md           # This file
```

## ✨ Key Features Implemented

### 1. AI Review Engine (Core Feature)
- **Gemini 3.5 Flash Integration:** Upgraded to the latest 3.5 Flash model for superior analysis speed and reasoning.
- **Exhaustive Model Resolution:** Implemented a multi-model fallback cycle (`3.5-flash` -> `2.0-flash` -> `flash-latest`) to ensure maximum availability.
- **Server-Side Result Caching:** Global in-memory cache for analysis results to avoid redundant API calls.
- **Structured JSON Outputs:** Strict response schemas for parseable and consistent AI feedback.
- **Aggressive Token Optimization:** Truncated patches and optimized prompts to stay within free-tier limits.
- **Verifiable Context Caching:** Implements `GoogleAICacheManager` to reduce latency and token costs.

### 2. GitHub Workflow Integration
- **Direct PR Commenting:** Users can post the AI review directly to the GitHub Pull Request with a single click.
- **Professional Formatting:** Automatically generates high-fidelity Markdown comments with emojis, code blocks, and categorized sections.
- **Interactive Feedback:** Real-time posting status (Loading -> Success -> Direct Link) integrated into the Results UI.
- **Real-time GitHub Integration:** Backend engine fetches real PR data (files, diffs, metadata) via the GitHub REST API.

### 3. Interactive Analysis Flow
- **PR Input:** A high-fidelity search bar with URL validation for GitHub Pull Requests.
- **Loading Progress:** A multi-step animated progress bar showing the real stages of fetching and AI reasoning.
- **Stability Safeguards:** Client-side mutex (analysisLock) to prevent duplicate or race-condition submissions.

### 4. Review Results UI
- **Live File Inspection:** A "Files" tab displays real-time data from the PR, including additions, deletions, and file statuses.
- **Git Patch Viewer:** Integrated a collapsible patch viewer to see raw diffs directly in the tool.
- **Categorization:** Issues are grouped into Bugs, Security, Performance, Code Smells, and Suggestions.
- **Severity Badges:** Color-coded badges (Critical, High, Medium, Low) for quick triage.

### 5. Technical Quality
- **API Architecture:** Next.js 15 Route Handlers with secure GitHub and Gemini authentication.
- **Resilient AI Pipeline:** Exponential backoff and multi-model fallbacks for maximum uptime.
- **Type Safety:** Comprehensive TypeScript interfaces for the entire pipeline.

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
