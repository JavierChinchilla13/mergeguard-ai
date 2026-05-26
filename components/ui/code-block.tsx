"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  line?: number
  className?: string
}

export function CodeBlock({ code, filename, line, className }: CodeBlockProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border/50 bg-[#0d1117]", className)}>
      {filename && (
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          <span className="font-mono">{filename}{line ? `:${line}` : ""}</span>
        </div>
      )}
      <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-[#e6edf3]">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
