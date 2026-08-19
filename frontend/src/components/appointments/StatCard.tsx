'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  valueColor: string;
  subtitle: string;
  iconBg: string;
}

export default function StatCard({ icon: Icon, label, value, valueColor, subtitle, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md p-5 flex items-center gap-4 min-h-[120px] transition-shadow duration-200">
      <div className={`rounded-full flex items-center justify-center w-12 h-12 flex-shrink-0 ${iconBg}`}>
        <Icon size={24} style={{ color: valueColor }} />
      </div>
      <div className="flex flex-col">
        <p className="text-[10px] text-primary/45 font-bold uppercase tracking-wider m-0 mb-1">{label}</p>
        <p className="m-0 text-2xl font-extrabold leading-none" style={{ color: valueColor }}>{value}</p>
        <p className="text-xs text-primary/60 font-medium m-0 mt-1.5">{subtitle}</p>
      </div>
    </div>
  );
}
