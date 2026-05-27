"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface PRInputProps {
  onAnalyze: (url: string) => void
  isLoading: boolean
}

export function PRInput({ onAnalyze, isLoading }: PRInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const validateUrl = (value: string) => {
    const githubPrRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+/
    if (!value) {
      setError("Please enter a GitHub Pull Request URL")
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
                className="h-14 pl-10 pr-32 text-base md:text-lg"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) validateUrl(e.target.value)
                }}
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-10 px-6 font-semibold transition-all hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing
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
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Try our <span className="text-primary cursor-pointer hover:underline">demo repository</span> to see it in action.
      </p>
    </div>
  )
}
