"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden py-24 md:py-32">
      {/* Background Gradients */}
      <div className="absolute top-0 -z-10 h-full w-full">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
        >
          <Star className="h-4 w-4 fill-current" />
          <span>New: AI-powered performance analysis</span>
        </motion.div>

        <h1 className="gradient-text mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
          Automated Code Intelligence <br /> for Every Pull Request
        </h1>
        
        <p className="mb-10 max-w-[700px] text-lg text-muted-foreground md:text-xl">
          An open AI-powered engine that analyzes GitHub PRs for security, performance, and structural integrity. 
          Built by developers, for developers. Completely free.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="h-12 px-8 text-base">
            Analyze a Pull Request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base">
            Documentation
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-16 flex items-center gap-8 opacity-50 grayscale transition-all hover:grayscale-0"
        >
          <img src="/vercel.svg" alt="Vercel" className="h-6 invert" />
          <img src="/next.svg" alt="Next.js" className="h-6 invert" />
          <div className="flex items-center gap-2 font-bold italic">
            <span className="text-xl">GITHUB</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
