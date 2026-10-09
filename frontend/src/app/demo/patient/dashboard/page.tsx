"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays, Droplet, Ruler, Weight, Calendar,
  Clock, Stethoscope, ArrowRight, ShieldCheck, Heart, PlusCircle,
  Activity, Sparkles, Bot, FileText, PhoneCall, CheckCircle2,
  ChevronRight, AlertTriangle, UserCheck, Pill, ShieldAlert
} from "lucide-react";
import { PatientSidebar } from "@/components/patient/PatientSidebar";
import { dashboardApi, type Appointment, type Doctor } from "@/lib/api";
import { HealthAnalyticsSection } from "@/components/patient/HealthAnalyticsSection";

interface UserProfile {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  phone?: string;
  address?: string;
  conditions?: string[];
  medications?: string;
  allergies?: string;
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingAppts, setLoadingAppts] = useState(true);

  // ─── Single Unified API Call for Patient Dashboard ──────────────────────────
  const fetchDashboardData = async () => {
    setLoadingAppts(true);
    try {
      let patientId: string | undefined = undefined;
      try {
        const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
        patientId = u.id || u._id;
      } catch {}

      // Calls ONLY ONE single unified API endpoint: GET /api/dashboard/patient
      const res = await dashboardApi.patientOverview(patientId ? { patientId } : undefined);
      if (res?.data) {
        const { user: profile, upcomingAppointments: appts, recommendedDoctors: docs, stats } = res.data;
        setUser(profile as any);
        setUpcomingAppointments(appts || []);
        if (docs && docs.length > 0) {
          setRecommendedDoctors(docs.slice(0, 3));
        }
        setDashboardStats(stats);
        if (typeof window !== "undefined") {
          localStorage.setItem("mediflow_user", JSON.stringify(profile));
        }
      }
    } catch {
      // Offline / cached session fallback
      try {
        const cached = localStorage.getItem("mediflow_user");
        if (cached) setUser(JSON.parse(cached));
        const localAppts = localStorage.getItem("mediflow_appointments");
        if (localAppts) {
          const list = JSON.parse(localAppts);
          setUpcomingAppointments(list.filter((a: any) => {
            const st = (a.status || "").toLowerCase();
            return st !== "cancelled" && st !== "completed";
          }));
        }
      } catch {}
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("mediflow_token") : null;
    if (!token) {
      router.replace("/demo/patient/auth");
      return;
    }

    // Load cached profile immediately for instant UI render
    try {
      const cached = localStorage.getItem("mediflow_user");
      if (cached) setUser(JSON.parse(cached));
    } catch {}

    // Fetch everything via the unified dashboard API
    fetchDashboardData();

    const handleApptUpdate = () => fetchDashboardData();
    window.addEventListener("appointmentUpdated", handleApptUpdate);
    return () => {
      window.removeEventListener("appointmentUpdated", handleApptUpdate);
    };
  }, [router]);

  if (!user) return null;

  // Calculate live BMI
  let bmi = "22.4";
  let bmiLabel = "Normal BMI";
  let bmiColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (user.height && user.weight) {
    const h = parseFloat(user.height) / 100;
    const w = parseFloat(user.weight);
    if (h > 0 && w > 0) {
      const calculated = (w / (h * h)).toFixed(1);
      bmi = calculated;
      const val = parseFloat(calculated);
      if (val < 18.5) {
        bmiLabel = "Underweight";
        bmiColor = "text-amber-700 bg-amber-50 border-amber-200";
      } else if (val < 24.9) {
        bmiLabel = "Normal BMI";
        bmiColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      } else if (val < 29.9) {
        bmiLabel = "Overweight";
        bmiColor = "text-orange-700 bg-orange-50 border-orange-200";
      } else {
        bmiLabel = "Obese";
        bmiColor = "text-rose-700 bg-rose-50 border-rose-200";
      }
    }
  }

  const genderDisplay =
    user.gender === "M" || user.gender === "Male"
      ? "Male"
      : user.gender === "F" || user.gender === "Female"
      ? "Female"
      : user.gender || "Unspecified";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] overflow-hidden">
      <PatientSidebar
        activeTab="overview"
        onTabChange={() => {}}
        patientName={user.name || "Patient"}
        riskLabel="Active"
        riskColor="bg-emerald-100 text-emerald-700 border-emerald-200"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar / Header */}
        <header className="px-6 md:px-10 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shrink-0 flex justify-between items-center z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Patient Portal</p>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 hidden sm:inline-block">
              📅 {new Date().toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </span>
            <button
              onClick={() => router.push("/demo/patient/ai-assistant")}
              className="px-4 py-2 bg-gradient-to-r from-[#1B4965] to-[#2B6CB0] hover:from-[#13354a] hover:to-[#22578e] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Bot size={15} /> AI Assistant
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ── HERO WELCOME BANNER ────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B4965] via-[#23587A] to-[#2B6CB0] p-6 md:p-8 text-white shadow-lg">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-200">
                    <Sparkles size={14} className="text-cyan-300" /> AI-Powered Clinical Monitoring Active
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Welcome back, {user.name?.split(" ")[0] || "Patient"}! 👋
                  </h2>
                  <p className="text-sm text-cyan-100/90 max-w-xl leading-relaxed">
                    Your health records and clinical care team are synchronized. Check your upcoming consultations or consult the clinical triage assistant anytime.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 shrink-0">
                  <button
                    onClick={() => router.push("/demo/patient/appointments")}
                    className="px-5 py-2.5 bg-white text-[#1B4965] hover:bg-cyan-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <Calendar size={15} /> Book Consultation
                  </button>
                  <button
                    onClick={() => router.push("/demo/patient/ai-assistant")}
                    className="px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition-all backdrop-blur-md flex items-center gap-2"
                  >
                    <Bot size={15} /> Launch AI Triage
                  </button>
                </div>
              </div>
            </div>

            {/* ── 4 VITALS & HEALTH SUMMARY METRIC CARDS ─────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Blood Group */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <Droplet size={22} className="fill-rose-500/20 text-rose-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{user.bloodGroup || "O+"}</h3>
                  <span className="text-[11px] font-semibold text-slate-500">Universal Compatible</span>
                </div>
              </div>

              {/* Age & Gender */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Age & Gender</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{user.age || "28"} yrs</h3>
                  <span className="text-[11px] font-semibold text-slate-500">{genderDisplay}</span>
                </div>
              </div>

              {/* Height & Weight with BMI */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Ruler size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Height / Weight</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {user.height || "175"} <span className="text-xs font-medium text-slate-400">cm</span> • {user.weight || "70"} <span className="text-xs font-medium text-slate-400">kg</span>
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${bmiColor}`}>
                    BMI {bmi} • {bmiLabel}
                  </span>
                </div>
              </div>

              {/* Overall Health Status */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#1B4965] flex items-center justify-center shrink-0 border border-cyan-100">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Status</p>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Stable</h3>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Low Health Risk
                  </span>
                </div>
              </div>

            </div>

            {/* ── 2-COLUMN MAIN CONTENT GRID ────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ── LEFT COLUMN (8 cols): Appointments + Medical History + Analytics ── */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. UPCOMING APPOINTMENTS CARD */}
                <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
                        <p className="text-xs text-slate-500">Your scheduled doctor visits and clinical consultations</p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/demo/patient/appointments")}
                      className="text-xs font-bold text-[#1B4965] hover:text-[#13354a] hover:underline flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/70 transition-all"
                    >
                      View All <ArrowRight size={14} />
                    </button>
                  </div>

                  {loadingAppts ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <div className="w-7 h-7 border-2 border-slate-300 border-t-[#1B4965] rounded-full animate-spin" />
                      <p className="text-xs font-medium text-slate-500">Retrieving scheduled consultations...</p>
                    </div>
                  ) : upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAppointments.map((appt, idx) => {
                        const docName =
                          appt.doctorName ||
                          (appt.doctor && typeof appt.doctor === "object" ? appt.doctor.name : appt.doctor) ||
                          "Specialist Physician";
                        const specialization =
                          appt.specialization ||
                          (appt.doctor && typeof appt.doctor === "object" ? appt.doctor.specialization : "") ||
                          "General Medicine";
                        const dateStr = appt.date
                          ? new Date(appt.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : appt.dateTime || "Upcoming Schedule";
                        const timeSlot = appt.timeSlot || "10:00 AM";

                        return (
                          <div
                            key={appt._id || idx}
                            className="p-5 rounded-2xl border border-blue-100/80 bg-gradient-to-r from-blue-50/40 via-white to-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#1B4965] to-[#2B6CB0] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
                                <Stethoscope size={24} />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h4 className="font-bold text-slate-900 text-base">
                                    Dr. {docName.replace(/^Dr\.\s*/i, "")}
                                  </h4>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {appt.status || "Confirmed"}
                                  </span>
                                  {appt.priority && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                      {appt.priority}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium">{specialization}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-700 pt-0.5 flex-wrap">
                                  <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
                                    <CalendarDays size={14} className="text-blue-600" /> {dateStr}
                                  </span>
                                  <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
                                    <Clock size={14} className="text-blue-600" /> {timeSlot}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => router.push("/demo/patient/appointments")}
                              className="px-4 py-2.5 bg-[#1B4965] hover:bg-[#13354a] text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 w-full sm:w-auto text-center"
                            >
                              Manage Details
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* EMPTY STATE: NO UPCOMING APPOINTMENTS */
                    <div className="py-10 px-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 mx-auto flex items-center justify-center shadow-sm border border-slate-100">
                        <Calendar size={28} className="text-slate-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">No upcoming appointments</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          You do not have any scheduled consultations at the moment. Need clinical guidance? You can book with a certified doctor or start with our AI triage assistant.
                        </p>
                      </div>
                      <div className="pt-2 flex justify-center gap-3">
                        <button
                          onClick={() => router.push("/demo/patient/appointments")}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4965] hover:bg-[#13354a] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <PlusCircle size={15} /> Book an Appointment
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. MEDICAL HISTORY & VITALS CARD */}
                <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/90 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Heart size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Medical History & Clinical Baseline</h3>
                        <p className="text-xs text-slate-500">Documented chronic conditions, daily medications, and allergies</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/demo/patient/history")}
                      className="text-xs font-bold text-[#1B4965] hover:text-[#13354a] hover:underline flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/70 transition-all"
                    >
                      Full Records <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Chronic Conditions */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chronic Conditions</span>
                        <Activity size={14} className="text-rose-500" />
                      </div>
                      <div className="flex flex-wrap gap-1.5 min-h-[42px] items-center">
                        {user.conditions && user.conditions.length > 0 ? (
                          user.conditions.map((c) => (
                            <span
                              key={c}
                              className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">None recorded</span>
                        )}
                      </div>
                    </div>

                    {/* Current Medications */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Medications</span>
                        <Pill size={14} className="text-blue-500" />
                      </div>
                      <div className="min-h-[42px] flex items-center">
                        <p className="text-xs font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/80 w-full line-clamp-2">
                          {user.medications || "No active prescriptions"}
                        </p>
                      </div>
                    </div>

                    {/* Known Allergies */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Known Allergies</span>
                        <ShieldAlert size={14} className="text-amber-500" />
                      </div>
                      <div className="min-h-[42px] flex items-center">
                        <p className="text-xs font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-200/80 w-full line-clamp-2">
                          {user.allergies || "No documented allergies"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. HEALTH ANALYTICS & TRENDS */}
                <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/90 shadow-sm">
                  <HealthAnalyticsSection />
                </div>

              </div>

              {/* ── RIGHT COLUMN (4 cols): Quick Health Tools & Recommended Doctors ── */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* QUICK HEALTH TOOLS / SHORTCUTS */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-[#1B4965]" /> Quick Health Actions
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    
                    {/* Action: AI Symptom Checker */}
                    <div
                      onClick={() => router.push("/demo/patient/ai-assistant")}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 hover:from-blue-100 hover:to-indigo-100 border border-blue-100 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <Bot size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            AI Symptom Checker
                          </h4>
                          <p className="text-[11px] text-slate-500">Instant triage & risk evaluation</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* Action: Book Specialist */}
                    <div
                      onClick={() => router.push("/demo/patient/appointments")}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 hover:from-emerald-100 hover:to-teal-100 border border-emerald-100 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Book a Specialist
                          </h4>
                          <p className="text-[11px] text-slate-500">Cardiology, Neurology & more</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* Action: Health Records */}
                    <div
                      onClick={() => router.push("/demo/patient/history")}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/70 to-pink-50/70 hover:from-purple-100 hover:to-pink-100 border border-purple-100 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                            Health Assessments
                          </h4>
                          <p className="text-[11px] text-slate-500">Past AI sessions & lab history</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* Action: Emergency Helpline */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                          <PhoneCall size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-rose-900">24/7 Clinical Hotline</h4>
                          <p className="text-[11px] text-rose-700/80">Emergency care line: 108 / 911</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-200/80 text-rose-800 rounded-md">
                        SOS
                      </span>
                    </div>

                  </div>
                </div>

                {/* MY CARE TEAM / AVAILABLE DOCTORS */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck size={16} className="text-emerald-600" /> Available Doctors
                    </h3>
                    <button
                      onClick={() => router.push("/demo/patient/my-doctors")}
                      className="text-xs font-bold text-[#1B4965] hover:underline"
                    >
                      Browse
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recommendedDoctors.length > 0 ? (
                      recommendedDoctors.map((doc) => (
                        <div
                          key={doc._id}
                          className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {doc.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">Dr. {doc.name.replace(/^Dr\.\s*/i, "")}</p>
                              <p className="text-[11px] text-slate-500 truncate">{doc.specialization}</p>
                              <p className="text-[10px] font-semibold text-emerald-600">⭐ {doc.rating || "4.9"} rating</p>
                            </div>
                          </div>

                          <button
                            onClick={() => router.push("/demo/patient/appointments")}
                            className="px-3 py-1.5 bg-white hover:bg-[#1B4965] text-[#1B4965] hover:text-white border border-slate-200 hover:border-[#1B4965] rounded-xl text-xs font-bold transition-all shrink-0 shadow-2xs"
                          >
                            Book
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 space-y-1">
                        <Stethoscope size={24} className="mx-auto text-slate-300" />
                        <p className="text-xs font-medium">All specialist doctors are active.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CLINICAL HEALTH TIP CARD */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                    <Sparkles size={14} /> Daily Wellness Recommendation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Maintain optimal hydration and a balanced sleep schedule. If you experience seasonal allergy or fever symptoms, complete a quick AI triage checkup.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>CareSlot AI Clinical Advisory</span>
                    <span className="text-emerald-400 font-semibold">● Verified Protocol</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
