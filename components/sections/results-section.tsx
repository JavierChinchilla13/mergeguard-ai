"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  Bug, 
  ShieldAlert, 
  Zap, 
  Wind, 
  Lightbulb, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  FileCode,
  Activity,
  CheckCircle2,
  Send,
  Loader2,
  CheckCircle,
  ExternalLink as ExternalLinkIcon,
  Database,
  Clock,
  Cpu,
  Layers,
  FileText,
  BarChart3,
  Search,
  ArrowUpRight,
  Target,
  Gauge
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { ReviewResponse, ReviewFinding } from "@/lib/gemini"
import { AnalysisMetadata } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

interface ResultsSectionProps {
  review: ReviewResponse
  files?: any[]
  prDetails?: { owner: string; repo: string; pullNumber: number }
  metadata?: AnalysisMetadata
}

const CATEGORY_MAP = {
  bugs: { icon: Bug, label: "Bugs", color: "text-red-500", bg: "bg-red-500/10" },
  security: { icon: ShieldAlert, label: "Security", color: "text-orange-500", bg: "bg-orange-500/10" },
  performance: { icon: Zap, label: "Performance", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  codeSmells: { icon: Wind, label: "Code Smells", color: "text-blue-500", bg: "bg-blue-500/10" },
  architectureConcerns: { icon: Layers, label: "Architecture", color: "text-purple-500", bg: "bg-purple-500/10" },
  suggestions: { icon: Lightbulb, label: "Suggestions", color: "text-green-500", bg: "bg-green-500/10" },
}

export function ResultsSection({ review, files, prDetails, metadata }: ResultsSectionProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"issues" | "files" | "observability">("issues")
  
  // Posting state
  const [isPosting, setIsPosting] = useState(false)
  const [postUrl, setPostUrl] = useState<string | null>(null)
  const [postError, setPostError] = useState<string | null>(null)

  const handlePostReview = async () => {
    if (!prDetails || isPosting || postUrl) return;
    setIsPosting(true);
    setPostError(null);
    try {
      const response = await fetch("/api/post-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: prDetails.owner,
          repo: prDetails.repo,
          pullNumber: prDetails.pullNumber,
          review: review
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to post review");
      setPostUrl(data.commentUrl);
    } catch (err: any) {
      setPostError(err.message);
      console.error("Post Error:", err);
    } finally {
      setIsPosting(false);
    }
  };

  const categories = Object.entries(CATEGORY_MAP).map(([key, config]) => {
    const categoryIssues = (review as any)[key] || []
    return { key, ...config, count: categoryIssues.length, issues: categoryIssues }
  }).filter(c => c.count > 0)

  const totalIssues = categories.reduce((acc, cat) => acc + cat.count, 0)

  return (
    <section className="container py-12">
      <div className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 text-sm text-primary font-mono bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
              <Activity className="h-3.5 w-3.5" />
              <span>{prDetails?.owner}/{prDetails?.repo} • #{prDetails?.pullNumber}</span>
            </div>
            <Badge variant="outline" className={cn(
              "h-6 px-2 capitalize font-mono text-[10px]",
              review?.overallRating === 'excellent' ? "text-green-500 border-green-500/20 bg-green-500/5" :
              review?.overallRating === 'good' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" :
              review?.overallRating === 'needs_work' ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" :
              "text-red-500 border-red-500/20 bg-red-500/5"
            )}>
              Rating: {review?.overallRating?.replace('_', ' ') || 'Pending'}
            </Badge>
            {metadata?.cacheStatus === 'hit' && (
              <Badge variant="secondary" className="h-6 gap-1.5 bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono text-[10px]">
                <Database className="h-3 w-3" />
                Cache Hit
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <h2 className="text-3xl font-bold tracking-tight">Analysis Report</h2>
            {prDetails && !postUrl && (
              <Button 
                variant="outline" size="sm" className="h-8 gap-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={handlePostReview} disabled={isPosting}
              >
                {isPosting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Posting...</> : <><Send className="h-3.5 w-3.5" />Post to GitHub</>}
              </Button>
            )}
            {postUrl && (
              <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 border border-green-500/20">
                <CheckCircle className="h-3.5 w-3.5" />
                Posted
                <Link href={postUrl} target="_blank" className="ml-1 underline flex items-center gap-0.5">
                  View <ExternalLinkIcon className="h-2.5 w-2.5" />
                </Link>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{review?.summary || "Comprehensive AI audit results."}</p>
          
          {review?.positiveFeedback?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {review.positiveFeedback.map((text, i) => (
                <span key={i} className="text-[11px] font-medium bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  {text}
                </span>
              ))}
            </div>
          )}

          {postError && (
            <p className="text-xs text-destructive font-medium mt-2">Error: {postError}</p>
          )}
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 self-start md:self-center">
          <TabButton active={activeTab === "issues"} onClick={() => setActiveTab("issues")} icon={<AlertTriangle className="h-4 w-4" />} label="Review" count={totalIssues} />
          <TabButton active={activeTab === "files"} onClick={() => setActiveTab("files")} icon={<FileCode className="h-4 w-4" />} label="Files" count={files?.length} />
          <TabButton active={activeTab === "observability"} onClick={() => setActiveTab("observability")} icon={<BarChart3 className="h-4 w-4" />} label="Observability" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "issues" && (
          <motion.div key="issues-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {totalIssues === 0 ? <EmptyState /> : categories.map(category => (
              <div key={category.key} className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <category.icon className={cn("h-5 w-5", category.color)} />
                  <h3 className="text-xl font-semibold">{category.label}</h3>
                  <span className="text-sm text-muted-foreground ml-2">({category.count})</span>
                </div>
                <div className="grid gap-4">
                  {category.issues.map((issue: ReviewFinding, idx: number) => {
                    const issueId = `${category.key}-${idx}`;
                    return <IssueCard key={issueId} issue={issue} isExpanded={expandedIssue === issueId} onToggle={() => setExpandedIssue(expandedIssue === issueId ? null : issueId)} />
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === "files" && (
          <motion.div key="files-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-4">
            {files?.map((file, idx) => <FileCard key={idx} file={file} />)}
          </motion.div>
        )}
        {activeTab === "observability" && metadata && (
          <motion.div key="observability-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Cpu className="h-5 w-5" />} label="AI Engine" value={metadata.model} />
              <StatCard icon={<Layers className="h-5 w-5" />} label="Estimated Tokens" value={`~${metadata.totalTokens.toLocaleString()}`} />
              <StatCard icon={<Target className="h-5 w-5" />} label="Analysis Scope" value={`${metadata.filesAnalyzed} Files`} subValue={`${metadata.chunkCount} AI Chunks`} />
              <StatCard icon={<Clock className="h-5 w-5" />} label="Pipeline Duration" value={`${(metadata.duration / 1000).toFixed(2)}s`} subValue={`AI Latency: ${(metadata.latencies.ai / 1000).toFixed(2)}s`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Latency Instrumentation */}
              <Card className="lg:col-span-1 bg-card/30 border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    Latency Instrumentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LatencyMetric label="GitHub API" value={metadata.latencies.github} maxValue={3000} />
                  <LatencyMetric label="Diff Chunking" value={metadata.latencies.chunking} maxValue={1000} />
                  <LatencyMetric label="Gemini Reasoning" value={metadata.latencies.ai} maxValue={15000} />
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Retry Count:</span>
                      <span className={metadata.retryCount > 0 ? "text-yellow-500" : "text-green-500"}>{metadata.retryCount}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Cache State:</span>
                      <span className="text-primary">{metadata.cacheStatus.toUpperCase()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pipeline Insights */}
              <Card className="lg:col-span-2 bg-card/30 border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Pipeline Decision Log
                  </CardTitle>
                  <CardDescription className="text-xs">Exposing the logic behind file prioritization and filtering.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] overflow-y-auto space-y-2 font-mono text-[11px] scrollbar-none pr-4">
                    {metadata.insights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                        <Badge variant="outline" className={cn(
                          "h-5 px-1.5 text-[9px] uppercase font-bold shrink-0",
                          insight.decision === 'prioritized' ? "text-purple-400 border-purple-500/30 bg-purple-500/5" :
                          insight.decision === 'skipped' ? "text-muted-foreground border-white/10" :
                          "text-green-400 border-green-500/30 bg-green-500/5"
                        )}>
                          {insight.decision}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate">{insight.filename}</p>
                          <p className="text-muted-foreground mt-0.5 italic">{insight.reason}</p>
                        </div>
                        {insight.decision === 'prioritized' && <ArrowUpRight className="h-3 w-3 text-purple-400 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function LatencyMetric({ label, value, maxValue }: { label: string, value: number, maxValue: number }) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-bold">{value}ms</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn(
            "h-full rounded-full",
            percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-yellow-500" : "bg-primary"
          )}
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all", active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {icon} {label} {count !== undefined && `(${count})`}
    </button>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue?: string }) {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardContent className="p-6 flex items-start gap-4">
        <div className="mt-1 rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{label}</p>
          <p className="text-lg font-bold mt-1 tracking-tight truncate">{value}</p>
          {subValue && <p className="text-[10px] font-mono text-muted-foreground mt-1 opacity-70">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-green-500/10 p-4"><CheckCircle2 className="h-10 w-10 text-green-500" /></div>
      <h3 className="text-xl font-bold">No Issues Found</h3>
      <p className="text-muted-foreground max-w-md">Gemini analyzed your code and found no critical bugs or vulnerabilities. Great work!</p>
    </div>
  );
}

function FileCard({ file }: { file: any }) {
  const [showPatch, setShowPatch] = useState(false)
  return (
    <Card className="border-border/40 overflow-hidden bg-card/30">
      <CardHeader className="p-4 md:p-6 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setShowPatch(!showPatch)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><FileCode className="h-5 w-5 text-muted-foreground" /></div>
            <div>
              <CardTitle className="text-base font-mono truncate max-w-[200px] md:max-w-md">{file.filename}</CardTitle>
              <div className="flex items-center gap-3 mt-1 text-[10px] font-mono">
                <span className="text-green-500">+{file.additions}</span>
                <span className="text-red-500">-{file.deletions}</span>
                <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase border-white/10 text-muted-foreground">{file.status}</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground text-xs">{showPatch ? "Hide Patch" : "Show Patch"}</Button>
        </div>
      </CardHeader>
      <AnimatePresence>{showPatch && file.patch && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/20">
          <CodeBlock code={file.patch} className="rounded-none border-0" />
        </motion.div>
      )}</AnimatePresence>
    </Card>
  )
}

function IssueCard({ issue, isExpanded, onToggle }: { issue: ReviewFinding, isExpanded: boolean, onToggle: () => void }) {
  return (
    <Card className={cn("overflow-hidden transition-all duration-200 border-border/40 bg-card/40 hover:border-primary/30", isExpanded && "border-primary/50 shadow-lg shadow-primary/5")}>
      <CardHeader className="cursor-pointer select-none p-4 md:p-6 hover:bg-white/[0.01]" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 w-full">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CardTitle className="text-lg leading-tight">{issue.title}</CardTitle>
                <Badge variant={issue.severity as any} className="capitalize text-[9px] h-4.5 px-1.5 font-bold">
                  {issue.severity}
                </Badge>
                <Badge variant="outline" className="capitalize text-[9px] h-4.5 px-1.5 border-white/10 text-muted-foreground font-mono">
                  Confidence: {issue.confidence}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">{issue.file}:{issue.line}</p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-transform duration-200">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>
      <AnimatePresence>{isExpanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          <CardContent className="space-y-6 border-t border-border/20 p-4 pt-6 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The Finding</h4>
                <p className="text-foreground leading-relaxed text-sm">{issue.description}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400/80">Production Impact</h4>
                <p className="text-foreground/90 leading-relaxed text-sm">{issue.impact}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Technical Reasoning</h4>
              <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/20 pl-4">
                {issue.technicalReasoning}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Code Evidence</h4>
              <CodeBlock code={issue.codeSnippet} filename={issue.file} line={issue.line} />
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-primary" /><h4 className="text-xs font-bold uppercase tracking-wide text-primary">Senior Fix Recommendation</h4></div>
              <p className="text-sm text-foreground/90 leading-relaxed font-mono whitespace-pre-wrap">{issue.recommendation}</p>
            </div>
          </CardContent>
        </motion.div>
      )}</AnimatePresence>
    </Card>
  )
}
