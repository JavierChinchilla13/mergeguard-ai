"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Info, Shield, Bug, Zap, CheckCircle2, ChevronRight, Clock, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface AnalysisLog {
  type: 'info' | 'security' | 'bug' | 'perf' | 'success' | 'cache';
  message: string;
  timestamp: number;
}

interface StreamingAnalysisProps {
  logs: AnalysisLog[];
  currentStage: string;
  progress: number;
  duration: number;
}

const STAGES = [
  "Fetching PR metadata",
  "Parsing changed files",
  "Prioritizing source files",
  "Chunking diffs",
  "Analyzing logic bugs",
  "Checking security flaws",
  "Detecting performance gaps",
  "Generating recommendations"
];

export function StreamingAnalysis({ logs, currentStage, progress, duration }: StreamingAnalysisProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-primary/20 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/50" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
              <div className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
            <div className="ml-2 flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
              <Terminal className="h-3.5 w-3.5" />
              AI Analysis Engine
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {duration.toFixed(1)}s
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              {progress}%
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Stages Panel */}
            <div className="border-r border-white/5 bg-white/[0.02] p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">Execution Flow</h4>
              <div className="space-y-4">
                {STAGES.map((stage, i) => {
                  const isCompleted = STAGES.indexOf(currentStage) > i;
                  const isActive = currentStage === stage;
                  
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-300",
                        isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                        isActive ? "border-primary text-primary animate-pulse" : "border-white/10 text-white/20"
                      )}>
                        {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      <span className={cn(
                        "text-xs font-medium transition-colors duration-300",
                        isActive ? "text-foreground" : 
                        isCompleted ? "text-muted-foreground" : "text-white/20"
                      )}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terminal Panel */}
            <div className="md:col-span-2 bg-black/60 p-6">
              <div 
                ref={scrollRef}
                className="h-[300px] overflow-y-auto space-y-2 font-mono text-[13px] scrollbar-none"
              >
                <AnimatePresence mode="popLayout">
                  {logs.map((log) => (
                    <motion.div
                      key={log.timestamp + log.message}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 group"
                    >
                      <span className="text-white/20 select-none">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      <span className={cn(
                        "font-bold uppercase text-[10px] mt-0.5 px-1.5 py-0.5 rounded leading-none whitespace-nowrap",
                        getLogTypeStyles(log.type)
                      )}>
                        {log.type}
                      </span>
                      <span className="text-foreground/90 break-words leading-relaxed">{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {progress < 100 && (
                  <div className="flex items-center gap-2 text-primary animate-pulse">
                    <ChevronRight className="h-4 w-4" />
                    <div className="h-1 w-2 bg-primary" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getLogTypeStyles(type: AnalysisLog['type']) {
  switch (type) {
    case 'info': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'security': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'bug': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'perf': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    case 'success': return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'cache': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    default: return 'bg-white/10 text-white/50 border border-white/20';
  }
}
