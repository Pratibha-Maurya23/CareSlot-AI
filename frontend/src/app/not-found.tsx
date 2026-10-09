import React from "react";
import Link from "next/link";
import { AlertCircle, Home, Play, ArrowLeft, Stethoscope, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16 bg-gradient-to-b from-bgLight/40 via-white to-bgSoft/30 dark:from-primary dark:via-[#163248] dark:to-[#0f2d42]">
      <div className="max-w-xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-warning/15 text-warning border border-warning/30 mb-6">
          <AlertCircle className="w-4 h-4 text-warning" />
          Code 404 • Resource Not Located
        </div>

        {/* 404 Graphic / Text */}
        <div className="relative my-4 select-none">
          <span className="text-8xl sm:text-9xl font-display font-extrabold text-primary/10 dark:text-white/10 tracking-widest block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-[#1a3d58] shadow-xl border border-bgSoft dark:border-white/10 flex items-center justify-center text-accent">
              <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 text-accent animate-pulse" />
            </div>
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-primary dark:text-white mt-4">
          Triage Alert: Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-primary/75 dark:text-white/70 mt-3 leading-relaxed max-w-md mx-auto">
          The clinical route or resource you are attempting to reach doesn't exist, has been reassigned, or is currently unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2
              bg-primary text-white hover:bg-secondary
              dark:bg-accent dark:text-primary dark:hover:bg-accent/80"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition-all border border-primary/20 dark:border-white/20 flex items-center justify-center gap-2
              bg-white text-primary hover:bg-bgLight/40
              dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Play className="w-4 h-4 text-accent" />
            Try Live Demo
          </Link>
        </div>

        {/* Help footer */}
        <div className="mt-10 pt-6 border-t border-bgSoft dark:border-white/10 flex items-center justify-center gap-4 text-xs text-primary/60 dark:text-white/50">
          <span>Need clinical technical assistance?</span>
          <a
            href="mailto:support@mediflow.ai"
            className="inline-flex items-center gap-1 text-accent font-medium hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            support@mediflow.ai
          </a>
        </div>
      </div>
    </main>
  );
}
