"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { motion } from "framer-motion"
import { 
  Bug, 
  ShieldAlert, 
  Zap, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Database, 
  GitPullRequest, 
  Search, 
  Activity,
  ChevronRight,
  Info,
  Wind,
  Cpu,
  RefreshCw,
  FileCode,
  ShieldCheck
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function HowItWorks() {
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "analysis", "large-prs", "caching", "expectations", "integration"]
      const current = sections.find(id => {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          return rect.top >= 0 && rect.top <= 300
        }
        return false
      })
      if (current) setActiveSection(current)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020202]">
      <Navbar />
      
      <div className="container flex flex-1 gap-12 py-12">
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Documentation</p>
            <NavButton active={activeSection === "overview"} onClick={() => scrollTo("overview")} icon={<Info />} label="Product Overview" />
            <NavButton active={activeSection === "analysis"} onClick={() => scrollTo("analysis")} icon={<Search />} label="AI Analysis Core" />
            <NavButton active={activeSection === "large-prs"} onClick={() => scrollTo("large-prs")} icon={<Layers />} label="Large PR Handling" />
            <NavButton active={activeSection === "caching"} onClick={() => scrollTo("caching")} icon={<Database />} label="Cache Architecture" />
            <NavButton active={activeSection === "expectations"} onClick={() => scrollTo("expectations")} icon={<ShieldCheck />} label="Realistic Expectations" />
            <NavButton active={activeSection === "integration"} onClick={() => scrollTo("integration")} icon={<GitPullRequest />} label="GitHub Integration" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-32 pb-32">
          {/* Header */}
          <section id="overview" className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono text-[10px] tracking-widest uppercase">
                Technical Guide
              </Badge>
              <h1 className="text-4xl font-black tracking-tighter md:text-5xl">How MergeGuard Works</h1>
              <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed font-medium">
                A professional-grade AI review engine designed to automate the static analysis of Pull Requests, 
                detecting production-breaking issues before they reach your main branch.
              </p>
            </div>
          </section>

          {/* AI Analysis Core */}
          <section id="analysis" className="space-y-12 scroll-mt-24">
            <SectionHeader 
              title="AI Analysis Core" 
              description="Our engine performs multi-dimensional audits focusing on production stability and security."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalysisCategory 
                icon={<Bug className="text-red-500" />} 
                title="Logic & Bugs" 
                detail="Identifies race conditions, off-by-one errors, and unhandled edge cases."
                example="Possible infinite loop detected in useMemo dependency array."
              />
              <AnalysisCategory 
                icon={<ShieldAlert className="text-orange-500" />} 
                title="Security Flaws" 
                detail="Detection of OWASP Top 10 vulnerabilities like XSS and raw SQL injection."
                example="User-controlled input directly interpolated into database query."
              />
              <AnalysisCategory 
                icon={<Zap className="text-yellow-500" />} 
                title="Performance Gaps" 
                detail="N+1 queries, memory leaks, and expensive operations in loops."
                example="Large data mapping inside a high-frequency render cycle."
              />
              <AnalysisCategory 
                icon={<Wind className="text-blue-500" />} 
                title="Code Smells" 
                detail="Maintainability issues, dead code, and standard pattern violations."
                example="Duplicate logic found across three different service modules."
              />
              <AnalysisCategory 
                icon={<Layers className="text-purple-500" />} 
                title="Architecture" 
                detail="SOLID violations, boundary leakage, and structural debt."
                example="Circular dependency detected between domain and UI layers."
              />
              <AnalysisCategory 
                icon={<Info className="text-green-500" />} 
                title="Suggestions" 
                detail="Non-critical naming, readability, and modern JS pattern tips."
                example="Suggesting optional chaining (?.) for deep object traversal."
              />
            </div>
          </section>

          {/* Large PR Handling */}
          <section id="large-prs" className="space-y-8 scroll-mt-24">
            <SectionHeader 
              title="Large PR Handling" 
              description="Proprietary segmentation pipeline for diffs that exceed standard LLM context limits."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Segmentation Strategy
                  </h4>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    <li className="flex gap-3 items-start"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> <span><span className="text-white font-bold">Dynamic Chunking:</span> PRs are split into token-safe batches of ~30,000 tokens.</span></li>
                    <li className="flex gap-3 items-start"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> <span><span className="text-white font-bold">High-Risk Prioritization:</span> Critical files like <code className="text-[11px] bg-white/5 px-1 rounded">auth/</code> and <code className="text-[11px] bg-white/5 px-1 rounded">api/</code> are analyzed first.</span></li>
                    <li className="flex gap-3 items-start"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> <span><span className="text-white font-bold">Noise Filtering:</span> Lockfiles, assets, and build artifacts are automatically skipped.</span></li>
                  </ul>
                </div>
              </div>

              {/* Fake Log Example */}
              <div className="bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                    <div className="h-2 w-2 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">System Pipeline</span>
                </div>
                <div className="p-4 font-mono text-[11px] space-y-1.5">
                  <div className="flex gap-2"><span className="text-zinc-600">[09:41:02]</span> <span className="text-blue-400">INFO</span> <span>Analyzing 14 files...</span></div>
                  <div className="flex gap-2"><span className="text-zinc-600">[09:41:03]</span> <span className="text-zinc-500">SKIP</span> <span className="text-zinc-500 italic">package-lock.json (Generated)</span></div>
                  <div className="flex gap-2"><span className="text-zinc-600">[09:41:03]</span> <span className="text-purple-400">PRIO</span> <span>src/lib/auth.ts (Security Risk)</span></div>
                  <div className="flex gap-2"><span className="text-zinc-600">[09:41:05]</span> <span className="text-yellow-400">CHNK</span> <span>Diff segmented into 3 chunks</span></div>
                  <div className="flex gap-2"><span className="text-zinc-600">[09:41:08]</span> <span className="text-green-400">AI</span> <span>Processing batch 1/3...</span></div>
                  <div className="animate-pulse flex gap-2"><span className="text-primary">_</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* Caching Architecture */}
          <section id="caching" className="space-y-8 scroll-mt-24">
            <SectionHeader 
              title="Cache Architecture" 
              description="Verifiable, content-aware caching layer using SHA-256 deterministic hashing."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CacheCard status="hit" label="Cache Hit" description="PR diff hash matches a previously analyzed state. Results served in < 50ms." />
              <CacheCard status="miss" label="Cache Miss" description="New PR detected. Full analysis pipeline initialized from cold start." />
              <CacheCard status="invalid" label="Invalidated" description="PR content changed. New commits detected, old results discarded." />
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-4">
                <Database className="h-6 w-6 text-primary shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white">Why we cache diffs, not just URLs</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    MergeGuard uses a unique SHA-256 hash of the entire file patch set. This ensures that if you push a new commit 
                    to the same PR, our system instantly detects the change and re-analyzes, preventing stale "outdated" reviews.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Expectations */}
          <section id="expectations" className="space-y-8 scroll-mt-24">
            <SectionHeader 
              title="Realistic Expectations" 
              description="Engineering credibility is built on transparency. Here is what our AI can and cannot do."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-green-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Strengths
                </h4>
                <ul className="space-y-4 text-sm text-zinc-400">
                  <li className="flex gap-3"><div className="h-5 w-5 rounded bg-green-500/10 flex items-center justify-center shrink-0"><ChevronRight className="h-3 w-3 text-green-500" /></div> <span><span className="text-white font-bold">Confidence Scoring:</span> Every finding is assigned a confidence level (High/Medium/Low) based on pattern matching and logic certainty.</span></li>
                  <li className="flex gap-3"><div className="h-5 w-5 rounded bg-green-500/10 flex items-center justify-center shrink-0"><ChevronRight className="h-3 w-3 text-green-500" /></div> <span>Catches <span className="text-white font-bold">obvious logic bugs</span> that human reviewers often miss during long sessions.</span></li>
                  <li className="flex gap-3"><div className="h-5 w-5 rounded bg-green-500/10 flex items-center justify-center shrink-0"><ChevronRight className="h-3 w-3 text-green-500" /></div> <span>Highly effective at <span className="text-white font-bold">security surface analysis</span> (OWASP patterns).</span></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Limitations
                </h4>
                <ul className="space-y-4 text-sm text-zinc-400">
                  <li className="flex gap-3"><div className="h-5 w-5 rounded bg-red-500/10 flex items-center justify-center shrink-0"><ChevronRight className="h-3 w-3 text-red-500" /></div> <span><span className="text-white font-bold">Context Gaps:</span> AI cannot fully understand company-wide tribal knowledge or specific legacy constraints.</span></li>
                  <li className="flex gap-3"><div className="h-5 w-5 rounded bg-red-500/10 flex items-center justify-center shrink-0"><ChevronRight className="h-3 w-3 text-red-500" /></div> <span><span className="text-white font-bold">Not a Replacement:</span> Should be used to *augment* senior human review, never as the final sole sign-off.</span></li>
                  <li className="flex gap-3"><div className="h-5 w-5 rounded bg-red-500/10 flex items-center justify-center shrink-0"><ChevronRight className="h-3 w-3 text-red-500" /></div> <span><span className="text-white font-bold">Diff Visibility:</span> Results are only as good as the patch context provided by the GitHub API.</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Session Auditing */}
          <section className="space-y-8 scroll-mt-24">
            <SectionHeader 
              title="Session Fingerprinting" 
              description="Full transparency into analysis execution via verifiable session metadata."
            />
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-white font-bold flex items-center gap-2 italic">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    SHA-256 Session ID
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono">Example: SES-A1B2C3D4</p>
                </div>
                <div className="flex gap-4">
                   <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black tracking-widest uppercase">Verifiable</Badge>
                   <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black tracking-widest uppercase">Auditable</Badge>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Every analysis run generates a unique session ID and a diff fingerprint. This ensures that the results you see 
                are directly linked to a specific state of the code. In the <span className="text-white font-bold">Observability</span> tab, 
                you can view the exact technical reasoning for why each file was prioritized or skipped during that specific session.
              </p>
            </div>
          </section>

          {/* GitHub Integration */}
          <section id="integration" className="space-y-8 scroll-mt-24">
            <SectionHeader 
              title="GitHub Integration" 
              description="Deep integration with the GitHub REST API for seamless developer workflows."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <IntegrationItem 
                icon={<RefreshCw />} 
                title="Diff Streaming" 
                detail="Fetches multi-file patches using secure environment tokens. Supports private and public repositories." 
              />
              <IntegrationItem 
                icon={<FileCode />} 
                title="Markdown Reports" 
                detail="Generates high-fidelity comments with emojis, severity badges, and code snippets for easy scanning." 
              />
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  )
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-white/5 hover:text-white"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
      {label}
    </button>
  )
}

function SectionHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-2 border-l-2 border-primary/20 pl-6 py-1">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="text-zinc-500 max-w-xl text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function AnalysisCategory({ icon, title, detail, example }: { icon: React.ReactNode, title: string, detail: string, example: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all">
      <div className="mb-4">{icon}</div>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-zinc-500 leading-relaxed mb-4">{detail}</p>
      <div className="p-3 rounded-lg bg-black/50 border border-white/5 font-mono text-[10px] text-zinc-400">
        <span className="text-primary font-bold uppercase mr-2">Example:</span>
        {example}
      </div>
    </div>
  )
}

function CacheCard({ status, label, description }: { status: 'hit' | 'miss' | 'invalid', label: string, description: string }) {
  const styles = {
    hit: "bg-green-500/10 text-green-500 border-green-500/20",
    miss: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    invalid: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
  }
  return (
    <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5">
      <Badge variant="outline" className={cn("mb-4 text-[9px] font-bold uppercase tracking-widest", styles[status])}>
        {label}
      </Badge>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}

function IntegrationItem({ icon, title, detail }: { icon: React.ReactNode, title: string, detail: string }) {
  return (
    <div className="flex gap-4 items-start p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
      <div className="p-3 rounded-xl bg-white/5 text-zinc-400">
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-white">{title}</h4>
        <p className="text-sm text-zinc-500 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}
