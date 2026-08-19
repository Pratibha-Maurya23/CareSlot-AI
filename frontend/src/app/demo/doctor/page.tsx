"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/demo/doctor/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgLight">
      <div className="text-primary font-medium">Redirecting to dashboard...</div>
    </div>
  );
}
