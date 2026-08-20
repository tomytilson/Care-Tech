import React from 'react';
import { Sparkles, Sun, Moon, Utensils, AlertTriangle, CheckCircle2, X, Download } from 'lucide-react';
import { DailyWellnessPlan, PatientProfile } from '../types';

interface WellnessPlanModalProps {
  isOpen: boolean;
  plan: DailyWellnessPlan | null;
  profile: PatientProfile | null;
  isLoading: boolean;
  theme?: 'dark' | 'light';
  onClose: () => void;
  onRegenerate: () => void;
}

export const WellnessPlanModal: React.FC<WellnessPlanModalProps> = ({
  isOpen,
  plan,
  profile,
  isLoading,
  theme = 'dark',
  onClose,
  onRegenerate,
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  const handleExportPlan = () => {
    if (!plan) return;
    const text = `CARE AI - 24-HOUR PERSONALIZED WELLNESS PLAN
Patient: ${profile?.name || 'Patient'}
Generated: ${new Date().toLocaleDateString()}

Summary:
${plan.summary}

MORNING ROUTINE:
${plan.morningRoutine?.map((r) => `- ${r}`).join('\n')}

AFTERNOON ROUTINE:
${plan.afternoonRoutine?.map((r) => `- ${r}`).join('\n')}

EVENING ROUTINE:
${plan.eveningRoutine?.map((r) => `- ${r}`).join('\n')}

NUTRITION & DIET:
${plan.nutritionTips?.map((n) => `- ${n}`).join('\n')}

ALLERGY & SAFETY WARNINGS:
${plan.allergyWarnings?.map((a) => `- ${a}`).join('\n')}

SLEEP HYGIENE:
${plan.sleepRecommendations?.map((s) => `- ${s}`).join('\n')}
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `care-ai-wellness-plan-${profile?.name?.toLowerCase().replace(/\s+/g, '-') || 'patient'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-3xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Modal Top */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Personalized 24-Hour Wellness Plan
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Tailored for {profile?.name || 'Patient'} based on age, goals, allergies & symptoms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto animate-spin ${
                isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-950 border-emerald-800 text-emerald-400'
              }`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <p className={`text-sm font-bold ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
                Generating your custom wellness routine...
              </p>
              <p className={`text-xs max-w-sm mx-auto ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Care AI is analyzing your sleep goals, allergies, and exercise habits to build a safe daily schedule.
              </p>
            </div>
          ) : plan ? (
            <>
              {/* Summary Card */}
              <div className={`p-4 rounded-xl border space-y-1 ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isLight ? 'text-emerald-900' : 'text-emerald-400'
                }`}>
                  AI Summary & Overview
                </span>
                <p className="text-xs sm:text-sm leading-relaxed font-medium">{plan.summary}</p>
              </div>

              {/* Allergy Warning Pill if any */}
              {plan.allergyWarnings?.length > 0 && (
                <div className={`p-4 rounded-xl border space-y-1.5 ${
                  isLight ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-sm' : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isLight ? 'text-amber-900' : 'text-amber-400'
                  }`}>
                    <AlertTriangle className="w-4 h-4" /> Allergy & Safety Precautions
                  </span>
                  <ul className="list-disc list-inside text-xs space-y-1 font-medium">
                    {plan.allergyWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Routines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Morning */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-amber-700' : 'text-amber-400'
                  }`}>
                    <Sun className="w-4 h-4" /> Morning Routine
                  </div>
                  <ul className="space-y-2 text-xs">
                    {plan.morningRoutine?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                        <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Afternoon */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-emerald-800' : 'text-emerald-400'
                  }`}>
                    <Sun className="w-4 h-4" /> Afternoon Focus
                  </div>
                  <ul className="space-y-2 text-xs">
                    {plan.afternoonRoutine?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                        <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evening */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-indigo-700' : 'text-indigo-400'
                  }`}>
                    <Moon className="w-4 h-4" /> Evening & Rest
                  </div>
                  <ul className="space-y-2 text-xs">
                    {plan.eveningRoutine?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                        <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nutrition & Sleep Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-teal-800' : 'text-teal-400'
                  }`}>
                    <Utensils className="w-4 h-4" /> Tailored Nutrition
                  </div>
                  <ul className="space-y-2 text-xs">
                    {plan.nutritionTips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>•</span>
                        <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm text-slate-900' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-purple-800' : 'text-purple-400'
                  }`}>
                    <Moon className="w-4 h-4" /> Sleep Recommendations
                  </div>
                  <ul className="space-y-2 text-xs">
                    {plan.sleepRecommendations?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>•</span>
                        <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className={`py-12 text-center ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              No plan generated yet. Click regenerate below.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
            <span>Regenerate Plan</span>
          </button>

          <div className="flex items-center gap-2">
            {plan && (
              <button
                onClick={handleExportPlan}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Text Plan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition border ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
