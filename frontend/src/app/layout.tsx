import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/layout/ThemeProvider";
import { Navbar } from "../components/layout/Navbar";

export const metadata: Metadata = {
  title: "MediFlow AI | Intelligent Healthcare Triage",
  description:
    "AI-powered medical triage and patient management system for faster, smarter healthcare outcomes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen font-sans antialiased bg-bgLight dark:bg-primary">
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
