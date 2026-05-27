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
  ExternalLink as ExternalLinkIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { ReviewResponse, ReviewFinding } from "@/lib/gemini"
import { cn } from "@/lib/utils"

interface ResultsSectionProps {
  review: ReviewResponse
  files?: any[]
  prDetails?: { owner: string; repo: string; pullNumber: number }
}

const CATEGORY_MAP = {
  bugs: { icon: Bug, label: "Bugs", color: "text-red-500", bg: "bg-red-500/10" },
  security: { icon: ShieldAlert, label: "Security", color: "text-orange-500", bg: "bg-orange-500/10" },
  performance: { icon: Zap, label: "Performance", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  codeSmells: { icon: Wind, label: "Code Smells", color: "text-blue-500", bg: "bg-blue-500/10" },
  suggestions: { icon: Lightbulb, label: "Suggestions", color: "text-green-500", bg: "bg-green-500/10" },
}

export function ResultsSection({ review, files, prDetails }: ResultsSectionProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"issues" | "files">("issues")
  
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to post review");
      }

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
    return {
      key,
      ...config,
      count: categoryIssues.length,
      issues: categoryIssues
    }
  }).filter(c => c.count > 0)

  const totalIssues = categories.reduce((acc, cat) => acc + cat.count, 0)

  return (
    <section className="container py-12">
      <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-2">
            <Activity className="h-4 w-4" />
            <span>{prDetails?.owner}/{prDetails?.repo} • PR #{prDetails?.pullNumber}</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <h2 className="text-3xl font-bold tracking-tight">Analysis Report</h2>
            {prDetails && !postUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={handlePostReview}
                disabled={isPosting}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Posting to GitHub...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Post Review to GitHub
                  </>
                )}
              </Button>
            )}
            {postUrl && (
              <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 border border-green-500/20">
                <CheckCircle className="h-3.5 w-3.5" />
                Posted Successfully
                <Link href={postUrl} target="_blank" className="ml-1 underline flex items-center gap-0.5">
                  View <ExternalLinkIcon className="h-2.5 w-2.5" />
                </Link>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-2">{review?.summary || "Comprehensive AI audit results."}</p>
          {postError && (
            <p className="text-xs text-destructive font-medium mt-2">Error: {postError}</p>
          )}
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
          <button 
            onClick={() => setActiveTab("issues")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "issues" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            AI Review ({totalIssues})
          </button>
          <button 
            onClick={() => setActiveTab("files")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "files" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileCode className="h-4 w-4" />
            Files ({files?.length || 0})
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "issues" ? (
          <motion.div
            key="issues-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {totalIssues === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-green-500/10 p-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">No Issues Found</h3>
                <p className="text-muted-foreground max-w-md">
                  Gemini analyzed your code and found no critical bugs, security vulnerabilities, or performance bottlenecks. Great work!
                </p>
              </div>
            ) : (
              categories.map(category => (
                <div key={category.key} className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <category.icon className={cn("h-5 w-5", category.color)} />
                    <h3 className="text-xl font-semibold">{category.label}</h3>
                    <span className="text-sm text-muted-foreground ml-2">({category.count})</span>
                  </div>
                  
                  <div className="grid gap-4">
                    {category.issues.map((issue: ReviewFinding, idx: number) => {
                      const issueId = `${category.key}-${idx}`;
                      return (
                        <IssueCard 
                          key={issueId} 
                          issue={issue} 
                          isExpanded={expandedIssue === issueId}
                          onToggle={() => setExpandedIssue(expandedIssue === issueId ? null : issueId)}
                        />
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="files-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-4">
              {files?.map((file, idx) => (
                <FileCard key={idx} file={file} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function FileCard({ file }: { file: any }) {
  const [showPatch, setShowPatch] = useState(false)

  return (
    <Card className="border-border/40 overflow-hidden">
      <CardHeader className="p-4 md:p-6 cursor-pointer" onClick={() => setShowPatch(!showPatch)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <FileCode className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-mono">{file.filename}</CardTitle>
              <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                <span className="text-green-500">+{file.additions}</span>
                <span className="text-red-500">-{file.deletions}</span>
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase">
                  {file.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
            {showPatch ? "Hide Patch" : "Show Patch"}
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {showPatch && file.patch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/20"
          >
            <CodeBlock code={file.patch} className="rounded-none border-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

function IssueCard({ issue, isExpanded, onToggle }: { issue: ReviewFinding, isExpanded: boolean, onToggle: () => void }) {
  // Determine icon and color based on category/severity if needed
  // For now using category icons from parent

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 border-border/40 hover:border-primary/30",
      isExpanded && "border-primary/50 shadow-lg shadow-primary/5"
    )}>
      <CardHeader 
        className="cursor-pointer select-none p-4 md:p-6" 
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <Badge variant={issue.severity as any} className="capitalize">
                  {issue.severity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {issue.file}:{issue.line}
              </p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-transform duration-200">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="space-y-6 border-t border-border/20 p-4 pt-6 md:p-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</h4>
                <p className="text-foreground leading-relaxed">
                  {issue.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Code Snippet</h4>
                </div>
                <CodeBlock 
                  code={issue.codeSnippet} 
                  filename={issue.file} 
                  line={issue.line} 
                />
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-primary">Recommendation</h4>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {issue.recommendation}
                </p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
