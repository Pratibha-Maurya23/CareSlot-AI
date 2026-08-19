"use client";

import AppointmentList from "@/components/appointments/AppointmentList";

export default function Page() {
  return (
    <div className="p-7 flex flex-col gap-6 max-md:p-4">
      <AppointmentList />
    </div>
  );
}
