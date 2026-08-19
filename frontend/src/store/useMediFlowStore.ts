import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PatientInfo {
  name: string;
  email: string;
  age: string;
  height: string;
  weight: string;
  bloodGroup: string;
  gender: string;
}

interface HealthHistory {
  age: string;
  gender: string;
  conditions: string;
  surgeries: string;
  allergies: string;
  medications: string;
}

interface FormData {
  symptoms: string;
  severity: number;
  duration: string;
  additionalNotes: string;
}

interface MediFlowState {
  role: "patient" | "doctor" | null;
  patientInfo: PatientInfo;
  healthHistory: HealthHistory;
  formData: FormData;
  sessionId: string;
  setRole: (role: "patient" | "doctor") => void;
  setPatientInfo: (info: PatientInfo) => void;
  setHealthHistory: (history: HealthHistory) => void;
  setFormData: (data: FormData) => void;
  reset: () => void;
}

const defaultHealthHistory: HealthHistory = {
  age: "",
  gender: "",
  conditions: "",
  surgeries: "",
  allergies: "",
  medications: "",
};

const defaultFormData: FormData = {
  symptoms: "",
  severity: 5,
  duration: "",
  additionalNotes: "",
};

const defaultPatientInfo: PatientInfo = {
  name: "", email: "", age: "",
  height: "", weight: "", bloodGroup: "", gender: "",
};

export const useMediFlowStore = create<MediFlowState>()(
  persist(
    (set) => ({
      role: null,
      patientInfo: defaultPatientInfo,
      healthHistory: defaultHealthHistory,
      formData: defaultFormData,
      sessionId: crypto.randomUUID(),
      setRole: (role) => set({ role }),
      setPatientInfo: (patientInfo) => set({ patientInfo }),
      setHealthHistory: (healthHistory) => set({ healthHistory }),
      setFormData: (formData) => set({ formData }),
      reset: () =>
        set({
          role: null,
          patientInfo: defaultPatientInfo,
          healthHistory: defaultHealthHistory,
          formData: defaultFormData,
          sessionId: crypto.randomUUID(),
        }),
    }),
    {
      name: "mediflow-session",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== "reset")
        ) as MediFlowState,
    }
  )
);
