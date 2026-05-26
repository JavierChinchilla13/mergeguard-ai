"use client"

import React, { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { PRInput } from "@/components/sections/pr-input"
import { ResultsSection } from "@/components/sections/results-section"
import { MOCK_REVIEW_RESULTS } from "@/lib/mock-data"
import { motion, AnimatePresence } from "framer-motion"

export default function LandingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prData, setPrData] = useState<any>(null)

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setShowResults(false)
    setError(null)

    try {
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
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (err: any) {
      setIsAnalyzing(false)
      setError(err.message)
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
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm opacity-90">{error}</p>
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
