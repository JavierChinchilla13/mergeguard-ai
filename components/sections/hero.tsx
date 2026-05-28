"use client"

import React from "react"
import { motion } from "framer-motion"
import { Terminal } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden py-16 md:py-24">
      {/* Background Gradients */}
      <div className="absolute top-0 -z-10 h-full w-full">
        <div className="absolute top-[-5%] left-[-5%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container flex flex-col items-center text-center"
      >
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Terminal className="h-3 w-3" />
          <span>Automated Infrastructure Audit</span>
        </div>

        <h1 className="mb-4 text-4xl font-black tracking-tighter md:text-6xl text-foreground italic">
          MergeGuard <span className="text-primary/80">CORE</span>
        </h1>
        
        <p className="max-w-[600px] text-sm md:text-base text-zinc-400 leading-relaxed font-bold font-mono uppercase tracking-tighter">
          Structured AI code review & <br className="hidden md:block" /> Large-diff segmentation pipeline
        </p>
      </motion.div>
    </section>
  )
}
