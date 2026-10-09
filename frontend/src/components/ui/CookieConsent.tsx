"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("mediflow_cookie_consent");
      if (!consent) {
        // Short delay for smooth slide-in
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("mediflow_cookie_consent", "all");
      window.dispatchEvent(new Event("mediflow_cookie_consent_updated"));
    } catch { }
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("mediflow_cookie_consent", "essential");
      window.dispatchEvent(new Event("mediflow_cookie_consent_updated"));
    } catch { }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-50 animate-slide-up"
    >
      <div className="bg-white/95 dark:bg-[#163248]/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-bgSoft dark:border-white/10 text-primary dark:text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-primary dark:text-white flex items-center gap-1.5">
                Cookie &amp; Privacy Preferences
              </h3>
              <button
                onClick={handleEssentialOnly}
                aria-label="Dismiss cookie notice"
                className="text-primary/50 dark:text-white/50 hover:text-primary dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-primary/80 dark:text-white/70 mt-1.5 leading-relaxed">
              MediFlow AI uses essential cookies to ensure safe clinical session authentication and HIPAA-aligned telemetry. We do not use third-party advertising cookies. Learn more in our{" "}
              <Link
                href="/privacy"
                className="text-accent underline font-medium hover:text-secondary transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-secondary dark:bg-accent dark:text-primary dark:hover:bg-accent/80 transition-all shadow-sm"
              >
                Accept All
              </button>
              <button
                onClick={handleEssentialOnly}
                className="px-3.5 py-2 rounded-xl text-xs font-medium border border-primary/20 dark:border-white/20 text-primary/90 dark:text-white/90 hover:bg-bgLight/40 dark:hover:bg-white/5 transition-all"
              >
                Essential Only
              </button>
              <Link
                href="/privacy"
                className="text-xs text-secondary dark:text-accent/90 hover:underline ml-auto flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                HIPAA Notice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
