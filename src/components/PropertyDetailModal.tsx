import React, { useState } from 'react';
import { Property } from '../types';
import {
  X,
  Heart,
  Calendar,
  Calculator,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Sparkles,
  GraduationCap,
  Footprints,
  Bus,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onScheduleTour: (property: Property) => void;
  onOpenCalculator: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  isSaved,
  onToggleSave,
  onScheduleTour,
  onOpenCalculator,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const pricePerSqFt = Math.round(property.price / property.sqft);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  property.rentOrBuy === 'buy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {property.rentOrBuy === 'buy' ? 'For Sale' : 'For Rent'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {property.propertyType} • Built in {property.yearBuilt}
              </span>
            </div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {property.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(property.id)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Save property"
            >
              <Heart
                className={`w-4 h-4 ${
                  isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
              <img
                src={property.images[activePhotoIndex]}
                alt={`${property.title} photo ${activePhotoIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoIndex(
                        (prev) => (prev - 1 + property.images.length) % property.images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev + 1) % property.images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm">
                Photo {activePhotoIndex + 1} of {property.images.length}
              </div>
            </div>

            {/* Thumbnail Row */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activePhotoIndex === idx
                        ? 'border-emerald-600 scale-102 ring-2 ring-emerald-500/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Key Numbers */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-500">Listing Price</div>
              <div className="font-editorial text-2xl font-bold text-slate-900 mt-0.5">
                {property.priceDisplay}
              </div>
              {property.rentOrBuy === 'buy' && (
                <div className="text-[11px] text-slate-500 font-medium">
                  ~${pricePerSqFt}/sqft
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-500">Est. Monthly Cost</div>
              <div className="text-lg font-bold text-emerald-800 mt-0.5">
                ${property.estMonthlyPayment.toLocaleString()}/mo
              </div>
              <button
                onClick={() => onOpenCalculator(property)}
                className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1 mt-0.5"
              >
                <Calculator className="w-3 h-3" />
                <span>Payment Breakdown</span>
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-500">Bedrooms & Baths</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">
                {property.beds} Beds • {property.baths} Baths
              </div>
              <div className="text-[11px] text-slate-500">
                {property.sqft.toLocaleString()} finished sqft
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">HOA & Property Dues</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">
                ${property.hoaMonthly}/mo
              </div>
              <div className="text-[11px] text-slate-500">
                Status: <strong className="text-emerald-700">{property.status}</strong>
              </div>
            </div>
          </div>

          {/* Lifestyle Fit Reason */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Why NestFind AI Recommends This Home For You
                </h4>
                <p className="text-xs sm:text-sm text-emerald-900 mt-1 leading-relaxed">
                  {property.lifestyleFitReason}
                </p>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Key Property Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood & Scores */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Neighborhood Insights & Scores</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                <Footprints className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-slate-900">{property.walkScore}/100</div>
                <div className="text-[11px] text-slate-500 font-medium">Walk Score</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                <Bus className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-slate-900">{property.transitScore}/100</div>
                <div className="text-[11px] text-slate-500 font-medium">Transit Score</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                <GraduationCap className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-slate-900">{property.schoolRating}/10</div>
                <div className="text-[11px] text-slate-500 font-medium">School District</div>
              </div>
            </div>
          </div>

          {/* Assigned Agent Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={property.agent.photo}
                alt={property.agent.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-600/30 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{property.agent.name}</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                    Licensed Realtor®
                  </span>
                </div>
                <p className="text-xs text-slate-500">{property.agent.role}</p>
                <p className="text-xs text-slate-500">{property.agent.agency} • {property.agent.licenseNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onScheduleTour(property);
                }}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule a Tour</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>
              {property.address}, {property.neighborhood}, {property.city}, {property.state} {property.zip}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCalculator(property)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onScheduleTour(property);
              }}
              className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Viewing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
