import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 px-4 text-center backdrop-blur-md shadow-2xl h-[50px] flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs text-amber-300/90 font-medium">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <p className="leading-snug">
          <strong>⚠️ Care AI</strong> is an educational prototype. It does not provide professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
        </p>
      </div>
    </footer>
  );
};
