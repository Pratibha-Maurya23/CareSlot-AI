"use client";

import { useState, useEffect } from 'react';
import {
  Users, Calendar, FileText, AlertTriangle,
  TrendingUp, TrendingDown, Eye, Download,
  Stethoscope, Clock, Plus,
  Activity, Heart, Thermometer, Pill
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  dashboardApi, patientsApi, doctorsApi, appointmentsApi,
  type DashboardSummary, type MonthlyVisit, type CaseDistribution,
  type Patient, type Doctor, type Appointment,
} from '@/lib/api';

/* ─── Fallback colours for case distribution ── */
const CASE_COLORS: Record<string, string> = {
  Normal:    '#16A34A',
  Medium:    '#F59E0B',
  Emergency: '#DC2626',
};

/* ─── Priority config ── */
const PRIORITY_CONFIG = {
  emergency: { label: 'Emergency', cls: 'bg-danger/10 text-danger border border-danger/20' },
  warning:   { label: 'High',      cls: 'bg-warning/10 text-amber-700 border border-warning/20' },
  success:   { label: 'Normal',    cls: 'bg-success/10 text-success border border-success/20' },
};

/* ─── Custom Tooltip ── */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl p-3.5 text-xs shadow-md">
      <p className="font-bold text-primary mb-0.5">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── Helper: derive priority from patient data ── */
function getPriority(p: Patient): 'emergency' | 'warning' | 'success' {
  const conds = (p.conditions || []).join(' ').toLowerCase();
  if (/cardiac|arrest|emergency|critical/.test(conds)) return 'emergency';
  if (/diabetes|hypertension|pressure/.test(conds))   return 'warning';
  return 'success';
}

/* ─── Helper: parse appointment hour/min ── */
function parseApptTime(dateTime?: string): { hour: string; min: string } {
  if (!dateTime) return { hour: '00', min: '00' };
  const d = new Date(dateTime);
  if (isNaN(d.getTime())) return { hour: '09', min: '00' };
  return {
    hour: String(d.getHours()).padStart(2, '0'),
    min:  String(d.getMinutes()).padStart(2, '0'),
  };
}

/* ─── Dashboard Component ── */
export default function Dashboard() {
  const [patientFilter, setPatientFilter] = useState('all');

  // Logged-in doctor info
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Live data
  const [summary, setSummary]         = useState<DashboardSummary | null>(null);
  const [visitData, setVisitData]     = useState<MonthlyVisit[]>([]);
  const [caseDist, setCaseDist]       = useState<CaseDistribution[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Read logged-in doctor info
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_doctor_user');
      if (stored) setDoctorUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError('');
      try {
        const params = doctorUser?.id ? { doctorId: doctorUser.id } : {};

        // Single Unified API Call for Doctor Dashboard
        const overviewRes = await dashboardApi.doctorOverview(params).catch(() => null);

        if (cancelled) return;

        if (overviewRes?.data) {
          const { stats, visitData: vData, caseDistribution: cDist, patients: pList, doctors: dList, todayAppointments: aList } = overviewRes.data;
          setSummary(stats);
          setVisitData(vData || []);
          setCaseDist((cDist || []).map(c => ({ ...c, color: c.color || CASE_COLORS[c.name] || '#6b9ab8' })));
          setPatients(pList || []);
          setDoctors(dList || []);
          setAppointments(aList || []);
        } else {
          // Fallback if needed
          const [summaryRes, visitsRes, distRes, patientsRes, doctorsRes, apptRes] = await Promise.allSettled([
            dashboardApi.summary(params),
            dashboardApi.monthlyVisits(params),
            dashboardApi.caseDistribution(params),
            patientsApi.getAll(params),
            doctorsApi.getAll(),
            appointmentsApi.getToday(params),
          ]);
          if (cancelled) return;
          if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.stats);
          if (visitsRes.status === 'fulfilled') setVisitData(visitsRes.value.data || []);
          if (distRes.status === 'fulfilled') {
            const raw = distRes.value.data || [];
            setCaseDist(raw.map(c => ({ ...c, color: c.color || CASE_COLORS[c.name] || '#6b9ab8' })));
          }
          if (patientsRes.status === 'fulfilled') setPatients((patientsRes.value as any).patients || (patientsRes.value as any).data || []);
          if (doctorsRes.status === 'fulfilled') setDoctors((doctorsRes.value as any).doctors || (doctorsRes.value as any).data || []);
          if (apptRes.status === 'fulfilled') setAppointments((apptRes.value as any).data || (apptRes.value as any).appointments || []);
        }

        // Fetch this doctor's appointments
        if (doctorUser?.id && !cancelled) {
          try {
            const myRes = await appointmentsApi.getAll({ doctorId: doctorUser.id });
            if (!cancelled) setMyAppointments(myRes.appointments || []);
          } catch { /* ignore */ }
        }
      } catch {
        if (!cancelled) setError('Unexpected error loading dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();

    // Auto-refresh every 30 seconds for realtime updates
    const interval = setInterval(fetchAll, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [doctorUser]);

  /* ─── Derived KPI cards ── */
  const kpiCards = [
    {
      label: 'Total Patients',
      value: summary ? String(summary.totalPatients) : '—',
      trend: '',
      up: true,
      icon: Users,
      iconBg: '#e0f2fe', iconColor: '#0369a1', bar: '#5FA8D3',
    },
    {
      label: 'Emergency Cases',
      value: summary ? String(summary.emergencyPatients) : '—',
      trend: '',
      up: false,
      icon: AlertTriangle,
      iconBg: '#fee2e2', iconColor: '#dc2626', bar: '#DC2626',
    },
  ];

  const filteredPatients = patientFilter === 'all'
    ? patients
    : patients.filter(p => getPriority(p) === patientFilter);

  /* ─── Loading / Error states ── */
  if (loading) {
    return (
      <div className="p-7 md:px-8 flex items-center justify-center min-h-[60vh] flex-col">
        <div className="text-center text-primary/50">
          <div className="text-3xl mb-3">⏳</div>
          <p className="font-semibold">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-7 md:px-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-danger/10 border border-danger/20 rounded-2xl p-6 md:px-8 max-w-[440px] text-center">
          <p className="font-bold text-danger mb-2">⚠ Backend unreachable</p>
          <p className="text-red-955 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 flex flex-col gap-6 max-md:p-4">

      {/* 1 ── Welcome Banner */}
      <div className="relative bg-gradient-to-br from-primary via-[#2d6a96] to-secondary rounded-3xl p-7 md:p-8 flex items-center justify-between text-white overflow-hidden shadow-md animate-fadeUp">
        <div className="absolute -right-10 -top-10 w-[200px] h-[200px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-20 -bottom-16 w-[150px] h-[150px] rounded-full bg-white/4 pointer-events-none" />
        
        <div className="relative z-1">
          <div className="text-xl font-extrabold mb-1">Welcome to MediFlow Dashboard 👋</div>
          <div className="text-sm opacity-80">Here&apos;s your clinical overview for today · {new Date().toDateString()}</div>
        </div>
        <div className="flex gap-6 relative z-1">
          {[
            { val: summary ? String(summary.todayAppointments) : '—', label: "Today's Patients" },
            { val: summary ? String(summary.emergencyPatients) : '—', label: 'Emergencies'      },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-accent">{s.val}</div>
              <div className="text-[10px] opacity-70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2 ── KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {kpiCards.map((k, i) => {
          const Icon = k.icon;
          return (
            <div 
              key={i} 
              className="relative bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 overflow-hidden animate-fadeUp" 
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: k.bar }} />
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: k.iconBg, color: k.iconColor }}>
                  <Icon size={22} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${k.up ? 'text-success bg-green-50' : 'text-danger bg-red-50'}`}>
                  {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {k.trend || 'Live'}
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-primary leading-none">{k.value}</div>
                <div className="text-xs text-primary/60 font-semibold mt-1">{k.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 ── Analytics Row */}
      {(visitData.length > 0 || caseDist.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fadeUp">
          {/* Visits trend */}
          {visitData.length > 0 && (
            <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-2">
              <div className="flex items-start justify-between p-5 border-b border-slate-100">
                <div>
                  <div className="text-base font-bold text-primary mb-1">Patient Visit Trends</div>
                  <div className="text-xs text-primary/60">Monthly outpatient visits</div>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border bg-slate-50 text-primary hover:bg-slate-100 transition-colors cursor-pointer">
                  <Download size={13} /> Export
                </button>
              </div>
              <div className="px-2 pt-4 pb-3">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={visitData}>
                    <defs>
                      <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#5FA8D3" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#5FA8D3" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false}
                      tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone" dataKey="visits" name="Visits"
                      stroke="#1B4965" strokeWidth={2.5}
                      fill="url(#visitGrad)"
                      dot={{ r: 4, fill: '#1B4965', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Case distribution */}
          {caseDist.length > 0 && (
            <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-1">
              <div className="flex items-start justify-between p-5 border-b border-slate-100">
                <div>
                  <div className="text-base font-bold text-primary mb-1">Case Distribution</div>
                  <div className="text-xs text-primary/60">By triage priority</div>
                </div>
              </div>
              <div className="py-2 pb-3">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={caseDist}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={4} dataKey="value"
                    >
                      {caseDist.map((c, i) => (
                        <Cell key={i} fill={c.color || '#6b9ab8'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={v => [`${v}%`, '']}
                      contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem' }}
                    />
                    <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4 bg-bgSoft border border-border rounded-xl mx-4 mb-4">
                {caseDist.map(c => (
                  <div key={c.name} className="text-center">
                    <div className="text-xl font-extrabold leading-none" style={{ color: c.color || '#6b9ab8' }}>{c.value}%</div>
                    <div className="text-[10px] text-primary/50 mt-1">{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3.5 ── My Patients (doctor-specific) */}
      {doctorUser && myAppointments.length > 0 && (
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md p-5 flex flex-col gap-4 transition-shadow duration-200 mb-6 animate-fadeUp">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-base font-bold text-primary mb-1">🩺 My Patients</div>
              <div className="text-xs text-primary/60">
                {myAppointments.filter(a => !['cancelled', 'Cancelled'].includes(a.status)).length} active appointments for Dr. {doctorUser.name?.replace('Dr. ', '')}
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 flex flex-col gap-2.5">
            {myAppointments
              .filter(a => !['cancelled', 'Cancelled'].includes(a.status))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((apt, i) => {
                const priority = apt.priority === 'emergency' ? 'emergency' : apt.priority === 'warning' ? 'warning' : 'success';
                const cfg = PRIORITY_CONFIG[priority];
                const apptDate = new Date(apt.date);
                const isToday = apptDate.toDateString() === new Date().toDateString();
                return (
                  <div key={apt._id || i} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                    isToday ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-border'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-8 h-8 text-[11px] ${
                        priority === 'emergency' ? 'bg-danger' : priority === 'warning' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {(apt.patientName || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">
                          {apt.patientName || 'Patient'}
                        </div>
                        <div className="text-xs text-primary/60 mt-0.5">
                          {apt.reason || 'Consultation'}
                        </div>
                        <div className="text-[11px] text-primary/50 mt-0.5 flex items-center gap-1">
                          📅 {apptDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          🕐 {apt.timeSlot || '10:00'}
                          {isToday && <span className="text-success font-bold ml-2">● TODAY</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          priority === 'emergency' ? 'bg-danger animate-pulse' : priority === 'warning' ? 'bg-warning' : 'bg-success'
                        }`} />
                        {cfg.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        apt.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            {myAppointments.filter(a => !['cancelled', 'Cancelled'].includes(a.status)).length === 0 && (
              <div className="text-center padding-6 text-primary/40 font-medium">
                No active appointments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 ── Patient History Table */}
      <div className="animate-in">

        {/* Patient History */}
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between p-5 border-b border-slate-100 flex-wrap gap-4">
            <div>
              <div className="text-base font-bold text-primary mb-1">Patient Records</div>
              <div className="text-xs text-primary/60">{patients.length} registered patients</div>
            </div>
            <div className="flex gap-2">
              {['all', 'emergency', 'warning', 'success'].map(f => (
                <button
                  key={f}
                  id={`filter-${f}`}
                  onClick={() => setPatientFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                    patientFilter === f 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-border bg-transparent text-primary/60 hover:bg-slate-50'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'emergency' ? '🔴 Emergency' : f === 'warning' ? '🟡 High' : '🟢 Normal'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-primary/50 bg-slate-50 border-b border-border">Patient</th>
                  <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-primary/50 bg-slate-50 border-b border-border">Age</th>
                  <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-primary/50 bg-slate-50 border-b border-border">Conditions</th>
                  <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-primary/50 bg-slate-50 border-b border-border">Priority</th>
                  <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-primary/50 bg-slate-50 border-b border-border">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-primary/40 py-6">
                      No patients found.
                    </td>
                  </tr>
                ) : filteredPatients.map(p => {
                  const priority = getPriority(p);
                  const cfg = PRIORITY_CONFIG[priority];
                  return (
                    <tr
                      key={p._id}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${
                        priority === 'emergency' ? '!bg-red-50/30' :
                        priority === 'warning'   ? '!bg-amber-50/30'   : ''
                      }`}
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-8 h-8 text-[11px] ${
                              priority === 'emergency' ? 'bg-danger' :
                              priority === 'warning'   ? 'bg-warning' : 'bg-secondary'
                            }`}
                          >
                            {(p.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-primary">{p.name}</div>
                            <div className="text-[10px] text-primary/50 mt-0.5">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-sm text-primary/60">{p.age ? `${p.age} yr` : '—'}</td>
                      <td className="px-3.5 py-2.5 text-xs font-semibold text-primary">
                        {(p.conditions || []).slice(0, 2).join(', ') || '—'}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            priority === 'emergency' ? 'bg-danger animate-pulse' : priority === 'warning' ? 'bg-warning' : 'bg-success'
                          }`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-bgSoft text-primary border border-border hover:bg-secondary hover:text-white hover:border-secondary transition-all cursor-pointer" id={`view-patient-${p._id}`} title="View Record">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
