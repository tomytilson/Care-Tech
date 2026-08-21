import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, CheckCircle2, X, ShieldCheck, Mail, LogIn, Sparkles, User, History } from 'lucide-react';
import { PatientProfile, ChatMessage } from '../types';
import { loadPatientAccount, listSavedPatientAccounts, StoredPatientAccount } from '../utils/patientStorage';

interface SignInModalProps {
  isOpen: boolean;
  currentProfile: PatientProfile | null;
  onSelectProfile: (profile: PatientProfile, history?: ChatMessage[], isReturningUser?: boolean) => void;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  currentProfile,
  onSelectProfile,
  onClose,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [customName, setCustomName] = useState('');
  const [customAge, setCustomAge] = useState('');
  const [gmailEmail, setGmailEmail] = useState('');
  const [showGmailInput, setShowGmailInput] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<StoredPatientAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedAccounts(listSavedPatientAccounts());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.user) {
        setIsGoogleLoading(false);
        const gUser = event.data.user;
        const userEmail = (gUser.email || '').trim().toLowerCase();
        
        // Check if account already exists in persistent storage indexed by Gmail address
        const existingAccount = userEmail ? loadPatientAccount(userEmail) : null;

        if (existingAccount) {
          onSelectProfile(existingAccount.profile, existingAccount.messages, true);
        } else {
          const newProfile: PatientProfile = {
            id: `google-${gUser.id || Date.now()}`,
            email: userEmail,
            name: gUser.name || userEmail.split('@')[0] || 'Google User',
            age: 32,
            healthGoals: ['Improve overall wellness', 'Boost energy'],
            allergies: [],
            dietaryNotes: [],
            sleepHours: 7.5,
            exerciseHabits: 'Moderate exercise 2-3 times a week',
            currentSymptoms: [],
            medicalHistoryNotes: `Signed in via Google Account (${userEmail || 'OAuth'})`,
          };
          onSelectProfile(newProfile, [], false);
        }
        onClose();
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsGoogleLoading(false);
        setErrorMsg(`Google OAuth Note: ${event.data.error || 'Sign in interrupted.'}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelectProfile, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);

    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();

      if (data.configured && data.url) {
        const popup = window.open(
          data.url,
          'google_oauth',
          'width=600,height=700,status=1'
        );

        if (!popup) {
          setIsGoogleLoading(false);
          setShowGmailInput(true);
          setErrorMsg('Popup window blocked by browser. You can enter your Gmail address directly below.');
        }
      } else {
        setIsGoogleLoading(false);
        setShowGmailInput(true);
      }
    } catch (e: any) {
      console.error('Google Auth error:', e);
      setIsGoogleLoading(false);
      setShowGmailInput(true);
    }
  };

  const handleGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailEmail.trim() || !gmailEmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address (e.g. user@gmail.com).');
      return;
    }

    const cleanEmail = gmailEmail.trim().toLowerCase();
    const existingAccount = loadPatientAccount(cleanEmail);

    if (existingAccount) {
      onSelectProfile(existingAccount.profile, existingAccount.messages, true);
    } else {
      const nameFromEmail = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = nameFromEmail
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const newProfile: PatientProfile = {
        id: `gmail-${Date.now()}`,
        email: cleanEmail,
        name: formattedName || 'Gmail Patient',
        age: 30,
        healthGoals: ['Build stamina', 'Improve sleep quality'],
        allergies: [],
        dietaryNotes: [],
        sleepHours: 7.5,
        exerciseHabits: 'Moderate exercise 3x a week',
        currentSymptoms: [],
        medicalHistoryNotes: `Gmail Account: ${cleanEmail}`,
      };

      onSelectProfile(newProfile, [], false);
    }

    setGmailEmail('');
    setShowGmailInput(false);
    setErrorMsg('');
    onClose();
  };

  const handleSelectExistingAccount = (account: StoredPatientAccount) => {
    onSelectProfile(account.profile, account.messages, true);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg('Please enter a patient name or ID.');
      return;
    }

    const newProfile: PatientProfile = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      age: customAge ? parseInt(customAge, 10) || 30 : 30,
      healthGoals: ['Improve overall wellness', 'Boost energy'],
      allergies: [],
      dietaryNotes: [],
      sleepHours: 7.5,
      exerciseHabits: 'Moderate exercise 2-3 times a week',
      currentSymptoms: [],
    };

    onSelectProfile(newProfile, [], false);
    setCustomName('');
    setCustomAge('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Modal Top Bar */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Patient Sign-In</h2>
              <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>Sign in with Google / Gmail</p>
            </div>
          </div>
          {currentProfile && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Welcome Back Header if already signed in */}
          {currentProfile && (
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/40 border-emerald-800/60'
            }`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
              <div>
                <h3 className={`text-xs sm:text-sm font-bold ${isLight ? 'text-emerald-950' : 'text-emerald-300'}`}>
                  Signed in as {currentProfile.name}
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-emerald-900 font-medium' : 'text-emerald-400/80'}`}>
                  Your profile is active and synced with Care AI.
                </p>
              </div>
            </div>
          )}

          {/* PRIMARY GMAIL / GOOGLE SIGN-IN BUTTON */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-slate-950/90 border-slate-800'
          }`}>
            <label className={`block text-xs font-extrabold uppercase tracking-wider ${
              isLight ? 'text-emerald-800' : 'text-emerald-400'
            }`}>
              ⚡ Google & Gmail Sign-In
            </label>
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl border border-slate-300 shadow-md flex items-center justify-center gap-3 transition transform active:scale-[0.99] min-h-[44px]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting...' : 'Sign in with Google / Gmail'}</span>
            </button>

            {/* Direct Gmail email entry alternative */}
            {showGmailInput ? (
              <form onSubmit={handleGmailSubmit} className="pt-2 space-y-2 animate-fade-in">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  Enter your Gmail Address:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={gmailEmail}
                      onChange={(e) => setGmailEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs placeholder-slate-500 focus:outline-none min-h-[40px] ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600 font-medium' : 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowGmailInput(true)}
                  className={`text-[11px] font-semibold underline transition ${
                    isLight ? 'text-slate-700 hover:text-emerald-800' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  Or enter your @gmail.com address directly
                </button>
              </div>
            )}
          </div>

          {/* Saved Gmail Accounts List on this Device */}
          {savedAccounts.length > 0 && (
            <div className={`p-3 border rounded-xl space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}>
              <div className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider ${
                isLight ? 'text-slate-800' : 'text-slate-300'
              }`}>
                <History className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                <span>Saved Accounts on this Device</span>
              </div>
              <div className="space-y-1.5">
                {savedAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSelectExistingAccount(account)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between group transition ${
                      isLight
                        ? 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-400'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-emerald-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {account.profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {account.profile.name}
                        </div>
                        <div className={`text-[10px] truncate ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                          {account.email} • {account.messages.length} chat history item(s)
                        </div>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold group-hover:underline shrink-0 ${
                      isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}>
                      Switch to →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isLight ? 'border-slate-300' : 'border-slate-800'}`}></div>
            </div>
            <span className={`relative px-3 text-[11px] uppercase tracking-wider font-extrabold ${
              isLight ? 'bg-white text-slate-700' : 'bg-slate-900 text-slate-500'
            }`}>
              Or Enter Custom Patient Name
            </span>
          </div>

          {/* Custom Patient Sign-In Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Patient Name (e.g. Alex Morgan)"
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none transition min-h-[42px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600 font-medium'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                  }`}
                />
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customAge}
                  onChange={(e) => setCustomAge(e.target.value)}
                  placeholder="Age (Years)"
                  className={`w-full px-3 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none transition min-h-[42px] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-600 font-medium'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {errorMsg && <p className="text-xs text-amber-600 font-bold">{errorMsg}</p>}

            <button
              type="submit"
              className={`w-full py-2.5 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition min-h-[42px] border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Continue with Name</span>
            </button>
          </form>

          <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700 font-medium' : 'bg-slate-950/80 border-slate-800/80 text-slate-400'
          }`}>
            <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
            <p>
              Your Google / Gmail profile selection is automatically saved in local session storage so returning to Care AI is seamless and personalized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


