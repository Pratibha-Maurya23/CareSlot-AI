import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, FileText, Stethoscope,
  Settings, Activity, LogOut, ShieldCheck, BedDouble
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', id: 'dashboard', badge: null },
  { icon: Stethoscope, label: 'Doctors', id: 'doctors', badge: null },
  { icon: BedDouble, label: 'Beds', id: 'beds', badge: null },
  { icon: Calendar, label: 'Master Schedule', id: 'appointments', badge: null },
];

export default function AdminSidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (page: string) => void }) {
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mediflow_admin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name) setAdminName(u.name);
      }
    } catch { }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('mediflow_admin_token');
      localStorage.removeItem('mediflow_admin_user');
    } catch { }
    window.location.href = '/demo/admin/auth';
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-primary flex flex-col z-50 overflow-hidden">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-white/10 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={22} color="white" />
        </div>
        <div className="text-white">
          <h2 className="text-base font-extrabold leading-none tracking-tight">MediFlow</h2>
          <span className="text-[10px] font-medium text-white/55 block mt-0.5">Admin Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto flex flex-col gap-0.5">
        <div className="px-3.5 py-2 text-[10px] font-bold tracking-wider uppercase text-white/35">Hospital Operations</div>
        {NAV_ITEMS.map(({ icon: Icon, label, id, badge }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-180 ease-in-out cursor-pointer border-none w-full text-left relative ${activePage === id ? 'bg-white/20 text-white font-bold border-l-4 border-accent pl-3' : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white font-medium'}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} className={`flex-shrink-0 ${activePage === id ? 'text-accent' : 'text-white/60'}`} />
            <span style={{ flex: 1 }}>{label}</span>
            {badge && <span className="px-2 py-0.5 bg-danger text-white rounded-full text-[10px] font-bold">{badge}</span>}
            {activePage === id && !badge && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_#62B6CB] shrink-0" />
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="mx-3 my-2 mb-4 p-3 rounded-xl bg-white/7 flex items-center gap-2.5 transition-colors duration-180 hover:bg-white/12">
        <div
          className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-10 h-10 text-sm"
          style={{ background: 'var(--accent)', cursor: 'default' }}
        >
          {adminName.split(' ').filter((_,i) => i < 2).map(n => n[0]).join('').toUpperCase() || 'AD'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-semibold truncate">{adminName}</div>
          <div className="text-white/45 text-[10px]">Administrator</div>
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
