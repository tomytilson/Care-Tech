import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SignInModal } from './components/SignInModal';
import { PatientProfileForm } from './components/PatientProfileForm';
import { ChatWindow } from './components/ChatWindow';
import { WellnessPlanModal } from './components/WellnessPlanModal';
import { FooterDisclaimer } from './components/FooterDisclaimer';
import { PatientProfile, ChatMessage, DailyWellnessPlan } from './types';
import { isEmergencyQuery, EMERGENCY_ALERT_TEXT } from './utils/emergency';
import {
  savePatientAccount,
  loadPatientAccount,
  getActivePatientEmail,
  setActivePatientEmail,
} from './utils/patientStorage';
import { Sparkles, Edit3, MessageSquarePlus, X, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_PROFILE = 'care_ai_patient_profile_v1';
const STORAGE_KEY_CHAT = 'care_ai_chat_messages_v1';

export default function App() {
  const [profile, setProfile] = useState<PatientProfile | null>(() => {
    try {
      const activeEmail = getActivePatientEmail();
      if (activeEmail) {
        const savedAccount = loadPatientAccount(activeEmail);
        if (savedAccount) return savedAccount.profile;
      }
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved profile:', e);
    }
    return {
      id: 'patient-default',
      name: 'Patient User',
      age: 30,
      healthGoals: ['Maintain energy', 'Optimize sleep'],
      allergies: [],
      dietaryNotes: [],
      sleepHours: 7.5,
      exerciseHabits: 'Moderate exercise 3x a week',
      currentSymptoms: [],
    };
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const activeEmail = getActivePatientEmail();
      if (activeEmail) {
        const savedAccount = loadPatientAccount(activeEmail);
        if (savedAccount) return savedAccount.messages;
      }
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved chat:', e);
    }
    return [];
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [wellnessPlan, setWellnessPlan] = useState<DailyWellnessPlan | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLight = theme === 'light';

  // Returning user greeting banner state
  const [welcomeBanner, setWelcomeBanner] = useState<{
    show: boolean;
    name: string;
    email?: string;
  }>({ show: false, name: '' });

  // Save profile and messages to Gmail-indexed storage & localStorage whenever updated
  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      if (profile.email) {
        savePatientAccount(profile.email, profile, messages);
      }
    }
  }, [profile, messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
  }, [messages]);

  const handleSelectProfile = (
    newProfile: PatientProfile,
    history?: ChatMessage[],
    isReturningUser?: boolean
  ) => {
    setProfile(newProfile);
    if (history) {
      setMessages(history);
    } else if (!isReturningUser) {
      setMessages([]);
    }

    if (newProfile.email) {
      setActivePatientEmail(newProfile.email);
      savePatientAccount(newProfile.email, newProfile, history || messages);
    }

    setIsSignInOpen(false);

    if (isReturningUser) {
      // Returning user logic: display "Welcome Back, [Name]!" toast banner
      setWelcomeBanner({
        show: true,
        name: newProfile.name,
        email: newProfile.email,
      });
    } else {
      // New account sign-in: open health preferences pop up
      setIsProfileFormOpen(true);
    }
  };

  const handleSaveProfile = (updatedProfile: PatientProfile) => {
    setProfile(updatedProfile);
    if (updatedProfile.email) {
      savePatientAccount(updatedProfile.email, updatedProfile, messages);
    }
  };

  const HIGH_TRAFFIC_ALERT = "⚠️ Care AI is experiencing high traffic right now. Please wait a few seconds and try clicking 'Ask Care AI' again!";

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Fast path emergency check
      if (isEmergencyQuery(text)) {
        clearTimeout(timeoutId);
        const emergencyMsg: ChatMessage = {
          id: `msg-resp-${Date.now()}`,
          role: 'assistant',
          content: EMERGENCY_ALERT_TEXT,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergency: true,
          metadata: {
            riskLevel: 'emergency',
          },
        };
        setMessages((prev) => [...prev, emergencyMsg]);
        setIsLoading(false);
        return;
      }

      // Backend API call with 15s timeout
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: messages,
          profile,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || HIGH_TRAFFIC_ALERT);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: data.content || EMERGENCY_ALERT_TEXT,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: data.isEmergency || false,
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Chat error:', err);

      const errorAlertText = (err.name === 'AbortError' || err.message?.includes('traffic') || err.message?.includes('503'))
        ? HIGH_TRAFFIC_ALERT
        : HIGH_TRAFFIC_ALERT;

      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: errorAlertText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY_CHAT);
  };

  const handleGeneratePlan = async () => {
    setIsPlanOpen(true);
    setIsPlanLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ profile }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || HIGH_TRAFFIC_ALERT);
      }

      setWellnessPlan(data);
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error('Plan generation failed:', e);
      setWellnessPlan({
        title: `Care AI Daily Plan for ${profile?.name || 'Patient'}`,
        summary: HIGH_TRAFFIC_ALERT,
        morningRoutine: ['Hydrate with 16oz lukewarm water', '10-minute light stretching or breathing exercise', 'Protein-rich breakfast avoiding known allergens'],
        afternoonRoutine: ['20-minute brisk walk outdoor for natural sunlight', 'Hydration break', 'Posture reset'],
        eveningRoutine: ['Screen time wind-down 45 mins before bed', 'Warm chamomile tea', 'Deep diaphragmatic breathing'],
        nutritionTips: [`Check ingredients to avoid ${profile?.allergies?.join(', ') || 'allergens'}`, 'Aim for 8-10 glasses of water throughout the day'],
        allergyWarnings: profile?.allergies?.length ? [`Strictly avoid ${profile.allergies.join(', ')} in meals.`] : [],
        sleepRecommendations: [`Aim for your targeted ${profile?.sleepHours || 8} hours of restorative sleep in a cool, dark room.`],
      });
    } finally {
      setIsPlanLoading(false);
    }
  };

  const handleTriggerEmergencyTest = () => {
    handleSendMessage('I am experiencing severe chest pain and difficulty breathing.');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-16 transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0d1117] text-slate-100'
    }`}>
      {/* App Top Header */}
      <Header
        profile={profile}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onOpenProfile={() => setIsProfileFormOpen(true)}
        onOpenPlan={handleGeneratePlan}
        onTriggerEmergencyTest={handleTriggerEmergencyTest}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area: Screen 3 Interactive Chat & Triage */}
      <main className="flex-1 flex flex-col">
        {/* RETURNING USER LOGIC: Welcome Back Banner */}
        {welcomeBanner.show && (
          <div className="max-w-5xl mx-auto w-full px-2 sm:px-4 mt-2">
            <div className={`border rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in relative ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-slate-900'
                : 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border-emerald-600/50 text-slate-100'
            }`}>
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                }`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-sm sm:text-base font-extrabold flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    Welcome Back, {welcomeBanner.name}!
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                    We've restored your personalized health profile & past conversation history for{' '}
                    <span className={`font-bold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>{welcomeBanner.email}</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                <button
                  onClick={() => {
                    setWelcomeBanner({ ...welcomeBanner, show: false });
                    setIsProfileFormOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Stored Profile</span>
                </button>

                <button
                  onClick={() => {
                    handleClearHistory();
                    setWelcomeBanner({ ...welcomeBanner, show: false });
                  }}
                  className={`flex-1 sm:flex-none px-3 py-1.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition min-h-[36px] border ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent'
                  }`}
                >
                  <MessageSquarePlus className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                  <span>New Health Inquiry</span>
                </button>

                <button
                  onClick={() => setWelcomeBanner({ ...welcomeBanner, show: false })}
                  className={`p-1.5 rounded-lg transition ${
                    isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <ChatWindow
          profile={profile}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onClearHistory={handleClearHistory}
          onOpenProfile={() => setIsProfileFormOpen(true)}
          onOpenPlan={handleGeneratePlan}
          theme={theme}
        />
      </main>

      {/* Screen 1: Sign-In & Profile Selection Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        currentProfile={profile}
        onSelectProfile={handleSelectProfile}
        onClose={() => setIsSignInOpen(false)}
        theme={theme}
      />

      {/* Screen 2: Patient Profile Form Modal */}
      <PatientProfileForm
        isOpen={isProfileFormOpen}
        profile={profile}
        onSave={handleSaveProfile}
        onClose={() => setIsProfileFormOpen(false)}
        theme={theme}
      />

      {/* Wellness Plan Modal */}
      <WellnessPlanModal
        isOpen={isPlanOpen}
        plan={wellnessPlan}
        profile={profile}
        isLoading={isPlanLoading}
        onClose={() => setIsPlanOpen(false)}
        onRegenerate={handleGeneratePlan}
        theme={theme}
      />

      {/* Mandatory Fixed Footer Disclaimer */}
      <FooterDisclaimer />
    </div>
  );
}
