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
  Target,
  Gauge,
  Copy,
  Download,
  Share2,
  Terminal,
  Eye,
  Info,
  ShieldCheck,
  ZapOff,
  AlertCircle,
  Fingerprint,
  HardDrive,
  Wifi,
  Workflow
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { ReviewResponse, ReviewFinding, AnalysisMetadata } from "@/lib/gemini"
import { PRFile } from "@/lib/github"
import { cn } from "@/lib/utils"
import { formatGitHubComment } from "@/lib/github-format"

interface ResultsSectionProps {
  review: ReviewResponse
  files?: PRFile[]
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
  const [copied, setCopied] = useState(false)

  const handlePostReview = async () => {
    if (!prDetails || isPosting || postUrl || !metadata) return;
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
          review: review,
          metadata: metadata
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
    if (!review || !metadata) return "";
    return formatGitHubComment(review, metadata);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getMarkdownPreview());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleDownload = () => {
    const content = getMarkdownPreview();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mergeguard-review-pr-${prDetails?.pullNumber}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const content = getMarkdownPreview();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MergeGuard Core Review - PR #${prDetails?.pullNumber}`,
          text: content,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      copyToClipboard();
    }
  };

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
            <h2 className="text-4xl font-extrabold tracking-tight">Structured Analysis Report</h2>
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed font-medium">{review?.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {prDetails && !postUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2 text-xs font-bold px-4 border-primary/20 hover:bg-primary/10 transition-all shadow-lg shadow-primary/5"
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
            sub={metadata?.cacheStatus === 'hit' ? "Deterministic" : metadata?.cacheStatus === 'invalidated' ? "Hash Changed" : "Cold Start"} 
            highlight={metadata?.cacheStatus === 'hit'} 
          />
          <QuickStat icon={<Layers />} label="Segments" value={metadata?.chunkCount.toString() || "0"} sub="Sequential" />
          <QuickStat icon={<Cpu />} label="Tokens" value={`~${metadata?.totalTokens.toLocaleString()}`} sub="Projected" />
          <QuickStat icon={<ZapOff />} label="Filtered" value={metadata?.filesSkipped.toString() || "0"} sub="Non-source" />
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
                  <Badge variant="outline" className="ml-2 font-mono text-[10px] text-zinc-500">
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
              <ObservabilityStat icon={<Fingerprint />} label="Session Fingerprint" value={metadata.sessionId} detail={metadata.fingerprint.slice(0, 12) + "..."} />
              <ObservabilityStat icon={<Layers />} label="Analysis Segments" value={metadata.chunkCount.toString()} detail="Diff Segmentation" />
              <ObservabilityStat icon={<Activity />} label="Total Tokens" value={metadata.totalTokens.toLocaleString()} detail="Input Projection" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-card/30 border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <StatusItem label="GitHub REST API" active={true} icon={<Wifi />} />
                    <StatusItem label="Gemini Reasoning Core" active={true} icon={<Cpu />} />
                    <StatusItem label="Deterministic Cache" active={true} icon={<Database />} />
                    <StatusItem label="Diff Segmentation" active={metadata.chunkCount > 0} icon={<Workflow />} />
                  </CardContent>
                </Card>

                <Card className="bg-card/30 border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Latency Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <LatencyMetric label="GitHub Fetch" value={metadata.latencies.github} maxValue={3000} />
                    <LatencyMetric label="Segmentation" value={metadata.latencies.chunking} maxValue={1000} />
                    <LatencyMetric label="AI Reasoning" value={metadata.latencies.ai} maxValue={15000} />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card/30 border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Resource Strategy Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Target className="h-3 w-3 text-primary" /> Prioritization
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Files within <code className="bg-white/5 px-1 rounded">auth/</code>, <code className="bg-white/5 px-1 rounded">api/</code>, and <code className="bg-white/5 px-1 rounded">middleware/</code> were moved to the front of the queue to ensure critical logic is analyzed first.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ZapOff className="h-3 w-3 text-yellow-500" /> context Optimization
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Automatic skipping of {metadata.filesSkipped} low-signal files (lockfiles, assets, and artifacts) reduced the input context by approx. {Math.round(metadata.filesSkipped * 500).toLocaleString()} projected tokens.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Layers className="h-3 w-3 text-purple-500" /> Segmentation
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Diff content exceeding {((metadata.totalTokens / (metadata.chunkCount || 1)) * 4 / 1000).toFixed(1)}k characters was segmented into {metadata.chunkCount} sequential batches to maintain high reasoning accuracy.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-green-500" /> SHA-256 Verification
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {metadata.cacheStatus === 'hit' 
                          ? "Deterministic hash match detected. Reused previous analysis session without re-executing AI reasoning." 
                          : "New diff fingerprint detected. Analysis results have been persisted for subsequent identical commits."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/30 border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Pipeline Execution Log</CardTitle>
                    <Badge variant="outline" className="text-[9px] font-mono border-white/5 text-zinc-500">REAL-TIME</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px] overflow-y-auto space-y-2 font-mono text-[10px] scrollbar-thin pr-2">
                      {metadata.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-colors">
                          <span className="text-zinc-700 select-none tabular-nums mt-0.5">{(i+1).toString().padStart(2, '0')}</span>
                          <Badge variant="outline" className={cn(
                            "h-5 px-1.5 text-[8px] font-bold uppercase shrink-0",
                            insight.decision === 'prioritized' ? "text-purple-400 border-purple-400/30 bg-purple-400/5" : 
                            insight.decision === 'skipped' ? "text-zinc-600 border-white/5" :
                            "text-blue-400 border-blue-400/30 bg-blue-400/5"
                          )}>
                            {insight.decision}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-zinc-300 font-bold">{insight.filename}</span>
                              {insight.chunkIndex !== undefined && (
                                <span className="text-[9px] text-zinc-500 font-mono">CH-{insight.chunkIndex + 1}</span>
                              )}
                            </div>
                            <div className="text-zinc-500 italic mt-0.5">{insight.reason}</div>
                          </div>
                          <span className="text-zinc-600 text-[9px] shrink-0 font-mono">~{insight.tokenCount?.toLocaleString()} tkn</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-border/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl ring-1 ring-white/5"
            >
              <div className="p-6 border-b border-border/40 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">GitHub Comment Preview</h3>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black uppercase tracking-widest">Ready to Post</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium font-mono">STAGED REVIEW FOR PR #{prDetails?.pullNumber}</p>
                </div>
                <Button variant="ghost" size="icon" className="hover:bg-white/5 rounded-full" onClick={() => setShowPreview(false)}>
                  <ZapOff className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-0 bg-[#0d1117]">
                <div className="p-8 font-sans text-sm leading-relaxed text-[#c9d1d9] prose prose-invert prose-zinc max-w-none">
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-8 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-300">
                    {getMarkdownPreview()}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    className={cn(
                      "gap-2 font-bold transition-all",
                      copied && "border-green-500 text-green-500"
                    )}
                    onClick={copyToClipboard}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Markdown"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 font-bold text-zinc-400 border-white/5 hover:border-white/20"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                    Download .md
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 font-bold text-zinc-400 border-white/5 hover:border-white/20"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" className="font-bold text-zinc-400" onClick={() => setShowPreview(false)}>Cancel</Button>
                  <Button 
                    className="gap-2 font-bold px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    onClick={handlePostReview}
                    disabled={isPosting}
                  >
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post to GitHub
                  </Button>
                </div>
              </div>
              {postError && (
                <div className="px-6 pb-6 flex items-center gap-2 text-destructive text-[10px] font-black uppercase tracking-wider">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Execution Failed: {postError}
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
      "p-3 rounded-xl border transition-all duration-300",
      highlight ? "bg-primary/5 border-primary/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "bg-card/50 border-border/40 hover:border-zinc-700"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("text-zinc-500", highlight && "text-primary opacity-100")}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: "h-3 w-3" })}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <p className={cn("text-sm font-black tracking-tight", highlight ? "text-primary" : "text-white")}>{value}</p>
      <p className="text-[9px] text-zinc-600 font-bold font-mono mt-0.5 uppercase tracking-tighter">{sub}</p>
    </div>
  )
}

function ObservabilityStat({ icon, label, value, detail }: { icon: React.ReactNode, label: string, value: string, detail: string }) {
  return (
    <Card className="bg-card/30 border-border/40 group hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <div className="mb-4 text-primary bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tight mb-1">{value}</p>
        <p className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-tighter truncate">{detail}</p>
      </CardContent>
    </Card>
  )
}

function StatusItem({ label, active, icon }: { label: string, active: boolean, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded bg-zinc-800 text-zinc-400", active && "text-primary bg-primary/10")}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: "h-3.5 w-3.5" })}
        </div>
        <span className="text-[11px] font-bold text-zinc-300">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-green-500 animate-pulse" : "bg-zinc-600")} />
        <span className={cn("text-[9px] font-black uppercase tracking-widest", active ? "text-green-500" : "text-zinc-600")}>
          {active ? "Connected" : "Disabled"}
        </span>
      </div>
    </div>
  )
}

function LatencyMetric({ label, value, maxValue }: { label: string, value: number, maxValue: number }) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-zinc-500">{label}</span>
        <span className={cn(
          "font-mono",
          percentage > 80 ? "text-red-500" : percentage > 50 ? "text-yellow-500" : "text-primary"
        )}>{value}ms</span>
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
      <p className="text-zinc-500 max-w-md mt-2 text-sm leading-relaxed font-medium">
        Gemini performed an exhaustive multi-pass audit and found no critical vulnerabilities or logical flaws. 
        Your code follows established engineering patterns.
      </p>
    </div>
  );
}

function FileCard({ file, insight }: { file: any, insight?: any }) {
  const [showPatch, setShowPatch] = useState(false)
  
  const getRiskBadge = () => {
    if (insight?.decision === 'prioritized') {
      if (insight.reason.toLowerCase().includes('security')) return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black tracking-widest">SECURITY RISK</Badge>;
      if (insight.reason.toLowerCase().includes('logic')) return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-black tracking-widest">HIGH RISK</Badge>;
      if (file.additions > 1000) return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[9px] font-black tracking-widest">LARGE DIFF</Badge>;
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black tracking-widest">CORE LOGIC</Badge>;
    }
    if (insight?.decision === 'skipped') return <Badge variant="outline" className="text-zinc-600 border-white/5 text-[9px] font-black tracking-widest">SKIPPED</Badge>;
    return null;
  }

  return (
    <Card className={cn(
      "border-border/40 overflow-hidden bg-card/30 transition-all hover:border-primary/20",
      showPatch && "border-primary/40 shadow-2xl shadow-primary/5"
    )}>
      <CardHeader className="p-4 cursor-pointer hover:bg-white/[0.01]" onClick={() => setShowPatch(!showPatch)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-white/5">
              <FileCode className="h-5 w-5 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="text-sm font-mono truncate font-bold text-zinc-200">{file.filename}</CardTitle>
                {getRiskBadge()}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black font-mono uppercase tracking-wider text-zinc-500">
                <div className="flex items-center gap-1"><span className="text-green-500">+{file.additions}</span> <span className="text-red-500">-{file.deletions}</span></div>
                {insight?.category && <div className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {insight.category}</div>}
                {insight?.tokenCount && <div className="flex items-center gap-1"><Cpu className="h-3 w-3" /> ~{insight.tokenCount.toLocaleString()} tkn</div>}
                {insight?.chunkIndex !== undefined && <div className="flex items-center gap-1"><Layers className="h-3 w-3" /> Batch {insight.chunkIndex + 1}</div>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {insight?.decision === 'prioritized' && (
              <div className="hidden lg:flex flex-col items-end text-right px-4 border-l border-white/5">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Reasoning</span>
                <span className="text-[11px] font-bold text-zinc-400 italic">{insight.reason}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" className="h-8 gap-2 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5">
              {showPatch ? "Collapse Diff" : "Inspect Code"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <AnimatePresence>
        {showPatch && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-border/20">
            <div className="bg-zinc-950 p-2 border-b border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-mono text-zinc-600 px-2 uppercase font-bold tracking-widest">Git Patch Preview</span>
               <Badge variant="outline" className="text-[9px] font-mono border-white/5 text-zinc-600">UNIFIED DIFF</Badge>
            </div>
            {file.patch ? (
              <CodeBlock code={file.patch} className="rounded-none border-0" />
            ) : (
              <div className="p-12 text-center text-xs text-zinc-600 font-mono italic">
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
  const getConfidenceColor = (conf: string) => {
    switch (conf?.toLowerCase()) {
      case 'high': return 'text-green-500 border-green-500/20 bg-green-500/5';
      case 'medium': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      default: return 'text-zinc-500 border-white/5 bg-white/5';
    }
  }

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
              <CardTitle className="text-xl font-bold tracking-tight leading-tight text-zinc-200">{issue.title}</CardTitle>
              <Badge variant="outline" className={cn("text-[9px] font-black tracking-[0.2em] uppercase h-5", getConfidenceColor(issue.confidence))}>
                {issue.confidence} Confidence
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold font-mono text-zinc-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5" /> {issue.file}:{issue.line}</div>
            </div>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-500 transition-all border border-white/5",
            isExpanded && "bg-primary/10 text-primary rotate-180 border-primary/20"
          )}>
            <ChevronDown className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <CardContent className="space-y-8 border-t border-border/20 p-6 md:p-8 bg-black/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <Info className="h-3.5 w-3.5 text-primary" /> Technical Audit
                  </div>
                  <p className="text-zinc-200 leading-relaxed text-sm font-medium">{issue.description}</p>
                  <p className="text-zinc-500 text-xs italic border-l-2 border-primary/30 pl-4 py-1">
                    {issue.technicalReasoning}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    <Zap className="h-3.5 w-3.5" /> Production Impact
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-sm bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                    {issue.impact}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <Terminal className="h-3.5 w-3.5" /> Code Evidence
                </div>
                <CodeBlock code={issue.codeSnippet} filename={issue.file} line={issue.line} />
              </div>

              <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/20 p-2 rounded-lg"><AlertTriangle className="h-5 w-5 text-primary" /></div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary">Senior Lead Recommendation</h4>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap opacity-90">{issue.recommendation}</p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
