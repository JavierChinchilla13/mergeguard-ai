"use client"

import React from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">MergeGuard</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How it Works
          </Link>
          <Link href="https://github.com/JavierChinchilla13/mergeguard-ai/blob/main/CHANGES.md" target="_blank" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Changelog
          </Link>
        </nav>
        <div className="flex items-center gap-4">
        </div>
      </div>
    </header>
  )
}
