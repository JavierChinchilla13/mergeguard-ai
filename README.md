# 🛡️ MergeGuard CORE

**Automated Infrastructure Audit & Structured AI Code Intelligence.**

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Gemini 3.5 Flash](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-blue?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

MergeGuard is a production-grade AI-powered engine designed to automate GitHub Pull Request reviews. It goes beyond simple linting by performing multi-pass deep static analysis to detect logical bugs, security vulnerabilities, and architectural concerns, delivering senior-level feedback directly to your engineering workflow.

---

## ✨ Production-Grade Features

### 🧠 Senior Lead AI Audit
Powered by **Gemini 3.5 Flash**, MergeGuard acts as a Lead Engineer and Security Architect. It performs technical reasoning on race conditions, N+1 queries, React anti-patterns, and the OWASP Top 10 with explicit **Confidence Scoring**.

### ⚡ Deterministic SHA-256 Caching
MergeGuard implements a rigorous **content-aware caching layer**.
- **SHA-256 Verification:** Analysis is hashed based on PR diff content, ensuring absolute accuracy.
- **Instant Result Reuse:** Matches identical code states in < 50ms, bypassing redundant AI compute.
- **Explicit Invalidation:** Automatically detects new commits and triggers fresh reasoning sessions.

### 📦 Large-Diff Segmentation Pipeline
Optimized for real-world enterprise codebases where PRs exceed standard LLM context limits:
- **Intelligent Chunking:** Massive diffs are split into token-safe batches of ~30k tokens.
- **High-Risk Prioritization:** Critical logic (auth, api, middleware) is analyzed first.
- **Noise Filtering:** Automated exclusion of lockfiles, build artifacts, and binary assets.

### 📊 Engineering Observability
A professional dashboard providing full transparency into the AI's execution pipeline:
- **System Status:** Real-time connectivity tracking for GitHub and Gemini APIs.
- **Latency Instrumentation:** Millisecond-level tracking for API fetch vs. AI reasoning.
- **Decision Logs:** Technical visibility into file prioritization and skip reasons.
- **Session Fingerprinting:** Unique session IDs linked to specific code fingerprints.

### 💬 GitHub Workflow Integration
One-click review posting. MergeGuard formats findings into high-fidelity Markdown reports with emojis, severity badges, and actionable fix recommendations.

---

## 🏗️ Architecture Overview

```text
MergeGuard Pipeline:
[URL Input] -> [GitHub REST Fetch] -> [SHA-256 Fingerprinting]
                                          |
    +-------------------------------------+-----------------------------------+
    |                                                                         |
[CACHE HIT]                                                              [CACHE MISS]
Serve Persisted Report                                            [Filter & Prioritize Logic]
                                                                              |
                                                                    [Dynamic Diff Batching]
                                                                              |
                                                                   [Gemini Multi-Pass AI]
                                                                              |
                                                                    [Structured JSON Merge]
                                                                              |
                                                                     [Observability Sync]
```

---

## 🛠️ Local Development

### 1. Clone the repository
```bash
git clone https://github.com/JavierChinchilla13/mergeguard-ai.git
cd mergeguard-ai
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
GITHUB_TOKEN=your_github_personal_access_token
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.5-flash
```

### 3. Run the platform
```bash
npm install
npm run dev
```

---

## 🛣️ Future Roadmap

- [ ] **Inline GitHub Suggestions:** Direct line-level code replacement suggestions.
- [ ] **Historical Context Memory:** Repository-wide pattern recognition across multiple PRs.
- [ ] **Team Analytics:** Quality trend tracking for engineering managers.

---

## 📄 License
Distributed under the MIT License.

<p align="center">
  Built with 🛡️ by the <b>MergeGuard Team</b> for the 2026 AI Engineering Hackathon.
</p>
