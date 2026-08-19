"use client";

import { useState, useEffect } from 'react';
import {
  Users, Calendar, AlertTriangle, Stethoscope, BedDouble,
  TrendingUp, TrendingDown, Eye, CheckCircle, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
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

export default function AdminDashboard({ activeTab }: { activeTab: string }) {
  const [patientFilter, setPatientFilter] = useState('all');

  // Live data
  const [summary, setSummary]         = useState<DashboardSummary | null>(null);
  const [visitData, setVisitData]     = useState<MonthlyVisit[]>([]);
  const [caseDist, setCaseDist]       = useState<CaseDistribution[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Hospital Bed Mock State
  const TOTAL_BEDS = 120;
  const [occupiedBeds, setOccupiedBeds] = useState(84);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      // Global data fetch (no doctorId)
      const [
        summaryRes,
        visitsRes,
        distRes,
        patientsRes,
        doctorsRes,
        apptRes,
      ] = await Promise.allSettled([
        dashboardApi.summary(),
        dashboardApi.monthlyVisits(),
        dashboardApi.caseDistribution(),
        patientsApi.getAll(),
        doctorsApi.getAll(),
        appointmentsApi.getToday(),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.stats);
      if (visitsRes.status   === 'fulfilled') setVisitData(visitsRes.value.data || []);
      if (distRes.status     === 'fulfilled') {
        const raw = distRes.value.data || [];
        setCaseDist(raw.map(c => ({ ...c, color: c.color || CASE_COLORS[c.name] || '#6b9ab8' })));
      }
      if (patientsRes.status === 'fulfilled') setPatients((patientsRes.value as any).patients || (patientsRes.value as any).data || []);
      if (doctorsRes.status  === 'fulfilled') setDoctors((doctorsRes.value as any).doctors || (doctorsRes.value as any).data || []);
      if (apptRes.status     === 'fulfilled') setAppointments((apptRes.value as any).data || (apptRes.value as any).appointments || []);

      const allFailed = [summaryRes, visitsRes, distRes, patientsRes, doctorsRes, apptRes]
        .every(r => r.status === 'rejected');
      if (allFailed) setError('Could not reach backend. Make sure your server is running on http://localhost:5000.');
    } catch {
      setError('Unexpected error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDoctorPresence = async (id: string, currentlyAvailable: boolean) => {
    try {
      // Optimitic UI update
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, isAvailable: !currentlyAvailable } : d));
      await doctorsApi.toggleAvailability(id);
    } catch {
      // Revert if error
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, isAvailable: currentlyAvailable } : d));
    }
  };

  const kpiCards = [
    {
      label: 'Total Patients',
      value: summary ? String(summary.totalPatients) : '—',
      icon: Users,
      bg: '#e0f2fe', color: '#0369a1', bar: '#5FA8D3',
    },
    {
      label: 'Doctors Active',
      value: doctors ? String(doctors.filter(d => d.isAvailable ?? d.available).length) : '—',
      icon: Stethoscope,
      bg: '#dcfce7', color: '#16a34a', bar: '#16A34A',
    },
    {
      label: 'Bed Occupancy',
      value: `${occupiedBeds} / ${TOTAL_BEDS}`,
      icon: BedDouble,
      bg: '#fef3c7', color: '#d97706', bar: '#F59E0B',
    },
    {
      label: 'Active Emergencies',
      value: summary ? String(summary.emergencyPatients) : '—',
      icon: AlertTriangle,
      bg: '#fee2e2', color: '#dc2626', bar: '#DC2626',
    },
  ];

  const filteredPatients = patientFilter === 'all'
    ? patients
    : patients.filter(p => getPriority(p) === patientFilter);

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
          <p className="text-red-950 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 flex flex-col gap-6 max-md:p-4">
      {activeTab === 'dashboard' && (
        <>
          {/* Welcome Banner */}
          <div className="relative bg-gradient-to-br from-primary via-[#2d6a96] to-secondary rounded-3xl p-7 md:p-8 flex items-center justify-between text-white overflow-hidden shadow-md animate-fadeUp">
            <div className="absolute -right-10 -top-10 w-[200px] h-[200px] rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute right-20 -bottom-16 w-[150px] h-[150px] rounded-full bg-white/4 pointer-events-none" />
            
            <div className="relative z-1">
              <div className="text-xl font-extrabold mb-1">Welcome to MediFlow Admin Portal 🔑</div>
              <div className="text-sm opacity-80">Hospital operations, staffing & master schedule dashboard</div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: k.bg, color: k.color }}>
                      <Icon size={22} />
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

          {(visitData.length > 0 || caseDist.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeUp">
              {visitData.length > 0 && (
                <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between p-5 border-b border-slate-100">
                    <div>
                      <div className="text-base font-bold text-primary mb-1">Hospital Visit Trends</div>
                      <div className="text-xs text-primary/60">Monthly outpatient visits</div>
                    </div>
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
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b9ab8', fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="visits" name="Visits" stroke="#1B4965" strokeWidth={2.5} fill="url(#visitGrad)" dot={{ r: 4, fill: '#1B4965', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {caseDist.length > 0 && (
                <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between p-5 border-b border-slate-100">
                    <div>
                      <div className="text-base font-bold text-primary mb-1">Global Case Distribution</div>
                      <div className="text-xs text-primary/60">By triage priority</div>
                    </div>
                  </div>
                  <div className="py-2 pb-3">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={caseDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                          {caseDist.map((c, i) => <Cell key={i} fill={c.color || '#6b9ab8'} />)}
                        </Pie>
                        <Tooltip formatter={v => [`${v}%`, '']} contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8rem' }} />
                        <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'doctors' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeUp col-span-full">
          <div className="flex items-start justify-between p-5 border-b border-slate-100">
            <div>
              <div className="text-base font-bold text-primary mb-1">Doctor Attendance & Availability</div>
              <div className="text-xs text-primary/60">Manage which doctors are on duty today</div>
            </div>
          </div>
          <div className="flex flex-col">
            {doctors.length === 0 ? (
              <div className="text-center p-6 text-primary/45 font-medium">No doctors found.</div>
            ) : doctors.map((d, i) => {
              const isAvailable = d.isAvailable ?? d.available;
              return (
                <div key={d._id || i} className={`flex items-center gap-3.5 p-3.5 border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${isAvailable ? 'border-l-4 border-l-success' : 'border-l-4 border-l-danger'}`}>
                  <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-10 h-10 text-sm bg-secondary">
                    {(d.name || '?').split(' ').filter((_,j) => j < 2).map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-primary">{d.name}</div>
                    <div className="text-xs text-primary/50">{d.specialization}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => handleToggleDoctorPresence(d._id, isAvailable)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                        isAvailable ? 'bg-red-50 text-danger border-red-200' : 'bg-green-50 text-success border-green-200'
                      }`}
                    >
                      {isAvailable ? 'Mark Absent' : 'Mark Present'}
                    </button>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      isAvailable ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isAvailable ? '● On Duty' : '○ Absent'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'beds' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeUp">
          <div className="flex items-start justify-between p-5 border-b border-slate-100">
            <div><div className="text-base font-bold text-primary mb-1">Hospital Bed Management</div><div className="text-xs text-primary/60">Current occupancy status</div></div>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              <div className="text-center p-5 bg-slate-50 border border-border rounded-xl flex-1">
                <h3 className="text-3xl font-extrabold text-slate-800 m-0">{TOTAL_BEDS}</h3>
                <p className="text-sm text-slate-500 m-0 mt-1">Total Beds</p>
              </div>
              <div className="text-center p-5 bg-red-50/50 border border-red-100 rounded-xl flex-1">
                <h3 className="text-3xl font-extrabold text-danger m-0">{occupiedBeds}</h3>
                <p className="text-sm text-danger/80 m-0 mt-1">Occupied</p>
              </div>
              <div className="text-center p-5 bg-green-50/50 border border-green-100 rounded-xl flex-1">
                <h3 className="text-3xl font-extrabold text-success m-0">{TOTAL_BEDS - occupiedBeds}</h3>
                <p className="text-sm text-success/80 m-0 mt-1">Available</p>
              </div>
            </div>
            <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: `${(occupiedBeds/TOTAL_BEDS)*100}%` }} className="h-full bg-danger transition-all duration-500" />
              <div style={{ width: `${((TOTAL_BEDS-occupiedBeds)/TOTAL_BEDS)*100}%` }} className="h-full bg-success transition-all duration-500" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeUp">
          <div className="flex items-start justify-between p-5 border-b border-slate-100">
            <div><div className="text-base font-bold text-primary mb-1">Master Appointment Schedule</div><div className="text-xs text-primary/60">All hospital appointments for today</div></div>
          </div>
          <div className="flex flex-col gap-2.5 p-5 pt-4">
            {appointments.length === 0 ? (
              <div className="text-center p-6 text-primary/45 font-medium">No appointments today.</div>
            ) : appointments.map((a, i) => {
              const { hour, min } = parseApptTime(a.dateTime);
              const priority = a.priority === 'emergency' ? 'emergency' : a.priority === 'warning' ? 'warning' : 'success';
              const cfg = PRIORITY_CONFIG[priority];
              return (
                <div key={a._id || i} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-slate-50/50 hover:bg-slate-50 transition-colors duration-150">
                  <div className="flex items-center gap-3.5">
                    <div className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-8 h-8 text-[11px] ${
                      priority === 'emergency' ? 'bg-danger' : priority === 'warning' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {(a.patientName || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-primary">{a.patientName || 'Patient'}</div>
                      <div className="text-xs text-primary/60 mt-0.5">{a.reason || 'Consultation'}</div>
                      <div className="text-[11px] text-primary/50 mt-0.5">
                        🕐 {hour}:{min} {parseInt(hour) < 12 ? 'AM' : 'PM'} · {a.doctorName ? `Dr. ${a.doctorName.replace('Dr. ', '')}` : 'Doctor'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.cls}`}><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      priority === 'emergency' ? 'bg-danger animate-pulse' : priority === 'warning' ? 'bg-warning' : 'bg-success'
                    }`} />{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
