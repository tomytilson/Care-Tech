import React, { useState, useRef, useEffect } from 'react';
import { HeartPulse, UserCheck, Sparkles, ShieldAlert, ChevronDown, Stethoscope, Sun, Moon } from 'lucide-react';
import { PatientProfile } from '../types';

interface HeaderProps {
  profile: PatientProfile | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSignIn: () => void;
  onOpenProfile: () => void;
  onOpenPlan: () => void;
  onTriggerEmergencyTest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  theme,
  onToggleTheme,
  onOpenSignIn,
  onOpenProfile,
  onOpenPlan,
  onTriggerEmergencyTest,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    if (!profile || !profile.name) return 'U';
    return profile.name.trim().charAt(0).toUpperCase();
  };

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors px-3 sm:px-6 py-2.5 ${
      isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-950/90 border-slate-800/80 text-white'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
              <HeartPulse className={`w-5 h-5 sm:w-6 sm:h-6 animate-pulse ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Care <span className={isLight ? 'text-emerald-600 font-extrabold' : 'text-emerald-400'}>AI</span>
              </h1>
              <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full border ${
                isLight ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
              }`}>
                Clinical Assistant
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Authoritative, Ultra-Concise Clinical Health Guidance
            </p>
          </div>
        </div>

        {/* Action Controls & Circular Profile Dropdown Menu */}
        <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
          {/* HIGH-CONTRAST THEME TOGGLE BUTTON */}
          <button
            onClick={onToggleTheme}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to High-Contrast Light Mode'}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl transition border min-h-[38px] ${
              isLight
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="hidden md:inline text-slate-900 font-bold">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden md:inline font-bold">Light Mode</span>
              </>
            )}
          </button>

          {/* Daily Plan Generator button */}
          <button
            onClick={onOpenPlan}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl transition shadow-sm min-h-[38px] border ${
              isLight
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wellness Plan</span>
            <span className="sm:hidden">Plan</span>
          </button>

          {/* Emergency Safety Test button */}
          <button
            onClick={onTriggerEmergencyTest}
            title="Emergency Safety Test"
            className={`hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl transition min-h-[38px] border font-medium ${
              isLight
                ? 'bg-red-100 hover:bg-red-200 text-red-950 border-red-300'
                : 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span>Safety Test</span>
          </button>

          {/* CIRCULAR PROFILE BUTTON */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="Account & Profile Options"
              className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition transform active:scale-95 min-h-[40px] min-w-[40px] ${
                menuOpen
                  ? isLight
                    ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/30'
                    : 'border-emerald-400 bg-emerald-950 shadow-lg shadow-emerald-950/80 ring-2 ring-emerald-500/30'
                  : isLight
                  ? 'border-slate-300 hover:border-emerald-600 bg-slate-100 text-emerald-800'
                  : 'border-slate-700 hover:border-emerald-500 bg-slate-900 text-emerald-400'
              }`}
            >
              <div className={`w-full h-full rounded-full flex items-center justify-center font-extrabold text-sm ${
                isLight ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-950/80 text-emerald-300'
              }`}>
                {getInitial()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}>
                <ChevronDown className={`w-2.5 h-2.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`} />
              </div>
            </button>

            {/* DROPDOWN MENU */}
            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-64 sm:w-72 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in border divide-y ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 divide-slate-100 shadow-slate-300/60'
                  : 'bg-slate-900 border-slate-800 text-slate-100 divide-slate-800/80'
              }`}>
                {/* Profile Information Header inside dropdown */}
                <div className={`p-3 rounded-xl mb-1 ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/60'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm border ${
                      isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {getInitial()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {profile?.name || 'Patient User'}
                      </h4>
                      <p className={`text-[11px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {profile?.age ? `${profile.age} years old` : 'Care AI Member'}
                      </p>
                    </div>
                  </div>
                  {profile?.medicalHistoryNotes && (
                    <p className={`text-[10px] font-medium mt-2 truncate px-2 py-0.5 rounded-md border ${
                      isLight ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400/90 border-emerald-900/40'
                    }`}>
                      {profile.medicalHistoryNotes}
                    </p>
                  )}
                </div>

                {/* Dropdown Action Items */}
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleTheme();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition min-h-[40px] ${
                      isLight
                        ? 'text-slate-800 hover:bg-slate-100 hover:text-emerald-800'
                        : 'text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300'
                    }`}
                  >
                    {isLight ? (
                      <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isLight ? 'Switch to Dark Mode' : 'High-Contrast Light Mode'}
                      </span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isLight ? 'Comfortable dark theme for low light' : 'Bright, crisp high-contrast layout'}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSignIn();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition min-h-[40px] ${
                      isLight
                        ? 'text-slate-800 hover:bg-slate-100 hover:text-emerald-800'
                        : 'text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sign In / Switch Account</span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Connect Google/Gmail or switch profile</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProfile();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition min-h-[40px] ${
                      isLight
                        ? 'text-slate-800 hover:bg-slate-100 hover:text-emerald-800'
                        : 'text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Edit Profile & Symptoms</span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Update health conditions, goals & allergies</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenPlan();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition min-h-[40px] ${
                      isLight
                        ? 'text-slate-800 hover:bg-slate-100 hover:text-emerald-800'
                        : 'text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Daily Wellness Plan</span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>View personalized diet & exercise tips</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

