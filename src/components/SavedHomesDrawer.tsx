import React from 'react';
import { Property } from '../types';
import { X, Heart, Calendar, Trash2, ExternalLink } from 'lucide-react';

interface SavedHomesDrawerProps {
  savedProperties: Property[];
  onClose: () => void;
  onRemoveSaved: (id: string) => void;
  onScheduleTour: (property: Property) => void;
  onOpenDetails: (property: Property) => void;
}

export const SavedHomesDrawer: React.FC<SavedHomesDrawerProps> = ({
  savedProperties,
  onClose,
  onRemoveSaved,
  onScheduleTour,
  onOpenDetails,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <div>
              <h3 className="font-bold text-base">Saved Properties</h3>
              <p className="text-xs text-slate-400">
                {savedProperties.length} homes saved to your shortlist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedProperties.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-800">No saved homes yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Click the heart icon on any suggested property card in chat or catalog to save it to your shortlist.
              </p>
            </div>
          ) : (
            savedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow flex gap-3 group"
              >
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 cursor-pointer"
                  onClick={() => onOpenDetails(prop)}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        className="font-semibold text-xs text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                        onClick={() => onOpenDetails(prop)}
                      >
                        {prop.title}
                      </h4>
                      <button
                        onClick={() => onRemoveSaved(prop.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {prop.neighborhood}, {prop.city}
                    </div>
                    <div className="font-editorial text-base font-bold text-slate-900 mt-0.5">
                      {prop.priceDisplay}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {prop.beds}b • {prop.baths}ba • {prop.sqft.toLocaleString()} sqft
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => onScheduleTour(prop)}
                      className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 transition-colors"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Tour Home</span>
                    </button>
                    <button
                      onClick={() => onOpenDetails(prop)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="View full specs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Close Shortlist
          </button>
        </div>
      </div>
    </div>
  );
};
