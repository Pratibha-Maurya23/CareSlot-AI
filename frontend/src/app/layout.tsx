import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "../components/layout/ThemeProvider";
import { Navbar } from "../components/layout/Navbar";
import { CookieConsent } from "../components/ui/CookieConsent";
import { Analytics } from "../components/layout/Analytics";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B4965" },
    { media: "(prefers-color-scheme: dark)", color: "#0f2d42" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mediflow-ai.vercel.app"
  ),
  title: {
    default: "MediFlow AI | Intelligent Healthcare Triage Platform",
    template: "%s | MediFlow AI",
  },
  description:
    "AI-powered medical triage and patient management system. Rapid symptom assessment, automated emergency prioritization, and real-time clinical workflows.",
  keywords: [
    "healthcare AI",
    "medical triage",
    "patient management",
    "emergency room triage",
    "clinical decision support",
    "doctor queue",
    "hospital workflow",
    "AI symptom checker",
  ],
  authors: [{ name: "MediFlow Health Technologies" }],
  creator: "MediFlow AI",
  publisher: "MediFlow Health Technologies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mediflow-ai.vercel.app",
    siteName: "MediFlow AI",
    title: "MediFlow AI | Intelligent Healthcare Triage Platform",
    description:
      "Real-time medical triage reducing emergency wait times by 70%, prioritizing acute care, and empowering clinicians.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MediFlow AI — Intelligent Clinical Triage Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediFlow AI | Intelligent Healthcare Triage",
    description:
      "Rapid symptom assessment, automated emergency prioritization, and real-time clinical workflows.",
    images: ["/og-image.png"],
    creator: "@MediFlowAI",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${sora.variable}`}
    >
      <body className="min-h-screen font-sans antialiased bg-bgLight dark:bg-primary text-primary dark:text-white transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          {children}
          <CookieConsent />
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
