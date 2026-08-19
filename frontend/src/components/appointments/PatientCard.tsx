'use client';

import { Clock, ArrowRight } from 'lucide-react';

export default function PatientCard({ patient, onSelect }: { patient: any; onSelect: (patient: any) => void }) {
  const getBadgeClass = (status: string) => {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ';
    if (status === 'Urgent') return base + 'bg-danger/10 text-danger border border-danger/20';
    if (status === 'Upcoming') return base + 'bg-sky-100 text-sky-700';
    if (status === 'Completed') return base + 'bg-success/10 text-success border border-success/20';
    return base + 'bg-slate-100 text-slate-600';
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md p-5 flex flex-col justify-between min-h-[180px] cursor-pointer transition-shadow duration-200" 
      onClick={() => onSelect(patient)}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-12 h-12 text-base ${patient.avatarColor} ${patient.avatarText}`}>
            {patient.initials}
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-primary m-0 leading-tight">{patient.name}</h3>
            <p className="text-xs text-primary/60 m-0 mt-1">{patient.age}, {patient.gender}</p>
          </div>
        </div>
        <div className={getBadgeClass(patient.status)}>
          {patient.status}
        </div>
      </div>

      {/* Middle */}
      <div className="flex flex-col mb-5">
        <p className="text-[10px] text-primary/45 font-bold uppercase tracking-wider m-0 mb-1">Symptoms</p>
        <p className="m-0 text-sm text-primary leading-relaxed overflow-hidden line-clamp-2">
          {patient.symptomsShort}
        </p>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
        <div className="flex items-center gap-2 text-xs text-primary/60 font-medium">
          <Clock size={16} />
          <span>{patient.time}</span>
        </div>
        <button className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-secondary hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer">
          View Details <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
