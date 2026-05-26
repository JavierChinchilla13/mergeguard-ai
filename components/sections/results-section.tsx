"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bug, 
  ShieldAlert, 
  Zap, 
  Wind, 
  Lightbulb, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/ui/code-block"
import { ReviewIssue, Severity } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ResultsSectionProps {
  issues: ReviewIssue[]
}

const CATEGORY_MAP = {
  bug: { icon: Bug, label: "Bugs", color: "text-red-500", bg: "bg-red-500/10" },
  security: { icon: ShieldAlert, label: "Security", color: "text-orange-500", bg: "bg-orange-500/10" },
  performance: { icon: Zap, label: "Performance", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  smell: { icon: Wind, label: "Code Smells", color: "text-blue-500", bg: "bg-blue-500/10" },
  suggestion: { icon: Lightbulb, label: "Suggestions", color: "text-green-500", bg: "bg-green-500/10" },
}

export function ResultsSection({ issues }: ResultsSectionProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(issues[0]?.id || null)

  const categories = Object.entries(CATEGORY_MAP).map(([key, config]) => {
    const categoryIssues = issues.filter(i => i.category === key)
    return {
      key,
      ...config,
      count: categoryIssues.length,
      issues: categoryIssues
    }
  }).filter(c => c.count > 0)

  return (
    <section className="container py-12">
      <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review Results</h2>
          <p className="text-muted-foreground">Found {issues.length} potential improvements in your code.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Badge key={cat.key} variant="outline" className="h-8 px-3">
              <cat.icon className={cn("mr-2 h-4 w-4", cat.color)} />
              {cat.count} {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {categories.map(category => (
          <div key={category.key} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <category.icon className={cn("h-5 w-5", category.color)} />
              <h3 className="text-xl font-semibold">{category.label}</h3>
              <span className="text-sm text-muted-foreground ml-2">({category.count})</span>
            </div>
            
            <div className="grid gap-4">
              {category.issues.map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  isExpanded={expandedIssue === issue.id}
                  onToggle={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function IssueCard({ issue, isExpanded, onToggle }: { issue: ReviewIssue, isExpanded: boolean, onToggle: () => void }) {
  const Icon = CATEGORY_MAP[issue.category].icon

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
            <div className={cn("mt-1 rounded-full p-2", CATEGORY_MAP[issue.category].bg)}>
              <Icon className={cn("h-5 w-5", CATEGORY_MAP[issue.category].color)} />
            </div>
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
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <ExternalLink className="mr-1.5 h-3 w-3" />
                    View in GitHub
                  </Button>
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
