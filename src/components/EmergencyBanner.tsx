import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, X, HeartHandshake } from 'lucide-react';
import { EMERGENCY_ALERT_TEXT } from '../utils/emergency';

interface EmergencyBannerProps {
  theme?: 'dark' | 'light';
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ theme = 'dark', onDismiss }) => {
  const isLight = theme === 'light';

  return (
    <div className={`w-full rounded-2xl p-4 sm:p-5 border-2 shadow-2xl animate-bounce-subtle mb-6 ${
      isLight
        ? 'bg-red-50 border-red-600 text-red-950 shadow-red-200/60'
        : 'bg-red-950/90 border-red-600 text-white shadow-red-950/80'
    }`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-900/40 animate-pulse">
          <AlertOctagon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
              isLight
                ? 'bg-red-100 text-red-900 border-red-300'
                : 'bg-red-900/60 text-red-300 border-red-500/40'
            }`}>
              High-Priority Safety Override
            </span>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`p-1 rounded-lg transition text-xs ${
                  isLight ? 'text-red-800 hover:text-red-950 hover:bg-red-100' : 'text-red-300 hover:text-white hover:bg-red-900/40'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className={`text-sm sm:text-base font-extrabold leading-snug ${
            isLight ? 'text-red-950' : 'text-red-100'
          }`}>
            {EMERGENCY_ALERT_TEXT}
          </p>

          {/* Direct Emergency Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href="tel:911"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 911 Immediately</span>
            </a>

            <a
              href="tel:988"
              className={`flex items-center gap-2 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition border ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-red-950 border-red-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-red-200 border-red-700/60'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-red-600" />
              <span>988 Mental Health Lifeline</span>
            </a>

            <a
              href="https://www.google.com/maps/search/nearest+emergency+room+hospital"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 font-semibold text-xs px-3 py-2 rounded-xl transition border ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>Find Nearest ER</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
