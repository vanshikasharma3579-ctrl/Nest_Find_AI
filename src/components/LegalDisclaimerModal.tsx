import React from 'react';
import { X, ShieldCheck, Scale, Lock, Home } from 'lucide-react';

interface LegalDisclaimerModalProps {
  onClose: () => void;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Legal, Privacy & AI Guardrails</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Section 1: Legal & Advisory Boundary */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <Scale className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                AI Matchmaker Role & Disclaimer
              </h4>
              <p>
                <strong>NestFind AI</strong> is an intelligent discovery and property matchmaker assistant designed to help homebuyers and renters clarify lifestyle priorities and view curated property options. NestFind AI is <strong>not a licensed attorney, CPA, or financial advisor</strong>. All real estate contracts, title matters, zoning laws, and formal mortgage approvals must be reviewed and verified by qualified licensed professionals.
              </p>
            </div>
          </div>

          {/* Section 2: Data Privacy */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Data Privacy & Financial Security
              </h4>
              <p>
                NestFind AI will <strong>never request sensitive personal financial credentials</strong>, including bank account numbers, Social Security/National ID numbers, credit card details, or PINs. All budget ranges and affordability figures are strictly high-level estimates to match properties to your comfort level.
              </p>
            </div>
          </div>

          {/* Section 3: Equal Housing Opportunity */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <Home className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Equal Housing Opportunity & Fair Housing Act
              </h4>
              <p>
                NestFind AI strictly adheres to the Fair Housing Act and federal, state, and local non-discrimination guidelines. Property matching is based exclusively on user-specified physical preferences, budget ceilings, and desired lifestyle amenities without regard to race, color, religion, sex, handicap, familial status, or national origin.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
