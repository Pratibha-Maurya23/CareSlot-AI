"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, Droplet, Calendar, Ruler, Weight,
  Heart, Shield, AlertCircle, Save, CheckCircle, ArrowLeft, Activity
} from "lucide-react";
import { PatientSidebar } from "@/components/patient/PatientSidebar";
import { authApi, patientsApi } from "@/lib/api";

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
  emergencyContact?: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const GENDERS = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];

export default function PatientProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    age: "",
    gender: "",
    bloodGroup: "",
    height: "",
    weight: "",
    phone: "",
    address: "",
    conditions: [],
    medications: "",
    allergies: "",
    emergencyContact: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("mediflow_token") : null;
    if (!token) {
      router.replace("/demo/patient/auth");
      return;
    }

    try {
      const cached = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
      if (cached && cached.name) {
        setUser(cached);
        setFormData(cached);
      }
    } catch {}

    authApi.me()
      .then((res) => {
        if (res.user) {
          const merged = {
            ...(typeof window !== "undefined" ? JSON.parse(localStorage.getItem("mediflow_user") || "{}") : {}),
            ...res.user,
          };
          setUser(merged);
          setFormData(merged);
          if (typeof window !== "undefined") {
            localStorage.setItem("mediflow_user", JSON.stringify(merged));
          }
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");

    try {
      // Update local storage
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("mediflow_user", JSON.stringify(updatedUser));
      }

      // Try updating via patient API if id exists
      const patientId = updatedUser.id || updatedUser._id;
      if (patientId) {
        try {
          await patientsApi.update(patientId, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            bloodGroup: formData.bloodGroup,
            conditions: formData.conditions,
            medications: formData.medications,
            allergies: formData.allergies,
          });
        } catch {
          // If backend API fails in mock demo, local storage update is saved
        }
      }

      setSaving(false);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading profile...</div>
      </div>
    );
  }

  // Calculate BMI if height and weight exist
  let bmi = null;
  let bmiCategory = "";
  if (user.height && user.weight) {
    const h = parseFloat(user.height) / 100;
    const w = parseFloat(user.weight);
    if (h > 0 && w > 0) {
      bmi = (w / (h * h)).toFixed(1);
      const bmiVal = parseFloat(bmi);
      if (bmiVal < 18.5) bmiCategory = "Underweight";
      else if (bmiVal < 24.9) bmiCategory = "Normal weight";
      else if (bmiVal < 29.9) bmiCategory = "Overweight";
      else bmiCategory = "Obese";
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <PatientSidebar
        activeTab={"overview" as any}
        onTabChange={() => {}}
        patientName={user.name || "Patient"}
        riskLabel="Active"
        riskColor="bg-green-100 text-green-700 border-green-200"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-4 md:px-8 py-4 md:py-5 border-b border-slate-200 bg-white shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/demo/patient/dashboard")}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Patient Portal</p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Personal Profile</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
              >
                <User size={16} /> Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFormData(user);
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              {successMessage}
            </div>
          )}

          <div className="max-w-5xl mx-auto space-y-6">
            {/* Profile Overview Banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1B4965] to-[#62B6CB] text-white flex items-center justify-center font-extrabold text-3xl shadow-md shrink-0 uppercase">
                {user.name?.charAt(0) || "P"}
              </div>

              <div className="flex-1 text-center md:text-left space-y-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 self-center md:self-auto">
                    Verified Patient
                  </span>
                </div>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-600 justify-center md:justify-start">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Phone size={14} className="text-slate-400" /> {user.phone || "+1 (555) 000-0000"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin size={14} className="text-slate-400" /> {user.address || "Health City, NY"}
                  </span>
                </div>
              </div>

              {bmi && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center shrink-0 min-w-[140px]">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calculated BMI</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{bmi}</p>
                  <span className="text-xs font-semibold text-emerald-600">{bmiCategory}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Personal Information Form/Card */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User size={18} className="text-[#1B4965]" /> Personal & Contact Information
                  </h3>
                  {isEditing && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      Editing Mode
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                        required
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {user.name || "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                        required
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {user.email || "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {user.phone || "+1 (555) 000-0000"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Home Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Medical Drive, Health City, NY 10001"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {user.address || "123 Medical Drive, Health City, NY 10001"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical & Vital Statistics */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-600" /> Physical & Vital Parameters
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Blood Group
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.bloodGroup || ""}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                      >
                        <option value="">Select</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2">
                        <Droplet size={18} className="text-blue-600" />
                        <span className="text-base font-bold text-slate-900">{user.bloodGroup || "Unknown"}</span>
                      </div>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Age
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.age || ""}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                      />
                    ) : (
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-600" />
                        <span className="text-base font-bold text-slate-900">{user.age || "28"} yrs</span>
                      </div>
                    )}
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Height (cm)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.height || ""}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                      />
                    ) : (
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <Ruler size={18} className="text-emerald-600" />
                        <span className="text-base font-bold text-slate-900">{user.height || "175"} cm</span>
                      </div>
                    )}
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Weight (kg)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.weight || ""}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                      />
                    ) : (
                      <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center gap-2">
                        <Weight size={18} className="text-orange-600" />
                        <span className="text-base font-bold text-slate-900">{user.weight || "70"} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Summary */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Heart size={18} className="text-rose-600" /> Medical Baseline & Allergies
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Known Chronic Conditions (Comma-separated)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={Array.isArray(formData.conditions) ? formData.conditions.join(", ") : formData.conditions || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            conditions: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                          })
                        }
                        placeholder="e.g. Asthma, Hypertension, Diabetes"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[46px] items-center">
                        {user.conditions && user.conditions.length > 0 ? (
                          user.conditions.map((c) => (
                            <span
                              key={c}
                              className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 font-medium">None recorded</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Current Medications
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={formData.medications || ""}
                          onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                          placeholder="e.g. Metformin 500mg, Daily Vitamin D"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {user.medications || "None"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Known Allergies
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={formData.allergies || ""}
                          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                          placeholder="e.g. Penicillin, Peanuts"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {user.allergies || "None"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Edit Mode */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(user);
                      setIsEditing(false);
                    }}
                    className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#1B4965] text-white rounded-xl text-sm font-bold hover:bg-[#13354a] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
