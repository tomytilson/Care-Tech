import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, Copy, Check, Download, ShieldAlert, Trash2, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { ChatMessage, PatientProfile } from '../types';
import { isEmergencyQuery } from '../utils/emergency';
import { EmergencyBanner } from './EmergencyBanner';

interface ChatWindowProps {
  profile: PatientProfile | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  theme?: 'dark' | 'light';
  onClearHistory: () => void;
  onOpenProfile: () => void;
  onOpenPlan: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  profile,
  messages,
  onSendMessage,
  isLoading,
  theme = 'dark',
  onClearHistory,
  onOpenProfile,
  onOpenPlan,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localEmergencyActive, setLocalEmergencyActive] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, localEmergencyActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const query = inputText.trim();
    setInputText('');

    if (isEmergencyQuery(query)) {
      setLocalEmergencyActive(true);
    }

    await onSendMessage(query);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isLoading) return;
    if (isEmergencyQuery(prompt)) {
      setLocalEmergencyActive(true);
    }
    await onSendMessage(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportText = () => {
    const header = `CARE AI - HEALTH & WELLNESS CHAT SUMMARY\nPatient: ${profile?.name || 'Anonymous'} (${profile?.age || 'N/A'} yrs)\nDate: ${new Date().toLocaleString()}\n\n`;
    const body = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n`)
      .join('\n----------------------------------------\n');
    const fullContent = header + body;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `care-ai-chat-${profile?.name?.toLowerCase().replace(/\s+/g, '-') || 'patient'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDeleteHistory = () => {
    onClearHistory();
    setShowConfirmDelete(false);
  };

  // Generate dynamic contextual prompt suggestions based on patient profile
  const generateSuggestedPrompts = () => {
    if (!profile) return ['How can I boost my daily energy safely?', 'What are simple exercises for better sleep?'];
    const prompts: string[] = [];

    if (profile.currentSymptoms?.length) {
      prompts.push(`What holistic steps can I take for my ${profile.currentSymptoms[0]}?`);
    } else {
      prompts.push('What are 3 quick daily habits to boost my immune system?');
    }

    if (profile.allergies?.length) {
      prompts.push(`Given my ${profile.allergies[0]} allergy, what foods should I prioritize?`);
    } else {
      prompts.push('What is a healthy balanced dietary recommendation for my age?');
    }

    if (profile.healthGoals?.length) {
      prompts.push(`How can I achieve my goal to "${profile.healthGoals[0]}" safely?`);
    }

    prompts.push('Could you review my current habits and offer a wellness summary?');

    return prompts;
  };

  const suggestedPrompts = generateSuggestedPrompts();
  const hasEmergencyInMessages = messages.some((m) => m.isEmergency);
  const showEmergencyBanner = localEmergencyActive || hasEmergencyInMessages;

  return (
    <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-4 h-[calc(100dvh-5rem)] md:h-[calc(100vh-5.5rem)]">
      {/* Patient Profile Context Bar */}
      {profile && (
        <div className={`mb-2 sm:mb-3 p-2.5 sm:p-3 border rounded-xl sm:rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
            : 'bg-slate-900/90 border-slate-800 text-slate-300'
        }`}>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <User className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              {profile.name} ({profile.age}y)
            </span>
            <span className={isLight ? 'text-slate-300 hidden sm:inline' : 'text-slate-600 hidden sm:inline'}>•</span>
            <span className={`hidden sm:inline ${isLight ? 'text-emerald-800 font-semibold' : 'text-emerald-300'}`}>
              <strong>Goals:</strong> {profile.healthGoals?.slice(0, 2).join(', ') || 'General'}
            </span>
            {profile.allergies?.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isLight ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
              }`}>
                ⚠️ {profile.allergies.join(', ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <button
              onClick={onOpenPlan}
              className={`font-semibold flex items-center gap-1 hover:underline min-h-[32px] px-1 ${
                isLight ? 'text-emerald-700 hover:text-emerald-900' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wellness Plan</span>
            </button>
            <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>|</span>
            <button
              onClick={onOpenProfile}
              className={`font-medium hover:underline min-h-[32px] px-1 ${
                isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* Emergency Banner Alert */}
      {showEmergencyBanner && (
        <EmergencyBanner theme={theme} onDismiss={() => setLocalEmergencyActive(false)} />
      )}

      {/* Main Chat Messages Container */}
      <div className={`flex-1 border rounded-2xl p-3 sm:p-5 overflow-y-auto space-y-4 min-h-0 transition-colors ${
        isLight
          ? 'bg-slate-50/70 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-slate-900/70 border-slate-800/90 text-slate-100 shadow-inner'
      }`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shadow-md ${
              isLight
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-400 shadow-emerald-950/40'
            }`}>
              <Bot className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Welcome to Care AI, {profile?.name || 'Patient'}!
              </h3>
              <p className={`text-xs max-w-md mt-1 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                Ask any health, symptom, dietary, or wellness question. Care AI personalized responses based on your active profile.
              </p>
            </div>

            {/* Quick Starter Prompts */}
            <div className="w-full max-w-lg text-left space-y-2 pt-2">
              <p className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-500'}`}>
                Suggested Questions For Your Profile:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className={`p-3 border rounded-xl text-left text-xs transition flex items-center justify-between group min-h-[44px] ${
                      isLight
                        ? 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-400 text-slate-800 hover:text-emerald-950 font-medium shadow-sm'
                        : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300'
                    }`}
                  >
                    <span className="pr-2">{prompt}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-400 group-hover:text-emerald-700' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            const isEmergencyMsg = msg.isEmergency;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 text-sm animate-fade-in ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {isAssistant && (
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isEmergencyMsg
                        ? 'bg-red-600 text-white'
                        : isLight
                        ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold'
                        : 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                    }`}
                  >
                    {isEmergencyMsg ? (
                      <ShieldAlert className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-sm relative group ${
                    isAssistant
                      ? isEmergencyMsg
                        ? isLight
                          ? 'bg-red-50 border-2 border-red-600 text-red-950 font-medium'
                          : 'bg-red-950/90 border-2 border-red-600 text-red-100'
                        : isLight
                        ? 'bg-white border border-slate-200 text-slate-900 shadow-md'
                        : 'bg-slate-950/90 border border-slate-800 text-slate-200'
                      : isLight
                      ? 'bg-emerald-700 text-white font-semibold shadow-md'
                      : 'bg-emerald-600 text-white font-medium shadow-emerald-950/50'
                  }`}
                >
                  {isAssistant ? (
                    <div>
                      <div className={`flex items-center justify-between mb-2 text-[10px] border-b pb-1.5 ${
                        isLight ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-slate-800/80'
                      }`}>
                        <span className={`font-extrabold tracking-wider uppercase flex items-center gap-1 ${
                          isLight ? 'text-emerald-800' : 'text-emerald-400'
                        }`}>
                          Care AI Coach
                          {msg.metadata?.riskLevel === 'emergency' && (
                            <span className="text-red-600 font-extrabold ml-1">🚨 EMERGENCY ALERT</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>{msg.timestamp}</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            title="Copy response"
                            className={`transition p-1 ${isLight ? 'hover:text-emerald-700 text-slate-500' : 'hover:text-emerald-400 text-slate-400'}`}
                          >
                            {copiedId === msg.id ? (
                              <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className={`markdown-body text-xs sm:text-sm leading-relaxed space-y-2 ${
                        isLight ? 'light text-slate-900' : 'text-slate-200'
                      }`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={`text-[10px] mb-1 text-right ${isLight ? 'text-emerald-100 font-medium' : 'text-emerald-100/70'}`}>
                        {msg.timestamp}
                      </div>
                      <p className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</p>
                    </div>
                  )}
                </div>

                {!isAssistant && (
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-extrabold flex items-center justify-center shrink-0 text-xs shadow-sm ${
                    isLight ? 'bg-emerald-700 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 text-sm animate-pulse">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-950 border-emerald-800 text-emerald-400'
            }`}>
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className={`rounded-2xl p-3.5 text-xs flex items-center gap-2 border font-medium ${
              isLight ? 'bg-white border-slate-200 text-emerald-900 shadow-sm' : 'bg-slate-950/90 border-slate-800 text-emerald-300'
            }`}>
              <Sparkles className={`w-4 h-4 animate-spin ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
              <span>Care AI is reviewing your profile & generating advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Quick Row */}
      {messages.length > 0 && !isLoading && (
        <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
            isLight ? 'text-slate-700' : 'text-slate-500'
          }`}>
            Follow-up:
          </span>
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className={`text-[11px] whitespace-nowrap border px-3 py-1 rounded-full font-medium transition ${
                isLight
                  ? 'bg-white hover:bg-emerald-50 border-slate-300 hover:border-emerald-400 text-slate-800 hover:text-emerald-950 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box & Toolbar Area */}
      <form onSubmit={handleSubmit} className="mt-2 shrink-0">
        <div className={`flex items-center gap-2 border rounded-2xl p-1.5 sm:p-2 shadow-xl transition ${
          isLight
            ? 'bg-white border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-slate-200/60'
            : 'bg-slate-900 border-slate-800 focus-within:border-emerald-500 shadow-xl'
        }`}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask Care AI about health, symptoms, diet, or wellness...`}
            className={`flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm focus:outline-none min-h-[40px] ${
              isLight ? 'text-slate-900 placeholder-slate-500 font-medium' : 'text-white placeholder-slate-500'
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`px-3.5 sm:px-4 py-2 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition shrink-0 min-h-[40px] border ${
              isLight
                ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white border-emerald-700 shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white border-transparent shadow-lg shadow-emerald-950/50'
            }`}
          >
            <span className="hidden sm:inline">Ask Care AI</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Utility Bar with Delete Chat History Button */}
        <div className={`mt-2 flex items-center justify-between text-[11px] px-1 ${
          isLight ? 'text-slate-600 font-medium' : 'text-slate-500'
        }`}>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline">💡 Profile-aware medical AI assistant</span>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleExportText}
                className={`flex items-center gap-1 transition py-1 font-semibold ${
                  isLight ? 'hover:text-emerald-800 text-slate-700' : 'hover:text-emerald-400 text-slate-400'
                }`}
              >
                <Download className="w-3 h-3" /> Export Summary
              </button>
            )}
          </div>

          {/* Delete All Chat History Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold transition ${
                isLight
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                  : 'bg-red-950/40 hover:bg-red-900/60 border-red-900/50 text-red-400 hover:text-red-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Chat History</span>
            </button>
          )}
        </div>
      </form>

      {/* Delete Chat Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Delete Chat History?</h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  This will permanently delete all messages from this session.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition min-h-[40px] border ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-transparent'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHistory}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition min-h-[40px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

