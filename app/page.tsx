"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { PRInput } from "@/components/sections/pr-input"
import { ResultsSection } from "@/components/sections/results-section"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { StreamingAnalysis, AnalysisLog } from "@/components/sections/streaming-analysis"

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
  const [prData, setPrData] = useState<any>(null)
  
  // Streaming State
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>([])
  const [currentStage, setCurrentStage] = useState("")
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const analysisLock = React.useRef(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const addLog = (message: string, type: AnalysisLog['type'] = 'info') => {
    setAnalysisLogs(prev => [...prev, { message, type, timestamp: Date.now() }]);
  }

  const handleAnalyze = async (url: string) => {
    if (analysisLock.current || isAnalyzing) return;

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
      addLog(`[START] Initializing MergeGuard pipeline for ${url}`, 'info');
      
      // Stage 1: Fetching
      await new Promise(r => setTimeout(r, 600));
      setCurrentStage(ANALYSIS_STAGES[1]);
      setProgress(12);
      addLog("[FETCH] Requesting Pull Request metadata...", 'github');

      const response = await fetch("/api/analyze-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "GitHub API Failure");

      addLog(`[FETCH] Retrieved ${data.filesCount} changed files from GitHub.`, 'success');

      // Stage 2: Parsing & Prioritizing
      setCurrentStage(ANALYSIS_STAGES[2]);
      setProgress(28);
      addLog("[FILTER] Running high-precision file prioritization...", 'info');
      
      const prioritizedCount = data.metadata?.insights?.filter((i: any) => i.decision === 'prioritized').length || 0;
      const skippedCount = data.metadata?.insights?.filter((i: any) => i.decision === 'skipped').length || 0;
      
      if (skippedCount > 0) addLog(`[FILTER] Auto-skipped ${skippedCount} low-signal files (lockfiles/assets).`, 'info');
      if (prioritizedCount > 0) addLog(`[FILTER] Prioritized ${prioritizedCount} high-risk logic files for deep analysis.`, 'info');

      if (data.cacheStatus === 'HIT') {
        addLog("[CACHE HIT] SHA-256 content match. Reusing previous analysis results.", 'cache');
      } else if (data.cacheStatus === 'INVALIDATED') {
        addLog("[CACHE INVALIDATED] PR content has changed. Re-running AI pipeline.", 'info');
      } else {
        addLog("[CACHE MISS] No existing analysis found for this PR state.", 'info');
      }

      await new Promise(r => setTimeout(r, 500));
      setCurrentStage(ANALYSIS_STAGES[3]);
      setProgress(42);
      addLog(`[CHUNK] Segmented diff into ${data.metadata?.chunkCount || 1} optimized AI batches (~${(data.metadata?.totalTokens || 0).toLocaleString()} tokens).`, 'info');

      // Stage 3: AI Reasoning
      setCurrentStage(ANALYSIS_STAGES[4]);
      setProgress(58);
      addLog(`[AI] Initializing reasoning core with ${data.metadata?.model}...`, 'ai');
      
      if (data.review?.bugs?.length > 0) addLog(`[BUG] Analysis found ${data.review.bugs.length} potential logic flaws.`, 'bug');

      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[5]);
      setProgress(72);
      addLog("[AI] Performing security vulnerability scan...", 'security');
      if (data.review?.security?.length > 0) addLog(`[SECURITY] High-impact alert in ${data.review.security[0].file}`, 'security');

      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[6]);
      setProgress(86);
      addLog("[AI] Analyzing performance and scalability bottlenecks...", 'perf');

      await new Promise(r => setTimeout(r, 600));
      setCurrentStage(ANALYSIS_STAGES[7]);
      setProgress(100);
      addLog("[SUCCESS] Review finalized. Building report...", 'success');

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

    } catch (err: any) {
      if (timerRef.current) clearInterval(timerRef.current);
      addLog(`[ERROR] ${err.message}`, 'error');
      setIsAnalyzing(false);
      setError(err.message);
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
                      onClick={() => handleAnalyze(prData?.url || "")}
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
          {showResults && (
            <motion.div
              id="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ResultsSection 
                review={prData?.review} 
                files={prData?.files}
                prDetails={prData?.details}
                metadata={prData?.metadata}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!showResults && !isAnalyzing && (
          <section className="container py-24">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard 
                title="Deep Static Analysis"
                description="Our AI engine performs multi-pass analysis to identify complex logical vulnerabilities and performance bottlenecks."
                icon="🔍"
              />
              <FeatureCard 
                title="Engineering Standards"
                description="Automatically enforce team-wide patterns and structural integrity across your entire codebase."
                icon="📐"
              />
              <FeatureCard 
                title="Open Intelligence"
                description="A transparent analysis engine built on top of state-of-the-art LLMs, fine-tuned for precise code reasoning."
                icon="🧠"
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="group rounded-2xl border border-border/40 bg-card/30 p-8 transition-all hover:border-primary/50 hover:bg-card/50 shadow-sm">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
