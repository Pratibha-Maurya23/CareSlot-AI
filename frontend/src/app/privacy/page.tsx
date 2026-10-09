import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, Eye, Database, FileCheck, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MediFlow AI",
  description: "Learn how MediFlow AI protects, encrypts, and handles your personal health information in compliance with HIPAA and data protection standards.",
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-3.5 h-3.5 text-accent" />
            Legal & Compliance
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-primary dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-secondary dark:text-white/60 mt-2">
            Last Updated: March 2026 • Effective Date: January 1, 2026
          </p>
          <p className="text-base text-primary/80 dark:text-white/80 mt-4 leading-relaxed">
            MediFlow AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to safeguarding patient privacy and confidential health data. This Privacy Policy details our practices concerning data collection, transmission, AI inference processing, and security measures in accordance with HIPAA (Health Insurance Portability and Accountability Act) and applicable global data protection regulations.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                1. Information We Collect
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80 mb-3">
              To deliver intelligent medical triage and appointment routing, MediFlow AI processes the following categories of information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-primary/75 dark:text-white/75 ml-2">
              <li><strong className="text-primary dark:text-white">Patient Clinical Data:</strong> Self-reported symptoms, pain scale ratings, duration, vitals, medical history, allergies, and current medications provided during triage.</li>
              <li><strong className="text-primary dark:text-white">Account Information:</strong> Name, verified email address, phone number, and demographic information (age, gender, blood group) required for clinic check-in.</li>
              <li><strong className="text-primary dark:text-white">Technical & Usage Data:</strong> Anonymized telemetry, IP address (hashed for rate-limiting), browser type, and timestamps to ensure service uptime and security.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                2. How We Use and Process Data
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80 mb-3">
              We collect and process health data solely for the following clinical operational purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-primary/75 dark:text-white/75 ml-2">
              <li>Executing real-time AI triage risk scoring (Emergency, High, Normal priority classification).</li>
              <li>Matching patients with appropriate medical specialists based on symptom acuity and department load.</li>
              <li>Generating structured SOAP notes for attending healthcare providers to expedite ER and outpatient care.</li>
              <li>Preventing malicious bot submissions and maintaining platform infrastructure integrity.</li>
            </ul>
            <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20 text-xs sm:text-sm text-primary dark:text-white">
              <strong>Zero Model Training on Protected Health Information (PHI):</strong> We do not sell your personal health records, nor do we use identifiable patient conversations to train public generative AI foundation models.
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <FileCheck className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                3. HIPAA Compliance & Data Security
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80 mb-3">
              Security is foundational to our healthcare architecture:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-primary/75 dark:text-white/75 ml-2">
              <li><strong className="text-primary dark:text-white">Encryption:</strong> All data in transit is protected using TLS 1.3 / HTTPS. Data at rest is encrypted using AES-256 standard encryption.</li>
              <li><strong className="text-primary dark:text-white">Access Control:</strong> Strict role-based access control (RBAC). Only authenticated and authorized medical personnel can view patient triage reports.</li>
              <li><strong className="text-primary dark:text-white">Audit Logging:</strong> Every clinical record access and triage event is immutably logged with clinician timestamps.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                4. Your Rights & Data Retention
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80 mb-3">
              Patients and healthcare organizations maintain rights over their records:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-primary/75 dark:text-white/75 ml-2">
              <li>Request an electronic export of your triage and consultation history.</li>
              <li>Request deletion of temporary demo tokens and profile data at any time.</li>
              <li>Withdraw optional analytics and cookie preferences via our Cookie Settings banner.</li>
            </ul>
          </div>

          {/* Section 5 - Contact */}
          <div className="bg-white dark:bg-[#163248] rounded-2xl p-6 sm:p-8 border border-bgSoft dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-primary dark:text-white">
                5. Contact Data Protection Officer (DPO)
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80">
              For privacy-related inquiries, HIPAA Business Associate Agreement (BAA) requests, or data deletion queries, contact our dedicated privacy team at:
            </p>
            <div className="mt-4 p-4 rounded-xl bg-bgLight/40 dark:bg-white/5 border border-bgSoft dark:border-white/10 text-sm">
              <p className="font-semibold text-primary dark:text-white">MediFlow AI Data Privacy Office</p>
              <p className="text-primary/70 dark:text-white/70 mt-1">Email: <a href="mailto:privacy@mediflow.ai" className="text-accent underline font-medium">privacy@mediflow.ai</a></p>
              <p className="text-primary/70 dark:text-white/70">Response Time: Within 24-48 business hours</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
