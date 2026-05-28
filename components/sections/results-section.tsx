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
  Gauge,
  Copy,
  Terminal,
  FileWarning,
  Eye,
  Info,
  ShieldCheck,
  ZapOff,
  AlertCircle
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
  const [showPreview, setShowPreview] = useState(false)

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
      setShowPreview(false);
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

  const getMarkdownPreview = () => {
    if (!review) return "";
    let md = `## 🛡️ MergeGuard AI Review\n\n`;
    md += `**Overall Rating: ${review.overallRating.toUpperCase().replace('_', ' ')}**\n\n`;
    md += `${review.summary}\n\n`;
    
    categories.forEach(cat => {
      md += `### ${cat.label}\n`;
      cat.issues.forEach((issue: any) => {
        md += `- **${issue.title}** (${issue.file}:${issue.line})\n`;
        md += `  *${issue.description}*\n`;
      });
      md += `\n`;
    });
    
    return md;
  }

  return (
    <section className="container py-12">
      {/* Header & Quick Stats */}
      <div className="mb-12 flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] text-primary font-bold font-mono bg-primary/10 px-2 py-1 rounded border border-primary/20 uppercase tracking-widest">
                <Activity className="h-3.5 w-3.5" />
                <span>{prDetails?.owner}/{prDetails?.repo} • #{prDetails?.pullNumber}</span>
              </div>
              <Badge variant="outline" className={cn(
                "h-6 px-3 capitalize font-bold text-[10px] tracking-wider",
                review?.overallRating === 'excellent' ? "text-green-500 border-green-500/20 bg-green-500/5" :
                review?.overallRating === 'good' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" :
                review?.overallRating === 'needs_work' ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" :
                "text-red-500 border-red-500/20 bg-red-500/5"
              )}>
                Rating: {review?.overallRating?.replace('_', ' ') || 'Pending'}
              </Badge>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">Analysis Report</h2>
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{review?.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {prDetails && !postUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2 text-xs font-bold px-4 border-primary/20 hover:bg-primary/10 transition-all"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4" />
                Preview Comment
              </Button>
            )}
            {postUrl && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-xs font-bold text-green-500 border border-green-500/20">
                <CheckCircle className="h-4 w-4" />
                Review Posted
                <Link href={postUrl} target="_blank" className="ml-2 underline flex items-center gap-1">
                  GitHub <ExternalLinkIcon className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Floating Observability Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <QuickStat 
            icon={<Database />} 
            label="Cache" 
            value={metadata?.cacheStatus === 'hit' ? "HIT" : metadata?.cacheStatus === 'invalidated' ? "INVALID" : "MISS"} 
            sub={metadata?.cacheStatus === 'hit' ? "SHA-256 Verified" : metadata?.cacheStatus === 'invalidated' ? "Diff Changed" : "Cold Start"} 
            highlight={metadata?.cacheStatus === 'hit'} 
          />
          <QuickStat icon={<Layers />} label="Chunks" value={metadata?.chunkCount.toString() || "0"} sub="Sequential" />
          <QuickStat icon={<Cpu />} label="Tokens" value={`~${metadata?.totalTokens.toLocaleString()}`} sub="Optimized" />
          <QuickStat icon={<ZapOff />} label="Skipped" value={metadata?.filesSkipped.toString() || "0"} sub="Non-source" />
          <QuickStat icon={<Gauge />} label="AI Latency" value={`${((metadata?.latencies.ai || 0) / 1000).toFixed(1)}s`} sub="Reasoning" />
          <QuickStat icon={<Clock />} label="Total" value={`${((metadata?.duration || 0) / 1000).toFixed(1)}s`} sub="Pipeline" />
        </div>
      </div>

      {metadata?.cacheStatus === 'invalidated' && (
        <div className="mb-8 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex items-center gap-3">
          <Info className="h-4 w-4 text-yellow-500" />
          <p className="text-xs text-yellow-500/90 font-medium">
            <span className="font-bold">Cache Invalidation:</span> {metadata.cacheInvalidationReason || "The PR content has changed since the last analysis."}
          </p>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab("issues")}
            className={cn(
              "relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors",
              activeTab === "issues" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Review Issues {totalIssues > 0 && <span className="ml-1 text-[10px] opacity-50">({totalIssues})</span>}
            {activeTab === "issues" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab("files")}
            className={cn(
              "relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors",
              activeTab === "files" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Changed Files <span className="ml-1 text-[10px] opacity-50">({files?.length || 0})</span>
            {activeTab === "files" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab("observability")}
            className={cn(
              "relative pb-4 text-sm font-bold uppercase tracking-widest transition-colors",
              activeTab === "observability" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Observability
            {activeTab === "observability" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "issues" && (
          <motion.div key="issues-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
            {totalIssues === 0 ? <EmptyState /> : categories.map(category => (
              <div key={category.key} className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-primary/20 pl-4 py-1">
                  <category.icon className={cn("h-6 w-6", category.color)} />
                  <h3 className="text-2xl font-bold tracking-tight">{category.label}</h3>
                  <Badge variant="outline" className="ml-2 font-mono text-[10px] text-muted-foreground">
                    {category.count} Findings
                  </Badge>
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
          <motion.div key="files-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4">
            {files?.map((file, idx) => {
              const insight = metadata?.insights.find(i => i.filename === file.filename);
              return <FileCard key={idx} file={file} insight={insight} />
            })}
          </motion.div>
        )}

        {activeTab === "observability" && metadata && (
          <motion.div key="observability-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ObservabilityStat icon={<Terminal />} label="Execution Core" value={metadata.model} detail="Gemini 3.5 Flash" />
              <ObservabilityStat icon={<Database />} label="Cache Hit Ratio" value={metadata.cacheStatus === 'hit' ? "100%" : "0%"} detail="Content-Aware" />
              <ObservabilityStat icon={<Layers />} label="Analysis Segments" value={metadata.chunkCount.toString()} detail="Diff Chunking" />
              <ObservabilityStat icon={<Activity />} label="Total Tokens" value={metadata.totalTokens.toLocaleString()} detail="Input Projection" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-card/30 border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Latency Instrumentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <LatencyMetric label="GitHub API Fetch" value={metadata.latencies.github} maxValue={3000} />
                  <LatencyMetric label="AI Context Loading" value={metadata.latencies.chunking} maxValue={1000} />
                  <LatencyMetric label="Gemini Reasoning" value={metadata.latencies.ai} maxValue={15000} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-card/30 border-border/40">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pipeline Decision Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] overflow-y-auto space-y-2 font-mono text-[11px] scrollbar-thin">
                    {metadata.insights.map((insight, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded bg-white/[0.02] border border-white/5">
                        <Badge variant="outline" className={cn(
                          "h-5 px-1.5 text-[8px] font-bold uppercase",
                          insight.decision === 'prioritized' ? "text-purple-400 border-purple-400/30" : "text-muted-foreground border-white/10"
                        )}>
                          {insight.decision}
                        </Badge>
                        <span className="flex-1 truncate text-zinc-400">{insight.filename}</span>
                        <span className="text-zinc-600 italic shrink-0">{insight.reason}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border/40 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">GitHub Comment Preview</h3>
                  <p className="text-sm text-muted-foreground">Formatted Markdown as it will appear on the PR.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                  <ZapOff className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-black/20">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                  {getMarkdownPreview()}
                </div>
              </div>

              <div className="p-6 border-t border-border/40 flex items-center justify-between gap-4">
                <Button 
                  variant="outline" 
                  className="gap-2 font-bold"
                  onClick={() => {
                    navigator.clipboard.writeText(getMarkdownPreview());
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
                <div className="flex gap-3">
                  <Button variant="ghost" className="font-bold" onClick={() => setShowPreview(false)}>Cancel</Button>
                  <Button 
                    className="gap-2 font-bold px-8 bg-primary hover:bg-primary/90"
                    onClick={handlePostReview}
                    disabled={isPosting}
                  >
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post to GitHub
                  </Button>
                </div>
              </div>
              {postError && (
                <div className="px-6 pb-6 flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4" />
                  {postError}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

function QuickStat({ icon, label, value, sub, highlight = false }: { icon: React.ReactNode, label: string, value: string, sub: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-3 rounded-xl border transition-all",
      highlight ? "bg-primary/5 border-primary/20" : "bg-card/50 border-border/40 hover:border-border"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("text-muted-foreground opacity-50", highlight && "text-primary opacity-100")}>
          {React.cloneElement(icon as React.ReactElement, { className: "h-3 w-3" })}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-sm font-bold tracking-tight", highlight && "text-primary")}>{value}</p>
      <p className="text-[9px] text-muted-foreground opacity-70 font-mono mt-0.5">{sub}</p>
    </div>
  )
}

function ObservabilityStat({ icon, label, value, detail }: { icon: React.ReactNode, label: string, value: string, detail: string }) {
  return (
    <Card className="bg-card/30 border-border/40">
      <CardContent className="p-6">
        <div className="mb-4 text-primary bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tight mb-1">{value}</p>
        <p className="text-[10px] font-mono text-muted-foreground uppercase">{detail}</p>
      </CardContent>
    </Card>
  )
}

function LatencyMetric({ label, value, maxValue }: { label: string, value: number, maxValue: number }) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-muted-foreground font-bold">{label}</span>
        <span className="text-foreground font-bold">{value}ms</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn(
            "h-full rounded-full transition-colors",
            percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-yellow-500" : "bg-primary"
          )}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border/40 rounded-3xl bg-card/20">
      <div className="mb-6 rounded-full bg-green-500/10 p-6">
        <ShieldCheck className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold">Analysis Clean</h3>
      <p className="text-muted-foreground max-w-md mt-2 text-sm leading-relaxed">
        Gemini performed an exhaustive multi-pass audit and found no critical vulnerabilities or logical flaws. Your code follows established engineering patterns.
      </p>
    </div>
  );
}

function FileCard({ file, insight }: { file: any, insight?: any }) {
  const [showPatch, setShowPatch] = useState(false)
  
  const getRiskBadge = () => {
    if (insight?.decision === 'prioritized') {
      if (insight.reason.toLowerCase().includes('security')) return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-bold">SECURITY RISK</Badge>;
      if (insight.reason.toLowerCase().includes('logic')) return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">HIGH RISK</Badge>;
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-bold">CORE LOGIC</Badge>;
    }
    if (insight?.decision === 'skipped') return <Badge variant="outline" className="text-muted-foreground border-white/10 text-[9px] font-bold">SKIPPED</Badge>;
    return null;
  }

  return (
    <Card className={cn(
      "border-border/40 overflow-hidden bg-card/30 transition-all hover:border-primary/20",
      showPatch && "border-primary/40 shadow-xl shadow-primary/5"
    )}>
      <CardHeader className="p-4 cursor-pointer hover:bg-white/[0.01]" onClick={() => setShowPatch(!showPatch)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded bg-muted/50 flex items-center justify-center">
              <FileCode className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="text-sm font-mono truncate">{file.filename}</CardTitle>
                {getRiskBadge()}
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
                <span className="text-green-500">+{file.additions} insertions</span>
                <span className="text-red-500">-{file.deletions} deletions</span>
                {insight && <span className="opacity-60">{insight.reason}</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
            {showPatch ? "Hide Diffs" : "View Diffs"}
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {showPatch && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-border/20">
            {file.patch ? (
              <CodeBlock code={file.patch} className="rounded-none border-0" />
            ) : (
              <div className="p-12 text-center text-xs text-muted-foreground font-mono italic">
                No diff content available for this file.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

function IssueCard({ issue, isExpanded, onToggle }: { issue: ReviewFinding, isExpanded: boolean, onToggle: () => void }) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 border-border/40 bg-card/40",
      isExpanded ? "border-primary/40 shadow-2xl shadow-primary/5 ring-1 ring-primary/20" : "hover:border-primary/20"
    )}>
      <CardHeader className="cursor-pointer select-none p-5 md:p-6" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={issue.severity as any} className="capitalize text-[10px] font-black px-2 py-0.5 tracking-widest">
                {issue.severity}
              </Badge>
              <CardTitle className="text-xl font-bold tracking-tight leading-tight">{issue.title}</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold font-mono text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> {issue.file}:{issue.line}</div>
              <div className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Confidence: {issue.confidence}</div>
            </div>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground transition-all",
            isExpanded && "bg-primary/10 text-primary rotate-180"
          )}>
            <ChevronDown className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <CardContent className="space-y-8 border-t border-border/20 p-6 md:p-8 bg-black/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <Info className="h-3.5 w-3.5 text-primary" /> Why this was flagged
                  </div>
                  <p className="text-foreground leading-relaxed text-sm font-medium">{issue.description}</p>
                  <p className="text-muted-foreground text-xs italic border-l-2 border-primary/30 pl-4 py-1">
                    {issue.technicalReasoning}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    <Zap className="h-3.5 w-3.5" /> Production Impact
                  </div>
                  <p className="text-foreground/90 leading-relaxed text-sm bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                    {issue.impact}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Terminal className="h-3.5 w-3.5" /> Code Evidence
                </div>
                <CodeBlock code={issue.codeSnippet} filename={issue.file} line={issue.line} />
              </div>

              <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/20 p-2 rounded-lg"><AlertTriangle className="h-5 w-5 text-primary" /></div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary">Senior Fix Recommendation</h4>
                </div>
                <p className="text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap opacity-90">{issue.recommendation}</p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
