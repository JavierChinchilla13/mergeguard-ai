# 🛡️ MergeGuard Core

**Automated Infrastructure Audit & Structured AI Code Intelligence.**

[![Hackathon](https://img.shields.io/badge/Hackathon-IQ%20Source%20AI-blue)](https://hackathon.example.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Gemini 3.5 Flash](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-blue?logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Parallel Execution](https://img.shields.io/badge/Performance-Parallel%20Execution-green)](#-system-architecture)

MergeGuard Core is an enterprise-grade PR audit engine designed to automate technical debt detection, security surface analysis, and architectural reviews. Operating as a **Senior Staff Engineer**, it implements a multi-pass technical reasoning pipeline with deterministic SHA-256 caching, parallel diff segmentation, and deep engineering observability.

[Live Deployment Placeholder](https://merge-guard.vercel.app) • [GitHub Repository](https://github.com/JavierChinchilla13/mergeguard-ai)

---

## 🚀 Key Features

- **Staff-Level Reasoning:** Deep audits across Security (OWASP), Correctness (Race Conditions), Architecture (SOLID), Performance, and Maintainability.
- **Enterprise-Grade Reports:** High-fidelity GitHub comments featuring visual Risk Assessments (0-100), Production Impact analysis, and CWE Security Mappings.
- **Parallel Pipeline:** Concurrent diff processing via `Promise.all`, delivering comprehensive multi-chunk audits in seconds.
- **Deterministic Caching:** SHA-256 content fingerprinting and Google Context Caching for near-instant reviews of unchanged code.
- **Observability Dashboard:** Real-time terminal logs, latency profiles, and resource prioritization insights.

---

## 🏗️ System Architecture

MergeGuard is built on a stateless, concurrent pipeline optimized for low-latency streaming and high-reliability JSON extraction.

```text
[PR URL] -> [GitHub REST Service] -> [SHA-256 Fingerprinting]
                                          |
    +-------------------------------------+-----------------------------------+
    |                                                                         |
[CACHE HIT]                                                              [CACHE MISS]
Serve Persisted Report                                            [Filter & Prioritize Logic]
(Latency < 50ms)                                                              |
                                                                    [PARALLEL Diff Batching]
                                                                              |
                                                                   [Gemini Multi-Pass AI]
                                                                              |
[GitHub Comment Service] <----- [Schema Validation] <----- [Structured JSON Merge]
                                          |
                                 [Observability Sink]
```

### Technical Stack

- **Framework:** Next.js 16 (App Router) with Framer Motion for execution tracking.
- **AI Engine:** Gemini 3.5 Flash (chosen for 1M+ token context and rapid parallel inference).
- **Security:** Automated CWE mapping and impact exploitability analysis.
- **UI:** Tailwind CSS v4 for high-density engineering dashboards.

---

## 📊 Core Technology

### 1. Parallel Chunking Pipeline
Large PRs are segmented into token-safe batches and processed **concurrently**.
- **Prioritization:** Files in `auth/`, `api/`, and `middleware/` are prioritized for security audits.
- **Performance:** Total reasoning duration is limited by the single longest chunk rather than the sum of all chunks.

### 2. Senior Staff AI Reasoning
Gemini is prompted with a senior-staff persona focused on:
- **Production Impact:** Detail real-world consequences and exploitability.
- **Architectural Debt:** Surface scalability bottlenecks and pattern violations.
- **CWE Mapping:** Security findings include verified CWE identifiers (e.g., `CWE-79` for XSS).

### 3. Engineering Observability
Full transparency into execution:
- **Latency Instrumentation:** Breakdown of GitHub Fetch, Segmentation, and AI Reasoning time.
- **Resource Strategy:** Detailed logs showing why specific files were prioritized or skipped.
- **Audit Reports:** Visual risk scoring (Critical, High, Medium, Low) with contributors list.

---

## ⚙️ Local Development Setup

### 1. Environment Variables
Create a `.env.local` file:
```env
GITHUB_TOKEN=your_github_pat
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.5-flash
```

### 2. Installation & Run
```bash
npm install
npm run dev
```

---

## 🖼️ Screenshots

![Landing Page](./public/screenshots/landing-page.png)
_Initial PR input and system status dashboard._

![Analysis Results](./public/screenshots/analysis-results.png)
_Structured findings with visual Risk Assessment and Impact analysis._

![Observability Panel](./public/screenshots/observability-panel.png)
_Latency metrics and concurrent execution logs._

![GitHub Preview](./public/screenshots/github-preview.png)
_Enterprise-grade Markdown report preview._

---

<p align="center">
  Built for the 2026 AI Engineering Hackathon. Engineered for production.
</p>
