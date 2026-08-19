"use client";

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Award, Clock, Star, CalendarDays, Activity } from 'lucide-react';
import { dashboardApi } from '@/lib/api';

export default function DoctorProfile() {
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalPatients: 0, appointments: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_doctor_user');
      if (stored) {
        const u = JSON.parse(stored);
        setDoctorUser(u);
        
        // Fetch real stats
        dashboardApi.summary({ doctorId: u.id })
          .then(res => {
            const backendStats = res.data?.stats || {};
            setStats({
              totalPatients: backendStats.totalPatients || 0,
              appointments: backendStats.todayAppointments || 0
            });
          })
          .catch(() => {});
      }
    } catch { /* ignore */ }
  }, []);

  if (!doctorUser) {
    return (
      <div className="p-7 md:px-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-primary/50 font-medium">Loading profile...</p>
      </div>
    );
  }

  const initials = (doctorUser.name || '?').split(' ').filter((_: any, i: number) => i < 2).map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="p-7 flex flex-col gap-6 max-md:p-4">
      {/* Cover Profile Area */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="h-40 bg-gradient-to-r from-primary via-[#2d6a96] to-secondary relative">
          {/* Decorative shapes */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-24 -bottom-20 w-36 h-36 rounded-full bg-white/4 pointer-events-none" />
        </div>
        
        <div className="px-8 pb-8 relative -mt-16">
          <div className="flex items-end justify-between flex-wrap gap-6">
            
            <div className="flex items-end gap-6">
              <div className="w-[120px] h-[120px] rounded-full bg-white p-1.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-accent text-white flex items-center justify-center text-4xl font-extrabold">
                  {initials}
                </div>
              </div>
              <div className="pb-2.5">
                <h1 className="text-2xl font-black text-primary m-0">
                  {doctorUser.name}
                </h1>
                <p className="text-sm font-semibold text-primary/80 mt-1">
                  {doctorUser.specialization || 'General Doctor'}
                </p>
                <div className="flex gap-4 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-primary/50">
                    <Mail size={14} /> {doctorUser.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-primary/50">
                    <Phone size={14} /> +91 98765 43210
                  </span>
                </div>
              </div>
            </div>

            <button className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer bg-primary text-white hover:bg-primary-hover shadow-sm self-end mb-2.5">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Left Column: Stats & Highlights */}
        <div className="flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-border shadow-sm grid grid-cols-3 gap-4 text-center p-6">
            <div>
              <div className="text-3xl font-extrabold text-primary">{stats.totalPatients}</div>
              <div className="text-[10px] text-primary/45 font-bold uppercase tracking-wider mt-1">Total Patients</div>
            </div>
            <div className="border-x border-border">
              <div className="text-3xl font-extrabold text-success">{stats.appointments}</div>
              <div className="text-[10px] text-primary/45 font-bold uppercase tracking-wider mt-1">Today's Appts</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-warning flex items-center justify-center gap-1">
                4.9 <Star size={18} fill="#F59E0B" color="#F59E0B" />
              </div>
              <div className="text-[10px] text-primary/45 font-bold uppercase tracking-wider mt-1">Patient Rating</div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="text-base font-bold text-primary">Professional Details</div>
            </div>
            <div className="p-6 pt-5">
              <ul className="list-none p-0 m-0 flex flex-col gap-4">
                <li className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Experience</div>
                    <div className="text-xs text-primary/50 mt-0.5">12+ Years in {doctorUser.specialization || 'Healthcare'}</div>
                  </div>
                </li>
                <li className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Medical Registration No.</div>
                    <div className="text-xs text-primary/50 mt-0.5">MCI-{Math.floor(Math.random() * 90000) + 10000}</div>
                  </div>
                </li>
                <li className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Consultation Chamber</div>
                    <div className="text-xs text-primary/50 mt-0.5">Room 402, Block B, MediFlow General Hospital</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Preferences */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="text-base font-bold text-primary">Weekly Schedule</div>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-border bg-slate-50 text-primary hover:bg-slate-100 cursor-pointer">Modify</button>
            </div>
            <div className="p-6 pt-5">
              <div className="flex flex-col gap-3">
                {[
                  { day: 'Monday - Friday', time: '09:00 AM - 05:00 PM', active: true },
                  { day: 'Saturday', time: '09:00 AM - 01:00 PM', active: true },
                  { day: 'Sunday', time: 'Off Duty', active: false },
                ].map((s, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    s.active ? 'bg-slate-50/50 border-border' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CalendarDays size={18} className={s.active ? 'text-primary' : 'text-slate-400'} />
                      <span className={`text-xs font-semibold ${s.active ? 'text-primary' : 'text-slate-400'}`}>
                        {s.day}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${s.active ? 'text-success' : 'text-slate-400'}`}>
                      {s.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-border shadow-sm">
             <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="text-base font-bold text-primary">Consultation Details</div>
            </div>
            <div className="p-6 pt-5">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-xs text-primary/55 mb-1">Standard Consultation Fee</div>
                  <div className="text-lg font-bold text-primary">₹ 800.00</div>
                </div>
                <div className="h-[1px] bg-border" />
                <div>
                  <div className="text-xs text-primary/55 mb-1">Avg. Consultation Time</div>
                  <div className="text-base font-bold text-primary flex items-center gap-1.5">
                    <Clock size={16} /> 15 Minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
