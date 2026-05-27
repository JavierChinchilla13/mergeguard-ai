# 🛡️ MergeGuard AI

**Automated Code Intelligence for Every Pull Request.**

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Gemini 3.5 Flash](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-blue?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MergeGuard is a production-grade AI-powered engine designed to automate GitHub Pull Request reviews. It goes beyond simple linting by performing multi-pass deep static analysis to detect logical bugs, security vulnerabilities, and architectural concerns, delivering senior-level feedback directly to your engineering workflow.

---

## 🔍 The Problem

Modern engineering teams face a scaling bottleneck: **The Pull Request Review.**
- **Cognitive Load:** Reviewing large, complex diffs is exhausting and error-prone.
- **Review Latency:** High-priority features often stall waiting for human sign-off.
- **Consistency:** Security and performance patterns are frequently overlooked in the rush to ship.

MergeGuard solves this by providing a scalable, transparent, and high-intelligence "AI Lead Engineer" that audits every line of code before a human even opens the PR.

---

## ✨ Core Features

### 🧠 Senior-Level AI Reasoning
Powered by **Gemini 3.5 Flash**, MergeGuard acts as a Lead Engineer and Security Architect. It doesn't just "summarize"—it reasons about race conditions, N+1 queries, React anti-patterns, and the OWASP Top 10.

### ⚡ Verifiable Context Caching
MergeGuard implements a rigorous **SHA-256 content-aware caching layer**.
- **Deterministic Keys:** Analysis is hashed based on PR content, not just URL.
- **Instant Reuse:** If a PR hasn't changed, results are served instantly from the server-side cache.
- **Invalidation:** The cache automatically invalidates the moment a new commit is pushed.

### 📦 Intelligent Large PR Handling
While standard AI wrappers fail on large diffs, MergeGuard uses a sophisticated **segmentation pipeline**:
- **Token Estimation:** Real-time character-to-token projection.
- **Incremental Chunking:** Massive PRs are split into token-safe batches and processed sequentially.
- **Smart Prioritization:** Backend logic prioritizes high-risk files (`auth/`, `api/`, `services/`) while skipping noise (`lockfiles`, `binaries`, `assets`).

### 📊 Engineering Observability
A professional dashboard provides full transparency into the AI's execution:
- **Latency Instrumentation:** Millisecond-level tracking for GitHub API vs. AI Compute.
- **Decision Logs:** Real-time visibility into why files were prioritized or skipped.
- **Token Metrics:** Precise tracking of resource consumption per analysis.

### 💬 Direct GitHub Integration
One-click review posting. MergeGuard formats findings into professional, high-fidelity Markdown comments with emojis, severity badges, and actionable fix recommendations.

---

## 🏗️ Architecture Overview

```text
MergeGuard Pipeline:
[URL Input] -> [GitHub API Fetch] -> [SHA-256 Content Hashing]
                                          |
    +-------------------------------------+-----------------------------------+
    |                                                                         |
[CACHE HIT]                                                              [CACHE MISS]
Serve Persisted Result                                            [Filter & Prioritize Files]
                                                                              |
                                                                    [Dynamic Diff Chunking]
                                                                              |
                                                                   [Gemini Multi-Pass AI]
                                                                              |
                                                                    [Structured JSON Merge]
                                                                              |
                                                                     [Observability Sync]
```

### Technical Stack
- **Frontend:** Next.js 15 (App Router), Framer Motion, Tailwind CSS v4.
- **AI Engine:** Google AI SDK (Gemini 3.5 Flash).
- **Observability:** Custom internal instrumentation for latency and resource tracking.
- **Caching:** In-memory server-side persistence with SHA-256 verification.

---

## 🚀 Large Diff Strategy

MergeGuard is built for real-world codebases. When a PR exceeds Gemini's context limits, our pipeline activates:

1.  **Filtering:** Automatically removes `package-lock.json`, `dist/`, and binary assets.
2.  **Prioritization:** Assigns weights to directories. `app/api/` is analyzed before `src/styles/`.
3.  **Truncation:** Individual file patches are capped at 12,000 characters to prevent single-file token overflow.
4.  **Batching:** Remaining content is segmented into optimized chunks, processed through the AI, and merged into a cohesive structured response.

---

## 🛠️ Local Development

### 1. Clone the repository
```bash
git clone https://github.com/JavierChinchilla13/mergeguard-ai.git
cd mergeguard-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Required: For fetching PR data and posting comments
GITHUB_TOKEN=your_github_personal_access_token

# Required: The core AI intelligence
GEMINI_API_KEY=your_google_ai_studio_key

# Optional: Defaults to gemini-3.5-flash
GEMINI_MODEL=gemini-3.5-flash
```

### 4. Run the platform
```bash
npm run dev
```

---

## ⚖️ Engineering Tradeoffs

- **Sequential vs Parallel Processing:** To ensure stability on the Gemini Free Tier, we process chunks sequentially. While this adds latency for massive PRs, it significantly reduces `429 Too Many Requests` errors.
- **In-Memory Caching:** We opted for a high-performance in-memory `Map` for result caching. For a global production scale, this would be swapped for Redis, but for hackathon demonstration, this provides the lowest possible latency.
- **Flash vs Pro Models:** We prioritize **Gemini Flash** for its superior speed and lower token cost, which allows for the high-fidelity "streaming" feel of the application.

---

## 🛣️ Future Roadmap

- [ ] **Inline GitHub Suggestions:** Use the GitHub Review API to suggest code changes directly on specific lines.
- [ ] **Historical Memory:** Allow the AI to "remember" previous reviews for a specific repository to detect recurring patterns.
- [ ] **Team Collaboration:** Shared dashboards for engineering managers to track code quality trends over time.
- [ ] **Multi-Model Orchestration:** Use Gemini Pro for complex architectural reviews and Flash for rapid bug checking.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with 🛡️ by the <b>MergeGuard Team</b> for the 2026 AI Engineering Hackathon.
</p>
