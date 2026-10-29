import React from 'react';
import { Home, Sparkles, Heart, Scale, UserCheck, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenConsultation: () => void;
  onOpenDisclaimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  compareCount,
  onOpenCompare,
  onOpenConsultation,
  onOpenDisclaimer,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-1 ring-emerald-500/30">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-xl font-bold tracking-tight text-slate-900">
                NestFind <span className="text-emerald-600 font-sans font-bold">AI</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                Property Matchmaker
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Lifestyle-First Real Estate Discovery & Licensed Agent Network
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Compare Button */}
          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
              title="Compare selected homes"
            >
              <Scale className="w-3.5 h-3.5 text-slate-600" />
              <span>Compare</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-white text-[10px]">
                {compareCount}
              </span>
            </button>
          )}

          {/* Favorites Button */}
          <button
            onClick={onOpenSaved}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          >
            <Heart className={`w-3.5 h-3.5 ${savedCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
            <span className="hidden md:inline">Saved</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Speak with Agent CTA */}
          <button
            onClick={onOpenConsultation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Talk to a Licensed Agent</span>
            <span className="sm:hidden">Agent</span>
          </button>

          {/* Legal / Guardrails Info */}
          <button
            onClick={onOpenDisclaimer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="AI Matchmaker & Legal Disclaimer"
            aria-label="Legal & Privacy Disclaimer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
