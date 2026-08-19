'use client';

import { useState, useEffect } from 'react';
import { Users, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { appointmentsApi } from '@/lib/api';
import StatCard from './StatCard';
import PatientCard from './PatientCard';
import PatientDetailsModal from './PatientDetailsModal';

export default function AppointmentList() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        let docId = "";
        try {
          const docStr = localStorage.getItem("mediflow_doctor_user");
          const u = docStr ? JSON.parse(docStr) : JSON.parse(localStorage.getItem("mediflow_user") || "{}");
          if (u.role === "doctor") docId = u.id || u._id || u.doctorId;
          console.log('[AppointmentList] Doctor user:', u);
          console.log('[AppointmentList] docId resolved:', docId);
        } catch (e) {
          console.error('[AppointmentList] Error reading user from localStorage:', e);
        }
        
        const params = docId ? { doctorId: docId, limit: "100" } : { limit: "100" };
        console.log('[AppointmentList] Fetching with params:', params);
        const res = await appointmentsApi.getAll(params);
        console.log('[AppointmentList] API response:', res);
        
        const data = (res.appointments || []).map((appt: any) => {
          const name = appt.patientName || appt.patient?.name || 'Unknown Patient';
          const isUrgent = appt.priority === 'emergency' || appt.priority === 'warning';
          const statusStr = appt.status || 'upcoming';
          const isCompleted = statusStr.toLowerCase() === 'completed';
          
          let displayStatus = 'Upcoming';
          if (isUrgent) displayStatus = 'Urgent';
          if (isCompleted) displayStatus = 'Completed';
          
          const safeSplit = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim());
            return [];
          };
          
          return {
            id: appt._id,
            name: name,
            age: appt.patient?.age || 'N/A',
            gender: appt.patient?.gender ? appt.patient.gender.charAt(0) : 'U',
            status: displayStatus,
            risk: appt.priority === 'emergency' ? 'HIGH' : appt.priority === 'warning' ? 'MEDIUM' : 'LOW',
            symptomsShort: appt.reason || 'No symptoms provided',
            symptomsFull: appt.reason || 'No symptoms provided',
            time: appt.timeSlot || '10:00 AM',
            avatarText: 'text-blue-600',
            avatarColor: 'bg-blue-100',
            initials: name.substring(0, 2).toUpperCase(),
            duration: 'Unknown',
            severity: appt.priority === 'emergency' ? 8 : appt.priority === 'warning' ? 5 : 2,
            history: {
              conditions: safeSplit(appt.patient?.conditions),
              allergies: safeSplit(appt.patient?.allergies),
              medications: safeSplit(appt.patient?.medications),
            },
            recommendation: appt.notes || 'AI Triage Booked via Search/Chatbot',
            checkupNotes: appt.notes || '',
            prescription: appt.prescription || '',
            avoidances: appt.recommendedTests || ''
          };
        });
        setAppointmentsData(data.reverse()); // Show newest first
      } catch (err) {
        console.error('Failed to fetch appointments', err);
        setError('Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const stats = {
    total: appointmentsData.length,
    urgent: appointmentsData.filter(p => p.status === 'Urgent').length,
    upcoming: appointmentsData.filter(p => p.status === 'Upcoming').length,
    completed: appointmentsData.filter(p => p.status === 'Completed').length,
  };

  const filtered = activeFilter === 'All'
    ? appointmentsData
    : appointmentsData.filter(p => p.status === activeFilter);

  const filters = ['All', 'Urgent', 'Upcoming', 'Completed'];

  if (loading) return <div className="p-10 text-primary/70 font-medium">Loading appointments...</div>;

  return (
    <div className="w-full pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-primary mb-1">Appointments</h1>
          <p className="text-sm text-primary/60 m-0">Manage your patients and schedule</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border border-border bg-white text-primary hover:bg-slate-50 shadow-sm">
          <Calendar size={18} />
          Today's Schedule
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats.total.toString()}
          valueColor="var(--primary)"
          subtitle="Patients Scheduled"
          iconBg="bg-blue-100"
        />
        <StatCard
          icon={AlertCircle}
          label="Urgent Cases"
          value={`${stats.urgent.toString().padStart(2, '0')} Red`}
          valueColor="var(--danger)"
          subtitle="Active priority"
          iconBg="bg-red-100"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming"
          value={stats.upcoming.toString()}
          valueColor="var(--primary)"
          subtitle="Next 4 hours"
          iconBg="bg-blue-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed.toString()}
          valueColor="var(--success)"
          subtitle="Finished today"
          iconBg="bg-green-100"
        />
      </div>

      {/* Filter Tabs */}
      <div className="pb-4 mb-8 border-b border-border">
        <div className="flex items-center flex-wrap gap-3">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeFilter === f 
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-md' 
                  : 'border border-border bg-white text-primary hover:bg-slate-50 shadow-sm'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(patient => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onSelect={setSelectedPatient}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-border bg-white rounded-2xl p-20 flex flex-col items-center justify-center">
            <Calendar size={48} className="text-border mb-4" />
            <p className="text-lg font-bold text-primary m-0 mb-1">No appointments found</p>
            <p className="text-sm text-primary/60 m-0">There are no matching appointments for "{activeFilter}".</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onCompleteCheckup={(notes, prescription, avoidances) => {
            setAppointmentsData(prev => prev.map(p => p.id === selectedPatient.id ? {
              ...p,
              status: 'Completed',
              checkupNotes: notes,
              prescription: prescription,
              avoidances: avoidances
            } : p));
          }}
        />
      )}
    </div>
  );
}
