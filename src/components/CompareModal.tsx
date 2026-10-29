import React from 'react';
import { Property } from '../types';
import { X, Calendar, Trash2, BedDouble, Maximize2, Footprints, GraduationCap } from 'lucide-react';

interface CompareModalProps {
  properties: Property[];
  onClose: () => void;
  onRemoveFromCompare: (id: string) => void;
  onScheduleTour: (property: Property) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  properties,
  onClose,
  onRemoveFromCompare,
  onScheduleTour,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Side-by-Side Evaluation
            </span>
            <h2 className="font-editorial text-xl font-bold text-slate-900">
              Comparing {properties.length} Properties
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-x-auto">
          {properties.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No properties selected for comparison.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click the checkmark icon on any property card to compare side-by-side.
              </p>
            </div>
          ) : (
            <div className="min-w-[640px]">
              {/* Properties Grid Row */}
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(0, 1fr))` }}
              >
                {properties.map((prop) => (
                  <div key={prop.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
                    <div>
                      {/* Image & Remove */}
                      <div className="relative aspect-16/10 rounded-xl overflow-hidden mb-3">
                        <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => onRemoveFromCompare(prop.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs transition-colors"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{prop.title}</h4>
                      <div className="text-xs text-slate-500 line-clamp-1">{prop.neighborhood}, {prop.city}</div>
                      <div className="font-editorial text-xl font-bold text-slate-900 mt-1.5">
                        {prop.priceDisplay}
                      </div>
                      <div className="text-xs text-emerald-700 font-medium">
                        Est. ${prop.estMonthlyPayment.toLocaleString()}/mo
                      </div>
                    </div>

                    <button
                      onClick={() => onScheduleTour(prop)}
                      className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Tour This Home</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Specs Comparison Table */}
              <div className="mt-6 border-t border-slate-200 pt-4 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Detailed Feature Comparison
                </h3>

                {/* Specs rows */}
                {[
                  {
                    label: 'Bedrooms & Baths',
                    icon: BedDouble,
                    render: (p: Property) => `${p.beds} Beds | ${p.baths} Baths`,
                  },
                  {
                    label: 'Square Footage',
                    icon: Maximize2,
                    render: (p: Property) => `${p.sqft.toLocaleString()} sqft ($${Math.round(p.price / p.sqft)}/sqft)`,
                  },
                  {
                    label: 'Property Type',
                    render: (p: Property) => p.propertyType,
                  },
                  {
                    label: 'Walk Score',
                    icon: Footprints,
                    render: (p: Property) => `${p.walkScore} / 100`,
                  },
                  {
                    label: 'School District Rating',
                    icon: GraduationCap,
                    render: (p: Property) => `${p.schoolRating} / 10`,
                  },
                  {
                    label: 'Monthly HOA Dues',
                    render: (p: Property) => `$${p.hoaMonthly}/mo`,
                  },
                  {
                    label: 'Year Built',
                    render: (p: Property) => p.yearBuilt.toString(),
                  },
                  {
                    label: 'Lifestyle Alignment',
                    render: (p: Property) => p.lifestyleFitReason,
                  },
                ].map((row, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3 border border-slate-100 shadow-2xs">
                    <div className="text-xs font-semibold text-slate-500 mb-2">{row.label}</div>
                    <div
                      className="grid gap-4"
                      style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(0, 1fr))` }}
                    >
                      {properties.map((p) => (
                        <div key={p.id} className="text-xs text-slate-800 font-medium leading-relaxed">
                          {row.render(p)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
