"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mediflow_admin_token");
    if (!token) {
      router.replace("/demo/admin/auth");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgLight">
        <div className="text-primary font-medium">Verifying access...</div>
      </div>
    );
  }

  // Determine active tab based on pathname
  let activeTab = "dashboard";
  if (pathname.includes("doctors")) {
    activeTab = "doctors";
  } else if (pathname.includes("beds")) {
    activeTab = "beds";
  } else if (pathname.includes("appointments")) {
    activeTab = "appointments";
  }

  return (
    <div className="bg-bgLight min-h-screen">
      <AdminSidebar activePage={activeTab} onNavigate={(page) => router.push(`/demo/admin/${page}`)} />
      <main className="ml-[260px] max-md:ml-0">
        {children}
      </main>
    </div>
  );
}
