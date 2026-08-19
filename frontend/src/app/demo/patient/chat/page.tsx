"use client";

import React from "react";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import HealthChat from "../../../../components/patient/HealthChat";

export default function PatientChatPage() {
  return (
    <>
      <DemoNavbar showBack backHref="/demo/patient/auth" title="Health Check AI" />
      <HealthChat />
    </>
  );
}
