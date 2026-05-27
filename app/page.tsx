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

export default function LandingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prData, setPrData] = useState<any>(null)
  
  // Use a ref as a mutex to prevent race conditions during state updates
  const analysisLock = React.useRef(false)

  const handleAnalyze = async (url: string) => {
    if (analysisLock.current || isAnalyzing) {
      console.warn("[FRONTEND] Analysis already in progress (Locked). Ignoring duplicate request.");
      return;
    }

    console.log(`[ANALYZE START] [${new Date().toISOString()}] URL: ${url}`);
    analysisLock.current = true;
    setIsAnalyzing(true);
    setShowResults(false);
    setError(null);

    try {
      console.log(`[FRONTEND] Sending POST request to /api/analyze-pr...`);
      const response = await fetch("/api/analyze-pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze Pull Request")
      }

      setPrData(data)
      setIsAnalyzing(false)
      setShowResults(true)
      analysisLock.current = false;
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (err: any) {
      setIsAnalyzing(false)
      setError(err.message)
      analysisLock.current = false;
      console.error("Analysis Error:", err)
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
