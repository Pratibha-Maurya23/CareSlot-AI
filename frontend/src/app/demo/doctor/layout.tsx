"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";
import DoctorTopbar from "@/components/doctor/DoctorTopbar";

const PAGE_META = {
  "/demo/doctor/dashboard": { title: 'Dashboard', subtitle: 'Clinical overview & analytics' },
  "/demo/doctor/appointments": { title: 'Appointments', subtitle: 'Schedule & manage appointments' },
  "/demo/doctor/profile": { title: 'My Profile', subtitle: 'Manage your professional details' },
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isAuthPage = pathname === "/demo/doctor/auth";

  useEffect(() => {
    if (isAuthPage) return;
    const token = localStorage.getItem("mediflow_doctor_token");
    if (!token) {
      router.replace("/demo/doctor/auth");
    } else {
      setIsAuthorized(true);
    }
  }, [router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight">
        <div className="text-primary font-medium">Verifying access...</div>
      </div>
    );
  }

  // Determine active tab based on pathname
  let activeTab = "dashboard";
  if (pathname.includes("appointments")) {
    activeTab = "appointments";
  } else if (pathname.includes("profile")) {
    activeTab = "profile";
  }

  const meta = PAGE_META[pathname as keyof typeof PAGE_META] || { title: 'MediFlow', subtitle: 'Healthcare System' };

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorSidebar activePage={activeTab} onNavigate={(page) => router.push(`/demo/doctor/${page}`)} />
      <div className="ml-[260px] pt-[68px] min-h-screen bg-slate-50 max-md:ml-0">
        <DoctorTopbar title={meta.title} subtitle={meta.subtitle} />
        {children}
      </div>
    </div>
  );
}
