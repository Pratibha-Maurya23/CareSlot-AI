"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/lib/api";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      // Determine default redirect path based on current route if not provided
      let defaultRedirect = redirectTo;
      if (!defaultRedirect) {
        if (pathname?.startsWith("/demo/doctor") || pathname?.startsWith("/doctor")) {
          defaultRedirect = "/demo/doctor/auth";
        } else if (pathname?.startsWith("/demo/admin") || pathname?.startsWith("/admin")) {
          defaultRedirect = "/demo/admin/auth";
        } else {
          defaultRedirect = "/demo/patient/auth";
        }
      }

      // Check client-side storage & cookie existence
      const hasLocalToken =
        localStorage.getItem("mediflow_token") ||
        localStorage.getItem("mediflow_doctor_token") ||
        localStorage.getItem("mediflow_admin_token");
      
      const hasCookieToken = typeof document !== "undefined" && document.cookie.includes("token=");

      if (!hasLocalToken && !hasCookieToken) {
        if (isMounted) {
          setStatus("unauthorized");
          router.replace(defaultRedirect);
        }
        return;
      }

      try {
        const response = await authApi.me();
        if (!isMounted) return;

        if (response.success && response.user) {
          const userRole = response.user.role || "patient";
          if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            setStatus("unauthorized");
            router.replace(defaultRedirect);
            return;
          }

          setStatus("authorized");
        } else {
          setStatus("unauthorized");
          router.replace(defaultRedirect);
        }
      } catch (err) {
        if (!isMounted) return;
        // Fallback: If network check fails, fallback to local storage check or redirect
        if (hasLocalToken) {
          setStatus("authorized");
        } else {
          setStatus("unauthorized");
          router.replace(defaultRedirect);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, pathname, allowedRoles, redirectTo]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Verifying authentication...</p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700 p-4">
        <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
        <h2 className="text-lg font-semibold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-1">Please sign in to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
