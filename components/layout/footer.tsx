import React from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">MergeGuard</span>
          </Link>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Empowering developers with AI-driven pull request insights for better code quality and security.
          </p>
        </div>
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MergeGuard Core. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
