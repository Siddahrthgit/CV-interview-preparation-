import React from 'react';
import { Briefcase, Sparkles, RotateCcw, Award } from 'lucide-react';

interface HeaderProps {
  hasCV: boolean;
  onReset: () => void;
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasCV, onReset, onOpenUpload }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">PrepCraft AI</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3" /> Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">CV Matching & Personalized Interview Practice</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {hasCV && (
            <>
              <button
                onClick={onOpenUpload}
                id="btn-switch-cv"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Change CV
              </button>
              <button
                onClick={onReset}
                id="btn-reset-session"
                title="Reset session"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-600 font-medium">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>AI Feedback & Scoring</span>
          </div>
        </div>
      </div>
    </header>
  );
};
