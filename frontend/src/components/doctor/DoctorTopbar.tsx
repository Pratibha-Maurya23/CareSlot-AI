import { Search, Bell, Calendar } from 'lucide-react';

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="fixed top-0 left-[260px] right-0 h-[68px] bg-white border-b border-border flex items-center justify-between px-7 z-40 shadow-sm max-md:left-0">
      {/* Left — Page title */}
      <div className="flex flex-col max-md:hidden">
        <span className="text-lg font-bold text-primary">{title}</span>
        <span className="text-[12px] text-primary/60 mt-0.5">{subtitle || today}</span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2.5 ml-auto max-md:w-full">
        {/* Search */}
        <div className="flex items-center gap-2 bg-bgLight/40 border border-border rounded-full px-4 py-2 w-[240px] focus-within:border-secondary transition-colors max-md:w-auto max-md:flex-1 max-md:min-w-0 max-md:px-3" id="topbar-search">
          <Search size={15} className="text-primary/50 flex-shrink-0" />
          <input placeholder="Search patients, records..." className="bg-transparent border-none outline-none text-xs text-primary w-full placeholder:text-primary/50" />
        </div>

        {/* Notification */}
        <button className="relative w-10 h-10 rounded-full bg-bgLight/40 border border-border flex items-center justify-center text-primary cursor-pointer transition-all hover:bg-secondary hover:text-white hover:border-secondary" id="notif-btn" title="Notifications">
          <Bell size={17} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white" />
        </button>

        {/* Date chip */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-bgSoft border border-border rounded-full text-xs font-semibold text-primary max-sm:hidden">
          <Calendar size={14} />
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
