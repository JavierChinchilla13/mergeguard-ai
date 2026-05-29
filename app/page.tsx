"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { PRInput } from "@/components/sections/pr-input"
import { ResultsSection } from "@/components/sections/results-section"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Bug, Database, Layers } from "lucide-react"
import { StreamingAnalysis, AnalysisLog } from "@/components/sections/streaming-analysis"
import { ReviewResponse, AnalysisMetadata } from "@/lib/gemini"
import { PRFile } from "@/lib/github"

interface PRAnalysisResponse {
  details: { owner: string; repo: string; pullNumber: number };
  cacheStatus: string;
  filesCount: number;
  files: PRFile[];
  review: ReviewResponse;
  metadata: AnalysisMetadata;
}

const ANALYSIS_STAGES = [
  "Fetching PR metadata",
  "Parsing changed files",
  "Prioritizing source files",
  "Chunking diffs",
  "Analyzing logic bugs",
  "Checking security flaws",
  "Detecting performance gaps",
  "Generating recommendations"
];

export default function LandingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prData, setPrData] = useState<PRAnalysisResponse | null>(null)
  
  // Streaming State
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>([])
  const [currentStage, setCurrentStage] = useState("")
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const analysisLock = React.useRef(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const [lastUrl, setLastUrl] = useState("")

  const addLog = (message: string, type: AnalysisLog['type'] = 'info') => {
    setAnalysisLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
  }

  const handleAnalyze = async (url: string) => {
    if (analysisLock.current || isAnalyzing) return;
    
    setLastUrl(url);
    analysisLock.current = true;
    setIsAnalyzing(true);
    setShowResults(false);
    setError(null);
    setAnalysisLogs([]);
    setProgress(0);
    setElapsedTime(0);
    setCurrentStage(ANALYSIS_STAGES[0]);

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
    }, 100);

    try {
      addLog(`[SYSTEM] Initializing MergeGuard audit engine`, 'syst');
      
      // Stage 1: Fetching
      await new Promise(r => setTimeout(r, 600));
      setCurrentStage(ANALYSIS_STAGES[1]);
      setProgress(12);
      addLog("Streaming PR metadata via GitHub REST API...", 'github');

      const response = await fetch("/api/analyze-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: PRAnalysisResponse = await response.json();
      if (!response.ok) throw new Error((data as unknown as { error?: string }).error || "GitHub API Failure");

      addLog(`SUCCESS: Parsed ${data.filesCount} changed files from remote.`, 'success');

      // Stage 2: Parsing & Prioritizing
      setCurrentStage(ANALYSIS_STAGES[2]);
      setProgress(28);
      addLog("Executing risk-aware file prioritization...", 'info');
      
      const insights = data.metadata?.insights || [];
      const prioritized = insights.filter(i => i.decision === 'prioritized');
      const skipped = insights.filter(i => i.decision === 'skipped');
      
      if (skipped.length > 0) addLog(`Filtered ${skipped.length} low-signal assets (lockfiles/generated).`, 'syst');
      prioritized.forEach(p => addLog(`PRIO: ${p.filename} (${p.reason})`, 'prio'));

      if (data.cacheStatus === 'hit') {
        addLog("CACHE HIT: Deterministic SHA-256 match. Serving persisted report.", 'cache');
      } else if (data.cacheStatus === 'invalidated') {
        addLog(`CACHE INVALID: ${data.metadata?.cacheInvalidationReason || "Diff hash changed"}.`, 'info');
        addLog("Initializing cold-start reasoning pipeline...", 'syst');
      } else {
        addLog("CACHE MISS: No previous session found. Starting full audit.", 'info');
      }

      await new Promise(r => setTimeout(r, 500));
      setCurrentStage(ANALYSIS_STAGES[3]);
      setProgress(42);
      addLog(`CHNK: Segmented diff into ${data.metadata?.chunkCount || 1} sequential batches (~${(data.metadata?.totalTokens || 0).toLocaleString()} tokens).`, 'chnk');

      // Stage 3: AI Reasoning
      setCurrentStage(ANALYSIS_STAGES[4]);
      setProgress(58);
      addLog(`Reasoning: Auditing logic via ${data.metadata?.model}...`, 'ai');
      
      if (data.review?.bugs?.length > 0) addLog(`ALERT: Detected ${data.review.bugs.length} potential logic vulnerabilities.`, 'bug');

      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[5]);
      setProgress(72);
      addLog("Reasoning: Performing deep security surface scan...", 'security');
      if (data.review?.security?.length > 0) addLog(`SECURITY: Critical alert flagged in ${data.review.security[0].file}`, 'security');

      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[6]);
      setProgress(86);
      addLog("Reasoning: Evaluating performance and scalability metrics...", 'perf');

      await new Promise(r => setTimeout(r, 600));
      setCurrentStage(ANALYSIS_STAGES[7]);
      setProgress(100);
      addLog("Audit finalized. Building structured response.", 'success');

      setPrData(data);
      
      setTimeout(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsAnalyzing(false);
        setShowResults(true);
        analysisLock.current = false;
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }, 500);

    } catch (err: unknown) {
      if (timerRef.current) clearInterval(timerRef.current);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      addLog(`[CRITICAL] ${errorMessage}`, 'error');
      setIsAnalyzing(false);
      setError(errorMessage);
      analysisLock.current = false;
      console.error("Analysis Error:", err);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        
        <div id="analyze" className="relative">
          <PRInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>

        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              key="streaming-view"
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <StreamingAnalysis 
                logs={analysisLogs} 
                currentStage={currentStage} 
                progress={progress}
                duration={elapsedTime}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="container max-w-3xl pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-destructive/10 p-2 mt-0.5">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Analysis Interrupted</h3>
                  <p className="text-sm opacity-90 mt-1">{error}</p>
                  <div className="mt-4 flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAnalyze(lastUrl)}
                      className="h-8 text-xs font-bold border-destructive/20 hover:bg-destructive hover:text-white"
                    >
                      Retry Analysis
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setError(null)}
                      className="h-8 text-xs font-bold text-muted-foreground"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {showResults && prData && (
            <motion.div
              id="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ResultsSection 
                review={prData.review} 
                files={prData.files}
                prDetails={prData.details}
                metadata={prData.metadata}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!showResults && !isAnalyzing && (
          <section className="container py-24">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard 
                title="Deep Static Analysis"
                description="Multi-pass logic audit detecting race conditions, N+1 queries, and security vulnerabilities before they reach production."
                icon={<Bug className="h-6 w-6 text-primary" />}
              />
              <FeatureCard 
                title="Content-Aware Caching"
                description="SHA-256 deterministic hashing ensures instant results for unchanged PRs while minimizing redundant AI compute."
                icon={<Database className="h-6 w-6 text-primary" />}
              />
              <FeatureCard 
                title="Intelligent Chunking"
                description="Proprietary diff segmentation pipeline optimized for large-scale enterprise PRs exceeding standard context limits."
                icon={<Layers className="h-6 w-6 text-primary" />}
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="group rounded-xl border border-border/40 bg-card/30 p-8 transition-all hover:border-primary/50 hover:bg-card/50 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
