import React, { useState, useEffect } from 'react';
import { User, Activity, AlertTriangle, Utensils, Moon, Dumbbell, Stethoscope, Save, X, Plus, Check } from 'lucide-react';
import { PatientProfile } from '../types';
import { COMMON_GOALS, COMMON_ALLERGIES, COMMON_DIETARY, COMMON_SYMPTOMS } from '../data/sampleProfiles';

interface PatientProfileFormProps {
  isOpen: boolean;
  profile: PatientProfile | null;
  onSave: (updatedProfile: PatientProfile) => void;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const PatientProfileForm: React.FC<PatientProfileFormProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age || 30);
  const [healthGoals, setHealthGoals] = useState<string[]>(profile?.healthGoals || []);
  const [allergies, setAllergies] = useState<string[]>(profile?.allergies || []);
  const [dietaryNotes, setDietaryNotes] = useState<string[]>(profile?.dietaryNotes || []);
  const [sleepHours, setSleepHours] = useState(profile?.sleepHours || 7);
  const [exerciseHabits, setExerciseHabits] = useState(profile?.exerciseHabits || '');
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>(profile?.currentSymptoms || []);
  const [medicalNotes, setMedicalNotes] = useState(profile?.medicalHistoryNotes || '');

  // Custom addition fields
  const [customGoal, setCustomGoal] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDiet, setCustomDiet] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (profile && isOpen) {
      setName(profile.name || '');
      setAge(profile.age || 30);
      setHealthGoals(profile.healthGoals || []);
      setAllergies(profile.allergies || []);
      setDietaryNotes(profile.dietaryNotes || []);
      setSleepHours(profile.sleepHours || 7.5);
      setExerciseHabits(profile.exerciseHabits || '');
      setCurrentSymptoms(profile.currentSymptoms || []);
      setMedicalNotes(profile.medicalHistoryNotes || '');
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const toggleChip = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustom = (
    value: string,
    setValue: (v: string) => void,
    list: string[],
    setList: (val: string[]) => void
  ) => {
    if (!value.trim()) return;
    if (!list.includes(value.trim())) {
      setList([...list, value.trim()]);
    }
    setValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientProfile = {
      ...profile,
      name: name.trim() || profile.name,
      age,
      healthGoals,
      allergies,
      dietaryNotes,
      sleepHours,
      exerciseHabits,
      currentSymptoms,
      medicalHistoryNotes: medicalNotes,
    };
    onSave(updated);
    setToastMessage('Profile updated successfully! Care AI context refreshed.');
    setTimeout(() => {
      setToastMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Edit Health Preferences & Profile</h2>
              <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Configure your symptoms, health conditions, allergies & wellness goals
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {toastMessage && (
            <div className={`p-3 border text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in ${
              isLight ? 'bg-emerald-100 border-emerald-400 text-emerald-950' : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
            }`}>
              <Check className={`w-4 h-4 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 1. Basic Info */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-emerald-800' : 'text-emerald-400'
            }`}>
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>1. Basic Patient Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition min-h-[42px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition min-h-[42px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 2. Health Goals */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-emerald-800' : 'text-emerald-400'
            }`}>
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>2. Health & Wellness Goals</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {COMMON_GOALS.map((goal) => {
                const active = healthGoals.includes(goal);
                return (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleChip(healthGoals, setHealthGoals, goal)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition min-h-[40px] flex items-center gap-1.5 ${
                      active
                        ? isLight
                          ? 'bg-emerald-700 border-emerald-800 text-white font-bold shadow-sm'
                          : 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-semibold shadow-md shadow-emerald-950/40'
                        : isLight
                        ? 'bg-white border-slate-300 text-slate-800 hover:border-emerald-600 hover:text-emerald-900 font-medium shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-600/60 hover:text-white'
                    }`}
                  >
                    <span>{active ? '✓' : '+'}</span>
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1.5">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Add custom health goal..."
                className={`flex-1 px-4 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none min-h-[44px] ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600 font-medium'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  handleAddCustom(customGoal, setCustomGoal, healthGoals, setHealthGoals)
                }
                className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition min-h-[44px] border ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-transparent'
                }`}
              >
                Add Goal
              </button>
            </div>
          </div>

          {/* 3. Known Allergies */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-amber-800' : 'text-amber-400'
            }`}>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>3. Known Allergies (Critical for Safety)</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {COMMON_ALLERGIES.map((allergy) => {
                const active = allergies.includes(allergy);
                return (
                  <button
                    type="button"
                    key={allergy}
                    onClick={() => toggleChip(allergies, setAllergies, allergy)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition min-h-[40px] flex items-center gap-1.5 ${
                      active
                        ? isLight
                          ? 'bg-amber-600 border-amber-700 text-white font-extrabold shadow-sm'
                          : 'bg-amber-950/90 border-amber-500 text-amber-200 font-bold shadow-md shadow-amber-950/40'
                        : isLight
                        ? 'bg-white border-slate-300 text-slate-800 hover:border-amber-600 hover:text-amber-900 font-medium shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-amber-600/60 hover:text-white'
                    }`}
                  >
                    <span>{active ? '⚠️' : '+'}</span>
                    <span>{allergy}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1.5">
              <input
                type="text"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                placeholder="Add custom allergy..."
                className={`flex-1 px-4 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none min-h-[44px] ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-amber-600 font-medium'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  handleAddCustom(customAllergy, setCustomAllergy, allergies, setAllergies)
                }
                className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition min-h-[44px] border ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-transparent'
                }`}
              >
                Add Allergy
              </button>
            </div>
          </div>

          {/* 4. Dietary Notes / Restrictions */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-teal-800' : 'text-teal-400'
            }`}>
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>4. Dietary Notes / Restrictions</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {COMMON_DIETARY.map((diet) => {
                const active = dietaryNotes.includes(diet);
                return (
                  <button
                    type="button"
                    key={diet}
                    onClick={() => toggleChip(dietaryNotes, setDietaryNotes, diet)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition min-h-[40px] flex items-center gap-1.5 ${
                      active
                        ? isLight
                          ? 'bg-teal-700 border-teal-800 text-white font-bold shadow-sm'
                          : 'bg-teal-950/90 border-teal-500 text-teal-200 font-semibold shadow-md shadow-teal-950/40'
                        : isLight
                        ? 'bg-white border-slate-300 text-slate-800 hover:border-teal-600 hover:text-teal-950 font-medium shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-teal-600/60 hover:text-white'
                    }`}
                  >
                    <span>{active ? '✓' : '+'}</span>
                    <span>{diet}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1.5">
              <input
                type="text"
                value={customDiet}
                onChange={(e) => setCustomDiet(e.target.value)}
                placeholder="Add custom dietary restriction..."
                className={`flex-1 px-4 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none min-h-[44px] ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-teal-600 font-medium'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500'
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  handleAddCustom(customDiet, setCustomDiet, dietaryNotes, setDietaryNotes)
                }
                className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition min-h-[44px] border ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-transparent'
                }`}
              >
                Add Diet
              </button>
            </div>
          </div>

          {/* 5. Activity & Sleep */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-indigo-800' : 'text-indigo-400'
            }`}>
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>5. Activity & Sleep Habits</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Average Sleep Hours (per night)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />
                  <span className={`text-sm font-bold w-14 text-right ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                    {sleepHours} hrs
                  </span>
                </div>
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Daily Exercise Habits
                </label>
                <input
                  type="text"
                  value={exerciseHabits}
                  onChange={(e) => setExerciseHabits(e.target.value)}
                  placeholder="e.g. 30 min daily walk, weight training 3x/wk"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition min-h-[42px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 font-medium'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 6. Current Symptoms / Concerns */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-cyan-800' : 'text-cyan-400'
            }`}>
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>6. Current Symptoms & Health Conditions</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {COMMON_SYMPTOMS.map((symptom) => {
                const active = currentSymptoms.includes(symptom);
                return (
                  <button
                    type="button"
                    key={symptom}
                    onClick={() => toggleChip(currentSymptoms, setCurrentSymptoms, symptom)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition min-h-[40px] flex items-center gap-1.5 ${
                      active
                        ? isLight
                          ? 'bg-cyan-700 border-cyan-800 text-white font-bold shadow-sm'
                          : 'bg-cyan-950/90 border-cyan-500 text-cyan-200 font-semibold shadow-md shadow-cyan-950/40'
                        : isLight
                        ? 'bg-white border-slate-300 text-slate-800 hover:border-cyan-600 hover:text-cyan-950 font-medium shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-600/60 hover:text-white'
                    }`}
                  >
                    <span>{active ? '•' : '+'}</span>
                    <span>{symptom}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1.5">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="Log custom symptom or health condition..."
                className={`flex-1 px-4 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none min-h-[44px] ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-cyan-600 font-medium'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500'
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  handleAddCustom(customSymptom, setCustomSymptom, currentSymptoms, setCurrentSymptoms)
                }
                className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition min-h-[44px] border ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-transparent'
                }`}
              >
                Add Symptom
              </button>
            </div>
          </div>

          {/* Additional Medical History Notes */}
          <div className="space-y-2">
            <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Additional Medical Notes / Context (Optional)
            </label>
            <textarea
              rows={2}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="e.g. Mild hypertension history, sensitive skin..."
              className={`w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600 font-medium'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Save Button Bar */}
          <div className={`pt-2 sticky bottom-0 border-t py-3 flex items-center justify-end gap-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 font-semibold text-xs rounded-xl transition border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Update AI Context</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
