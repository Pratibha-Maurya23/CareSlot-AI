import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, FileText, CheckCircle2, Scale, Stethoscope } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | MediFlow AI",
  description: "Read the MediFlow AI Terms of Service, clinical triage disclaimers, usage limitations, and healthcare liability conditions.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen py-16 px-6 sm:px-12 lg:px-24 bg-bgLight/30 dark:bg-primary">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary/70 dark:text-white/70 hover:text-primary dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-[#163248] rounded-3xl p-8 sm:p-12 shadow-sm border border-bgSoft dark:border-white/10 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/15 text-primary dark:text-accent border border-accent/30 mb-4">
            <Scale className="w-3.5 h-3.5 text-accent" />
            Terms of Service
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-primary dark:text-white">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-secondary dark:text-white/60 mt-2">
            Last Updated: March 2026 • Effective Date: January 1, 2026
          </p>
          <p className="text-base text-primary/80 dark:text-white/80 mt-4 leading-relaxed">
            Please read these Terms and Conditions (&ldquo;Terms&rdquo;) carefully before accessing or using the MediFlow AI platform. By accessing or using our website, AI triage interface, doctor queue dashboard, or demo environments, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Crucial Medical Disclaimer Alert */}
        <div className="bg-danger/10 border-2 border-danger/30 rounded-2xl p-6 sm:p-8 mb-8 text-danger">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display font-bold text-lg text-danger uppercase tracking-wide">
                Critical Medical Emergency Disclaimer
              </h2>
              <p className="text-sm text-primary dark:text-white/90 mt-2 leading-relaxed">
                <strong>MEDIFLOW AI IS NOT A SUBSTITUTE FOR EMERGENCY MEDICAL CARE OR PROFESSIONAL CLINICAL JUDGMENT.</strong> If you believe you are experiencing a life-threatening medical emergency (such as severe chest pain, sudden numbness, anaphylaxis, severe breathing difficulty, or uncontrolled bleeding), immediately call your local emergency dispatch service (<strong>911 in North America, 112 in the EU/India</strong>) or proceed directly to the nearest hospital emergency room.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                1. Nature of the AI Triage Service
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80 mb-3">
              MediFlow AI provides clinical decision support tools and patient triage queue prioritization. The AI outputs, triage risk scores (Emergency, High, Normal), and suggested specialist departments are:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-primary/75 dark:text-white/75 ml-2">
              <li>Designed to assist licensed healthcare providers in organizing patient queues.</li>
              <li>Informational recommendations derived from algorithmic processing of user-submitted symptoms.</li>
              <li>Not definitive medical diagnoses or formal clinical prescriptions. Final clinical decisions remain the sole responsibility of the attending physician.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                2. User Obligations &amp; Accurate Reporting
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80 mb-3">
              When utilizing the triage and booking modules, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-primary/75 dark:text-white/75 ml-2">
              <li>All information submitted regarding symptoms, duration, age, and existing health conditions is accurate and truthful to the best of your knowledge.</li>
              <li>You will not use the service to submit false, malicious, or automated bot requests that interfere with hospital queue operations.</li>
              <li>You are at least 18 years of age or possess legal parental/guardian consent to use healthcare digital services.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                3. Intellectual Property Rights
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80">
              The MediFlow AI platform, including its proprietary triage classification algorithms, user interface, brand assets, SOAP documentation pipelines, and visual designs, is the exclusive intellectual property of MediFlow AI. No rights or licenses are granted except the limited, non-exclusive right to use the platform as intended.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                4. Limitation of Liability
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80">
              To the maximum extent permitted by applicable law, MediFlow AI and its affiliates, directors, and employees shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the delay of care, reliance on AI priority estimates, or technical service interruptions. Users agree that healthcare decisions must be validated by qualified human medical professionals.
            </p>
          </div>

          {/* Section 5 - Changes & Inquiries */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <h2 className="font-display font-bold text-xl text-primary dark:text-white mb-3">
              5. Modifications and Contact
            </h2>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80">
              We reserve the right to revise these Terms at any time. Updates will be indicated by the &ldquo;Last Updated&rdquo; date above. For questions regarding these Terms, contact our legal counsel team at <a href="mailto:legal@mediflow.ai" className="text-accent underline font-medium">legal@mediflow.ai</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
