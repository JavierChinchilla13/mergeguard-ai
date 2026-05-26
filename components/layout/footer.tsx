import React from "react"
import Link from "next/link"
import { Shield, Globe, MessageSquare, Users } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">MergeGuard</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering developers with AI-driven pull request insights for better code quality and security.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Engine</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Architecture</Link></li>
              <li><Link href="#" className="hover:text-foreground">Security Model</Link></li>
              <li><Link href="#" className="hover:text-foreground">Supported Languages</Link></li>
              <li><Link href="#" className="hover:text-foreground">Benchmarks</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Resources</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
              <li><Link href="#" className="hover:text-foreground">CLI Reference</Link></li>
              <li><Link href="#" className="hover:text-foreground">API Docs</Link></li>
              <li><Link href="#" className="hover:text-foreground">OSS Community</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Connect</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Users className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MergeGuard AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
