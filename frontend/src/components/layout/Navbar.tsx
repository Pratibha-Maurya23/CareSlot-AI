"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, X, ArrowRight } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { label: "Home", href: "/#hero" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Triage Intelligence", href: "/#priority-intel" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Hide global navbar on standalone demo screens if desired, but allow on landing & legal pages
  if (pathname.startsWith("/demo/patient/") || pathname.startsWith("/demo/doctor/") || pathname.startsWith("/demo/admin/")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50">
      {/* Main bar */}
      <div
        className="h-16 flex items-center px-6 lg:px-12 justify-between
          bg-white/90 backdrop-blur-md border-b border-bgSoft shadow-sm
          dark:bg-primary/95 dark:border-white/10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-accent/20 dark:bg-accent/30 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <span className="font-display font-bold text-xl text-primary dark:text-white tracking-tight">
            MediFlow <span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-semibold text-primary/75 hover:text-primary dark:text-white/80 dark:hover:text-accent transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/privacy"
            className="text-sm font-semibold text-primary/75 hover:text-primary dark:text-white/80 dark:hover:text-accent transition-colors"
          >
            Compliance
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* CTA */}
          <Link
            href="/demo"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm
              bg-primary text-white hover:bg-secondary
              dark:bg-accent dark:text-primary dark:hover:bg-accent/80"
          >
            Launch Demo
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg text-primary dark:text-white hover:bg-bgLight/40 dark:hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden absolute left-0 right-0 z-40
            bg-white/95 dark:bg-[#163248]/95 backdrop-blur-md shadow-xl rounded-b-2xl
            border-b border-bgSoft dark:border-white/10 px-6 py-5 animate-slide-down"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-sm font-semibold text-primary/85 hover:text-primary
                  dark:text-white/85 dark:hover:text-accent transition-colors border-b
                  border-bgSoft/60 dark:border-white/5 last:border-0"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/privacy"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm font-semibold text-primary/85 hover:text-primary dark:text-white/85 dark:hover:text-accent transition-colors"
            >
              Privacy &amp; HIPAA
            </Link>
            <Link
              href="/terms"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm font-semibold text-primary/85 hover:text-primary dark:text-white/85 dark:hover:text-accent transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          <div className="pt-4 mt-2 border-t border-bgSoft dark:border-white/10">
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                bg-primary text-white dark:bg-accent dark:text-primary shadow-sm"
            >
              Launch Live Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
