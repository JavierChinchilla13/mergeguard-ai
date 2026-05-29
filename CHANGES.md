# MergeGuard Core • Changelog

## 🛡️ The "MergeGuard Core" Upgrade (Finale)

**Enterprise-Grade Performance & Intelligence Rollout.**

### 🚀 Performance & Scalability
- **Parallel Analysis Engine:** Refactored the core pipeline to use `Promise.all` for concurrent diff processing. Analysis duration for large PRs is now limited by the single longest chunk, reducing total latency by up to 60%.
- **Context Caching v2:** Optimized Google Context Caching integration to reuse token embeddings across parallel batches, further reducing compute costs and cold-start times.

### 🧠 Senior Staff Intelligence
- **Persona Evolution:** Upgraded the AI reasoning engine to a "Senior Staff Software Engineer & Security Architect" persona.
- **Broad Coverage:** Re-balanced the system prompt to provide comprehensive audits across **Security, Correctness, Architecture, Performance, and Maintainability.**
- **Impact Reasoning:** Every finding now includes a dedicated "Production Impact" analysis detailing real-world consequences and exploitability.
- **CWE Security Mappings:** Aligned with industry standards by automatically mapping security findings to **CWE Identifiers** (e.g., CWE-79, CWE-89).
- **Positive Engineering Findings:** The AI now identifies and acknowledges high-quality code patterns and proper architectural decisions.

### 💎 Enterprise Report Polishing
- **Visual Risk Assessment:** Added a 0-100 Risk Score and a Markdown progress bar at the top of every GitHub comment for instant quality signaling.
- **Unified Markdown Formatter:** Centralized all reporting logic to ensure 100% parity between the "Live Preview" modal and the final GitHub PR comment.
- **Cleaner Metadata:** Simplified the "Analysis Summary" table, focusing on high-signal metrics like duration, token count, and issues detected.
- **Privacy Guard:** Removed internal Session IDs from public GitHub comments to maintain a clean, professional audit trail.

### 🧹 Codebase Hardening (Final Cleanup)
- **Dead Code Removal:** Eliminated `lib/mock-data.ts` and dozens of unused Next.js boilerplate assets.
- **Strict Typing:** Replaced remaining `any` types with specific interfaces (`PRFile`, `ReviewResponse`, `AnalysisMetadata`) across the entire pipeline.
- **Lint Compliance:** Fixed 60+ lint warnings and errors, including unescaped React entities and unused icon imports.
- **API Standardisation:** Standardized error handling across all routes using `unknown` guards and explicit `Error` interfaces.

---

Built for the 2026 AI Engineering Hackathon. Engineered for production.
