# MergeGuard Implementation Details

This document outlines the architectural choices, tech stack, and features implemented for the MergeGuard landing page.

## 🚀 Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **AI:** Gemini 1.5 Flash (Google AI SDK)
- **Styling:** Tailwind CSS v4 (Alpha)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Utilities:** clsx, tailwind-merge, class-variance-authority

## 📂 Project Structure

```text
merge-guard/
├── app/
│   ├── api/analyze-pr/  # AI Review Pipeline Endpoint
│   ├── globals.css      # Custom Tailwind v4 config
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main Landing Page (State orchestration)
├── components/
│   ├── sections/        # Hero, PR Input, and Results sections
│   └── ui/              # Reusable atomic UI components
├── lib/
│   ├── gemini.ts        # AI Engine (Structured Outputs, Prompting)
│   ├── cache.ts         # Gemini Context Caching Manager
│   ├── chunking.ts      # Intelligent Diff Prioritization & Batching
│   ├── github.ts        # GitHub API Integration
│   └── utils.ts         # Utility functions
└── CHANGES.md           # This file
```

## ✨ Key Features Implemented

### 1. AI Review Engine (Core Feature)
- **Gemini 1.5 Flash Integration:** Powered by Google's latest Flash model for rapid, high-signal analysis.
- **Structured JSON Outputs:** Uses strict response schemas to ensure AI feedback is always parseable and consistent.
- **Intelligent Diff Chunking:** Handles large PRs by prioritizing critical directories (e.g., `auth/`, `api/`, `src/`) and ignoring noise (lockfiles, binaries).
- **Verifiable Context Caching:** Implements `GoogleAICacheManager` to cache PR context, reducing latency and token costs for repeated reviews.
- **Engineering-Grade Prompting:** AI is prompted as a senior security researcher and engineer to detect bugs, security flaws, and performance bottlenecks.

### 2. Interactive Analysis Flow
- **Real-time GitHub Integration:** Backend engine fetches real PR data (files, diffs, metadata) via the GitHub REST API.
- **PR Input:** A high-fidelity search bar with URL validation for GitHub Pull Requests.
- **Loading Progress:** A multi-step animated progress bar showing the real stages of fetching and AI reasoning.
- **Smooth Transitions:** Used `AnimatePresence` for seamless transitions between states.

### 3. Review Results UI
- **Live File Inspection:** A "Files" tab displays real-time data from the PR, including additions, deletions, and file statuses.
- **Git Patch Viewer:** Integrated a collapsible patch viewer to see raw diffs directly in the tool.
- **Categorization:** Issues are grouped into Bugs, Security, Performance, Code Smells, and Suggestions.
- **Severity Badges:** Color-coded badges (Critical, High, Medium, Low) for quick triage.

### 4. Technical Quality
- **API Architecture:** Next.js 15 Route Handlers with secure GitHub and Gemini authentication.
- **Lazy Initialization:** Singleton patterns for AI services to ensure build-time stability when environment variables are missing.
- **Type Safety:** Comprehensive TypeScript interfaces for AI responses and internal data structures.
- **Performance:** Optimized for CLS (Cumulative Layout Shift) using Framer Motion's layout animations.

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
    ```

3.  **Run development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```
