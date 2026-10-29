import React, { useState } from 'react';
import { Property } from '../types';
import { X, Calculator, Percent, ShieldCheck } from 'lucide-react';

interface MortgageCalculatorModalProps {
  property?: Property | null;
  onClose: () => void;
}

export const MortgageCalculatorModal: React.FC<MortgageCalculatorModalProps> = ({
  property,
  onClose,
}) => {
  const initialPrice = property ? property.price : 650000;

  const [price, setPrice] = useState<number>(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [annualPropertyTaxRate, setAnnualPropertyTaxRate] = useState<number>(1.25);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1400);
  const [hoaMonthly, setHoaMonthly] = useState<number>(property?.hoaMonthly || 75);

  const downPaymentAmount = Math.round(price * (downPaymentPercent / 100));
  const loanAmount = price - downPaymentAmount;

  // Monthly Principal & Interest formula
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  const monthlyPI =
    monthlyRate > 0
      ? Math.round(
          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : Math.round(loanAmount / totalMonths);

  const monthlyPropertyTax = Math.round((price * (annualPropertyTaxRate / 100)) / 12);
  const monthlyInsurance = Math.round(annualInsurance / 12);
  const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + hoaMonthly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Monthly Payment & Mortgage Estimator</h3>
              {property && (
                <p className="text-xs text-slate-400 line-clamp-1">{property.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Total Monthly Payment Big Callout */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center">
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Estimated Total Monthly Payment
            </div>
            <div className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              ${totalMonthlyPayment.toLocaleString()}{' '}
              <span className="text-sm font-sans font-medium text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Principal, interest, estimated property taxes, insurance & HOA dues.
            </p>

            {/* Colored Segment Bar */}
            <div className="w-full h-3 bg-slate-200 rounded-full mt-4 flex overflow-hidden">
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${(monthlyPI / totalMonthlyPayment) * 100}%` }}
                title={`P&I: $${monthlyPI}`}
              />
              <div
                className="bg-teal-500 h-full"
                style={{ width: `${(monthlyPropertyTax / totalMonthlyPayment) * 100}%` }}
                title={`Tax: $${monthlyPropertyTax}`}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${(monthlyInsurance / totalMonthlyPayment) * 100}%` }}
                title={`Insurance: $${monthlyInsurance}`}
              />
              <div
                className="bg-slate-400 h-full"
                style={{ width: `${(hoaMonthly / totalMonthlyPayment) * 100}%` }}
                title={`HOA: $${hoaMonthly}`}
              />
            </div>

            {/* Bar Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] text-slate-600 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span>P&I: ${monthlyPI}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                <span>Tax: ${monthlyPropertyTax}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span>Ins: ${monthlyInsurance}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                <span>HOA: ${hoaMonthly}</span>
              </div>
            </div>
          </div>

          {/* Calculator Inputs */}
          <div className="space-y-4">
            {/* Home Price */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Home Purchase Price</span>
                <span className="text-slate-900">${price.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={200000}
                max={2500000}
                step={10000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Down Payment */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Down Payment ({downPaymentPercent}%)</span>
                <span className="text-slate-900">${downPaymentAmount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[5, 10, 20, 30].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      downPaymentPercent === pct
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate & Loan Term */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step={0.1}
                    min={2}
                    max={15}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/60 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Loan Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[30, 15].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLoanTermYears(term)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        loanTermYears === term
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {term} Yrs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Tax Rate & HOA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Est. Property Tax (%)
                </label>
                <input
                  type="number"
                  step={0.05}
                  min={0.2}
                  max={4}
                  value={annualPropertyTaxRate}
                  onChange={(e) => setAnnualPropertyTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Monthly HOA Dues ($)
                </label>
                <input
                  type="number"
                  step={10}
                  min={0}
                  max={2500}
                  value={hoaMonthly}
                  onChange={(e) => setHoaMonthly(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/60"
                />
              </div>
            </div>
          </div>

          {/* Legal Guardrail */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Legal & Financial Disclaimer:</strong> This calculator provides non-binding educational estimates only. NestFind AI is not a mortgage lender or licensed financial advisor. Consult with a qualified mortgage specialist for formal pre-approval and exact interest quotes.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
