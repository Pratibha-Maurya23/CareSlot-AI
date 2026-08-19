'use client';

import { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, Clock, Activity, FileText, CheckCircle, Pill, Stethoscope } from 'lucide-react';
import { appointmentsApi } from '@/lib/api';

export default function PatientDetailsModal({ 
  patient, 
  onClose,
  onCompleteCheckup
}: { 
  patient: any; 
  onClose: () => void;
  onCompleteCheckup?: (notes: string, prescription: string, avoidances: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [isCheckingUp, setIsCheckingUp] = useState(false);

  // Form checkup states
  const [notes, setNotes] = useState(patient.checkupNotes || '');
  const [prescription, setPrescription] = useState(patient.prescription || '');
  const [avoidances, setAvoidances] = useState(patient.avoidances || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!patient) return null;

  const getBadgeClasses = (status: string) => {
    if (status === 'Urgent') return 'bg-danger/10 text-danger border border-danger/20';
    if (status === 'Upcoming') return 'bg-sky-100 text-sky-700';
    if (status === 'Completed') return 'bg-success/10 text-success border border-success/20';
    return 'bg-slate-100 text-slate-600';
  };

  const getRiskClasses = (risk: string) => {
    if (risk === 'HIGH') return 'bg-danger/10 text-danger border border-danger/20';
    if (risk === 'MEDIUM') return 'bg-warning/10 text-amber-700 border border-warning/20';
    if (risk === 'LOW') return 'bg-success/10 text-success border border-success/20';
    return 'bg-slate-100 text-slate-600';
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await appointmentsApi.update(patient.id, {
        status: 'Completed',
        notes,
        prescription,
        recommendedTests: avoidances
      });

      if (onCompleteCheckup) {
        onCompleteCheckup(notes, prescription, avoidances);
      }
      
      setIsCheckingUp(false);
      onClose();
    } catch (error) {
      console.error("Failed to complete appointment checkup", error);
      alert("Failed to save checkup records. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityColor = patient.severity <= 3 ? '#16A34A' : patient.severity <= 6 ? '#F59E0B' : '#DC2626';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-5"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl border border-border shadow-2xl flex flex-col w-full max-w-[680px] max-h-[90vh] overflow-hidden transition-all duration-300 ${
          mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="p-7 md:px-8 border-b border-border relative bg-slate-50">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-primary/40 hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-5">
            <div 
              className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 w-16 h-16 text-xl ${patient.avatarColor} ${patient.avatarText}`}
            >
              {patient.initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-1.5">{patient.name}</h2>
              <p className="text-sm text-primary/60 m-0 flex items-center gap-2">
                {patient.age} yrs &bull; {patient.gender === 'M' ? 'Male' : 'Female'} &bull; <Clock size={14} /> {patient.time}
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getRiskClasses(patient.risk)}`}>
                  {patient.risk} RISK
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getBadgeClasses(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Body (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {isCheckingUp ? (
            <div className="flex flex-col gap-6">
              <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5 flex items-start gap-3">
                <Stethoscope size={20} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-primary m-0">Start Active Checkup</h3>
                  <p className="text-xs text-primary/60 m-0 mt-0.5">Please document the clinical details, prescription details, and necessary precautions below.</p>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-primary/55 uppercase tracking-wider">Clinical Diagnosis & Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Document symptoms, diagnosis notes, and general clinical remarks here..."
                  className="w-full min-h-[100px] p-3.5 bg-slate-50 border border-border focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-none text-primary font-medium"
                />
              </div>

              {/* Prescription */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-primary/55 uppercase tracking-wider">Recommended Medicines / Prescription</label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg - 1-0-1 after meals (5 Days)"
                  className="w-full min-h-[100px] p-3.5 bg-slate-50 border border-border focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-none text-primary font-medium"
                />
              </div>

              {/* Precautions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-primary/55 uppercase tracking-wider">Precautions / Avoid / Recommended Tests</label>
                <textarea
                  value={avoidances}
                  onChange={(e) => setAvoidances(e.target.value)}
                  placeholder="e.g. Avoid cold drinks, oily food, rest for 3 days"
                  className="w-full min-h-[100px] p-3.5 bg-slate-50 border border-border focus:bg-white rounded-xl text-sm focus:outline-none focus:border-primary transition-all resize-none text-primary font-medium"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Triage / Symptoms */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-primary mb-3">
                  <AlertTriangle size={18} className="text-accent" /> Chief Complaint
                </h3>
                <div className="bg-slate-50 p-5 rounded-2xl border border-border">
                  <p className="m-0 text-[15px] text-primary leading-relaxed">
                    {patient.symptomsFull}
                  </p>
                  
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                    <div>
                      <p className="text-[10px] text-primary/45 mb-1 font-bold tracking-wider uppercase">DURATION</p>
                      <p className="m-0 text-sm font-semibold text-primary">{patient.duration}</p>
                    </div>
                    <div className="w-[220px]">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] text-primary/45 m-0 font-bold tracking-wider uppercase">SEVERITY</p>
                        <p className="m-0 text-xs font-extrabold" style={{ color: severityColor }}>{patient.severity} / 10</p>
                      </div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${patient.severity * 10}%`, backgroundColor: severityColor }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor's Checkup Report (Only visible if completed) */}
              {patient.status === 'Completed' && (
                <div className="mb-8 bg-teal-50/50 border border-teal-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-teal-500/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                  
                  <h3 className="flex items-center gap-2 text-lg font-bold text-teal-800 mb-5">
                    <CheckCircle size={20} className="text-teal-600" /> Doctor's Checkup Report
                  </h3>
                  
                  <div className="flex flex-col gap-5">
                    {/* Notes */}
                    <div>
                      <p className="text-[11px] text-teal-700/75 mb-1.5 font-bold tracking-wider uppercase">CLINICAL DIAGNOSIS</p>
                      <div className="bg-white p-4 rounded-xl border border-teal-200 text-[15px] text-teal-900 leading-relaxed">
                        {patient.checkupNotes || 'No notes documented.'}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      {/* Prescriptions */}
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] text-green-700 mb-1.5 font-bold tracking-wider uppercase">
                          <Pill size={14} /> RECOMMENDED MEDICINES
                        </p>
                        <div className="bg-green-50/50 p-4 rounded-xl border border-green-200 text-sm text-green-800 whitespace-pre-wrap min-h-[80px]">
                          {patient.prescription || 'No medicines prescribed.'}
                        </div>
                      </div>

                      {/* Avoidances */}
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] text-amber-700 mb-1.5 font-bold tracking-wider uppercase">
                          <AlertTriangle size={14} /> PRECAUTIONS / AVOID
                        </p>
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800 whitespace-pre-wrap min-h-[80px]">
                          {patient.avoidances || 'No specific precautions.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical History */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-base font-bold text-primary mb-4">
                  <Activity size={18} className="text-secondary" /> Medical History
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Conditions */}
                  <div>
                    <p className="text-[10px] text-primary/45 mb-2.5 font-bold tracking-wider uppercase">CONDITIONS</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.history.conditions.map((item: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 normal-case">{item}</span>
                      ))}
                      {patient.history.conditions.length === 0 && <span className="text-xs text-primary/40 font-medium">None reported</span>}
                    </div>
                  </div>
                  
                  {/* Allergies */}
                  <div>
                    <p className="text-[10px] text-primary/45 mb-2.5 font-bold tracking-wider uppercase">ALLERGIES</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.history.allergies.map((item: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger normal-case">{item}</span>
                      ))}
                      {patient.history.allergies.length === 0 && <span className="text-xs text-primary/40 font-medium">None reported</span>}
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <p className="text-[10px] text-primary/45 mb-2.5 font-bold tracking-wider uppercase">MEDICATIONS</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.history.medications.map((item: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 normal-case">{item}</span>
                      ))}
                      {patient.history.medications.length === 0 && <span className="text-xs text-primary/40 font-medium">None reported</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-primary mb-3">
                  <FileText size={18} className="text-primary" /> AI Triage Note
                </h3>
                <div className="bg-bgLight/40 p-5 rounded-2xl flex gap-3.5 items-start">
                  <Info size={22} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="m-0 text-[15px] text-primary font-medium leading-relaxed">
                    {patient.recommendation}
                  </p>
                </div>
              </div>
            </>
          )}
          
        </div>

        {/* --- Footer --- */}
        {isCheckingUp ? (
          <div className="p-6 md:px-8 border-t border-border bg-slate-50 flex justify-end gap-4">
            <button 
              className="px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border border-border bg-white text-primary hover:bg-slate-50"
              onClick={() => setIsCheckingUp(false)}
              disabled={isSubmitting}
            >
              Back
            </button>
            <button 
              className="px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer bg-success text-white hover:bg-success-hover shadow-sm"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Checkup'}
            </button>
          </div>
        ) : (
          <div className="p-6 md:px-8 border-t border-border bg-slate-50 flex justify-end gap-4">
            <button 
              className="px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border border-border bg-white text-primary hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            {patient.status !== 'Completed' && (
              <button 
                className="px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer bg-primary text-white hover:bg-primary-hover shadow-sm"
                onClick={() => setIsCheckingUp(true)}
              >
                Start Checkup
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
