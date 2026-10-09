"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, HeartPulse, Bot, Calendar, History, LogOut, Activity, User, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type PatientTab =
  | "overview"
  | "profile"
  | "appointments"
  | "my-doctors"
  | "health-history"
  | "chat"
  | "health-summary"
  | "analytics"
  | "recommendations";

interface NavItem {
  id: PatientTab | "chat" | "appointments" | "health-history";
  label: string;
  icon: React.ReactNode;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18} />, route: "/demo/patient/dashboard" },
  { id: "chat", label: "AI Assistant", icon: <Bot size={18} />, route: "/demo/patient/ai-assistant" },
  { id: "appointments", label: "Appointments", icon: <Calendar size={18} />, route: "/demo/patient/appointments" },
  { id: "my-doctors", label: "My Care Team", icon: <HeartPulse size={18} />, route: "/demo/patient/my-doctors" },
  { id: "health-history", label: "Health History", icon: <History size={18} />, route: "/demo/patient/history" },
  { id: "profile", label: "My Profile", icon: <User size={18} />, route: "/demo/patient/profile" },
];

interface PatientSidebarProps {
  activeTab?: PatientTab;
  onTabChange?: (tab: PatientTab) => void;
  patientName: string;
  riskLabel: string;
  riskColor: string;
}

export function PatientSidebar({ activeTab, onTabChange, patientName, riskLabel, riskColor }: PatientSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    try {
      localStorage.removeItem("mediflow_token");
      localStorage.removeItem("mediflow_user");
      localStorage.removeItem("mediflow_appointments");
      localStorage.removeItem("mediflow_recommended_doctors");
    } catch { }
    router.push("/demo/patient/auth");
  };

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white border-r border-bgSoft flex flex-col md:h-screen sticky top-0 z-20 shadow-sm">

      {/* MediFlow AI Brand Logo */}
      <div className="px-6 py-5 border-b border-bgSoft">
        <Link href="/demo/patient/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#1B4965] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Activity size={18} color="white" />
          </div>
          <div>
            <h1 className="font-bold text-[#0F172A] text-[16px] leading-tight flex items-center gap-1">
              MediFlow <span className="text-accent font-extrabold">AI</span>
            </h1>
            <p className="text-[#64748B] text-[11px] font-medium">Patient Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links — Active State Indicator (Requirement 2) */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Patient portal navigation">
        {NAV_ITEMS.map((item) => {
          // Accurate active determination based on Next.js pathname
          const isRouteActive = Boolean(
            pathname === item.route ||
            (item.route !== "/demo/patient/dashboard" && pathname.startsWith(item.route))
          );
          const isTabActive = activeTab === item.id;
          const isActive = isRouteActive || isTabActive;

          return (
            <Link
              key={item.id}
              href={item.route}
              onClick={() => {
                if (onTabChange) onTabChange(item.id as PatientTab);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left group relative",
                isActive
                  ? "bg-[#1B4965] text-white shadow-md border-l-4 border-accent pl-3.5"
                  : "text-slate-600 hover:bg-slate-100/90 hover:text-[#1B4965]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "transition-colors duration-200 shrink-0",
                  isActive ? "text-accent" : "text-slate-400 group-hover:text-[#1B4965]"
                )}
              >
                {item.icon}
              </span>

              <span className="flex-1 truncate">{item.label}</span>

              {/* Glowing active indicator dot on the active page */}
              {isActive && (
                <span
                  className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#62B6CB] shrink-0 animate-pulse"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User Profile + Logout */}
      <div className="px-4 py-4 border-t border-bgSoft bg-slate-50/50">
        {/* User profile card */}
        <Link
          href="/demo/patient/profile"
          className={cn(
            "flex items-center gap-3 transition-all rounded-xl px-3 py-2.5 mb-2.5 border group",
            pathname === "/demo/patient/profile"
              ? "bg-[#1B4965]/10 border-accent/60 shadow-sm"
              : "bg-white hover:bg-slate-100 border-bgSoft"
          )}
          title="Click to view & edit profile"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0 uppercase group-hover:scale-105 transition-transform shadow-sm">
            {(patientName || "P").charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#0F172A] text-xs truncate group-hover:text-primary transition-colors">
              {patientName || "Patient"}
            </p>
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block mt-0.5",
                riskColor || "bg-emerald-100 text-emerald-700 border-emerald-200"
              )}
            >
              {riskLabel || "Active"}
            </span>
          </div>
          <ChevronRight size={14} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
        </Link>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200 border border-transparent hover:border-rose-100"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
