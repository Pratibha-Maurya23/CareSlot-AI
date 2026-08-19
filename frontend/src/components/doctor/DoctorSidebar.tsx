import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, FileText, Stethoscope,
  Settings, Activity, LogOut, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', badge: null },
  { icon: Calendar, label: 'Appointments', id: 'appointments', badge: '3' },
  { icon: Settings, label: 'My Profile', id: 'profile', badge: null },
];

export default function Sidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  const [doctorName, setDoctorName] = useState('Doctor');
  const [doctorSpec, setDoctorSpec] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_doctor_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name) setDoctorName(u.name);
        if (u?.specialization) setDoctorSpec(u.specialization);
      }
    } catch { }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('mediflow_doctor_token');
      localStorage.removeItem('mediflow_doctor_user');
    } catch { }
    window.location.href = '/demo/doctor/auth';
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-primary flex flex-col z-50 overflow-hidden">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-white/10 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <Activity size={22} color="white" />
        </div>
        <div className="text-white">
          <h2 className="text-base font-extrabold leading-none tracking-tight">MediFlow</h2>
          <span className="text-[10px] font-medium text-white/55 block mt-0.5">Healthcare Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto flex flex-col gap-0.5">
        <div className="px-3.5 py-2 text-[10px] font-bold tracking-wider uppercase text-white/35">Main Menu</div>
        {NAV_ITEMS.map(({ icon: Icon, label, id, badge }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-180 ease-in-out cursor-pointer border-none bg-transparent w-full text-left ${activePage === id ? 'bg-accent/20 text-white font-semibold' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} className={`flex-shrink-0 ${activePage === id ? 'text-accent' : 'text-white/50'}`} />
            <span style={{ flex: 1 }}>{label}</span>
            {badge && <span className="ml-auto px-2 py-0.5 bg-danger text-white rounded-full text-[10px] font-bold">{badge}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="mx-3 my-2 mb-4 p-3 rounded-xl bg-white/7 flex items-center gap-2.5 transition-colors duration-180 hover:bg-white/12">
        <div
          className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-10 h-10 text-sm"
          style={{ background: 'var(--accent)', cursor: 'default' }}
        >
          {doctorName.split(' ').filter((_,i) => i < 2).map(n => n[0]).join('').toUpperCase() || 'Dr'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-semibold truncate">{doctorName}</div>
          <div className="text-white/45 text-[10px]">{doctorSpec || 'Doctor'}</div>
        </div>
        <button
          onClick={handleLogout}
          title="Log Out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <LogOut size={15} className="text-white/55 flex-shrink-0 hover:text-white" />
        </button>
      </div>
    </aside>
  );
}
