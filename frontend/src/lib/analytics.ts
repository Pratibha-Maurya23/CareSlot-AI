/**
 * MediFlow AI — Privacy-Preserving Analytics System
 * 
 * Compliant with HIPAA and GDPR/DPDP principles:
 * - Does not send Protected Health Information (PHI)
 * - Only sends telemetry if cookie consent is accepted or for essential operational performance
 */

type AnalyticsEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
};

export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const consent = localStorage.getItem("mediflow_cookie_consent");
    return consent === "all";
  } catch {
    return false;
  }
};

/**
 * Log pageview tracking
 */
export const trackPageView = (url: string) => {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId && typeof (window as unknown as { gtag?: Function }).gtag === "function") {
    (window as unknown as { gtag: Function }).gtag("config", gaId, {
      page_path: url,
    });
  }

  // Developer console logger in dev mode
  if (process.env.NODE_ENV === "development") {
    console.log(`[MediFlow Analytics] PageView: ${url}`);
  }
};

/**
 * Track custom user interactions (e.g., triage started, demo accessed)
 */
export const trackEvent = ({ action, category = "General", label, value, ...customData }: AnalyticsEvent) => {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId && typeof (window as unknown as { gtag?: Function }).gtag === "function") {
    (window as unknown as { gtag: Function }).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customData,
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[MediFlow Analytics] Event: ${action}`, { category, label, value, ...customData });
  }
};
