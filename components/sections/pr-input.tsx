"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, AlertCircle, Shield, Zap, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PRInputProps {
  onAnalyze: (url: string) => void
  isLoading: boolean
}

export function PRInput({ onAnalyze, isLoading }: PRInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const githubPrRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/
  const isValid = githubPrRegex.test(url)

  const validateUrl = (value: string) => {
    if (!value) {
      setError(null)
      return false
    }
    if (!githubPrRegex.test(value)) {
      setError("Please enter a valid GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)")
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateUrl(url)) {
      onAnalyze(url)
    }
  }

  return (
    <div className="container max-w-3xl py-12">
      <Card className="border-primary/20 bg-card/50 shadow-2xl shadow-primary/5">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="https://github.com/facebook/react/pull/123"
                className="h-14 pl-10 pr-40 text-base font-mono"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  validateUrl(e.target.value)
                }}
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button 
                  type="submit" 
                  disabled={isLoading || !isValid}
                  className={cn(
                    "h-10 px-6 font-bold transition-all",
                    isValid && !isLoading ? "bg-primary hover:scale-[1.02]" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze PR"
                  )}
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <Badge variant="outline" className="gap-1.5 font-mono text-[10px] text-muted-foreground border-white/5 py-1">
            <Shield className="h-3 w-3" /> Security Audit
          </Badge>
          <Badge variant="outline" className="gap-1.5 font-mono text-[10px] text-muted-foreground border-white/5 py-1">
            <Zap className="h-3 w-3" /> Performance Check
          </Badge>
          <Badge variant="outline" className="gap-1.5 font-mono text-[10px] text-muted-foreground border-white/5 py-1">
            <Bug className="h-3 w-3" /> Bug Detection
          </Badge>
        </div>
      </div>
    </div>
  )
}
