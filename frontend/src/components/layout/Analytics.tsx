"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, hasAnalyticsConsent } from "../../lib/analytics";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Track page views on route changes
  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    trackPageView(url);
  }, [pathname, searchParams]);

  // If no Google Analytics ID is configured, render nothing
  if (!gaId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  );
}
