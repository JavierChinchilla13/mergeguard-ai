"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { PRInput } from "@/components/sections/pr-input"
import { ResultsSection } from "@/components/sections/results-section"
import { MOCK_REVIEW_RESULTS } from "@/lib/mock-data"
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

    // Start Timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
    }, 100);

    try {
      addLog(`Initializing analysis for ${url}`, 'info');
      
      // Stage 1: Fetching
      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[1]);
      setProgress(15);
      addLog("Fetching Pull Request metadata from GitHub API...", 'info');

      const response = await fetch("/api/analyze-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to analyze Pull Request");

      // Stage 2: Parsing & Prioritizing
      setCurrentStage(ANALYSIS_STAGES[2]);
      setProgress(30);
      addLog(`Found ${data.filesCount} changed files. Prioritizing source code...`, 'info');
      if (data.metadata?.cacheStatus === 'hit') {
        addLog("Valid cache found! Reusing previous analysis results.", 'cache');
      }

      await new Promise(r => setTimeout(r, 600));
      setCurrentStage(ANALYSIS_STAGES[3]);
      setProgress(45);
      addLog(`Chunking diffs into ${data.metadata?.chunkCount || 1} segments for AI processing...`, 'info');

      // Stage 3: AI Reasoning (Simulated progression based on actual data)
      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[4]);
      setProgress(60);
      addLog("Gemini is analyzing logical patterns and edge cases...", 'bug');
      if (data.review?.bugs?.length > 0) addLog(`Detected ${data.review.bugs.length} potential bugs.`, 'bug');

      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[5]);
      setProgress(75);
      addLog("Scanning for security vulnerabilities (XSS, SQLi, Secrets)...", 'security');
      if (data.review?.security?.length > 0) addLog(`Found ${data.review.security.length} security alerts.`, 'security');

      await new Promise(r => setTimeout(r, 800));
      setCurrentStage(ANALYSIS_STAGES[6]);
      setProgress(90);
      addLog("Evaluating performance bottlenecks and memory leaks...", 'perf');

      await new Promise(r => setTimeout(r, 600));
      setCurrentStage(ANALYSIS_STAGES[7]);
      setProgress(100);
      addLog("Finalizing structured recommendations...", 'success');

      setPrData(data);
      
      // Wrap up
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

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
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
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4" />
                <p className="font-semibold">Analysis Failed</p>
              </div>
              <p className="text-sm opacity-90">{error}</p>
              {error.includes("quota exceeded") && (
                <p className="mt-2 text-xs opacity-70">
                  The free tier of Gemini has a strict rate limit. Please wait about 30-60 seconds and try again.
                </p>
              )}
            </div>
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
