"use client"

import Link from "next/link"
import { Home, Compass } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      {/* Background gradients using standard CSS animations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 bottom-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/5 to-pink-400/5 blur-3xl animate-bounce duration-10000" />
      </div>

      <div className="max-w-md w-full text-center space-y-6 px-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
            <Compass className="w-10 h-10 animate-spin [animation-duration:12s]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-4 border-background flex items-center justify-center">
              <span className="w-1 h-1 bg-white rounded-full animate-ping" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            The page you are looking for might have been moved, deleted, or doesn&apos;t exist.
          </p>
        </div>

        {/* Home Button */}
        <div className="flex justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/20"
          >
            <Home className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

