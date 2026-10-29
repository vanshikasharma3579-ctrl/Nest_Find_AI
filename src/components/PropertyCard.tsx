import React, { useState } from 'react';
import { Property } from '../types';
import {
  Heart,
  Calendar,
  Sparkles,
  BedDouble,
  Bath,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ExternalLink,
  MapPin,
  Check,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  onScheduleTour: (property: Property) => void;
  onOpenDetails: (property: Property) => void;
  onOpenCalculator: (property: Property) => void;
  matchReasonOverride?: string;
  compact?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onScheduleTour,
  onOpenDetails,
  onOpenCalculator,
  matchReasonOverride,
  compact = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* Property Image Header with Carousel */}
      <div className="relative aspect-16/10 sm:aspect-16/9 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onOpenDetails(property)}>
        <img
          src={property.images[currentImageIndex] || property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

        {/* Image navigation arrows */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs ${
                property.rentOrBuy === 'buy'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-700 text-white'
              }`}
            >
              {property.rentOrBuy === 'buy' ? 'For Sale' : 'For Rent'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/50 text-white backdrop-blur-sm">
              {property.propertyType}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(property.id);
              }}
              title={isCompared ? 'Remove from comparison' : 'Compare property'}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                isCompared
                  ? 'bg-indigo-600 text-white'
                  : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isCompared ? 'opacity-100' : 'opacity-70'}`} />
            </button>

            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(property.id);
              }}
              aria-label="Save to favorites"
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved ? 'text-rose-500 fill-rose-500' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Price & Location in Image Footer */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-baseline justify-between">
            <span className="font-editorial text-2xl font-bold tracking-tight drop-shadow-sm">
              {property.priceDisplay}
            </span>
            <span className="text-xs text-slate-200 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
              Est. ${property.estMonthlyPayment.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Property Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Neighborhood */}
          <div className="cursor-pointer mb-2" onClick={() => onOpenDetails(property)}>
            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">
                {property.neighborhood}, {property.city}, {property.state}
              </span>
            </div>
          </div>

          {/* Specs Row */}
          <div className="grid grid-cols-3 gap-2 py-2.5 my-2 border-y border-slate-100 text-slate-700 text-xs">
            <div className="flex items-center gap-1.5 font-medium">
              <BedDouble className="w-4 h-4 text-emerald-600" />
              <span>{property.beds} Beds</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Bath className="w-4 h-4 text-emerald-600" />
              <span>{property.baths} Baths</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Lifestyle "Why it fits you" Callout */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 my-2.5">
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-900">Why it fits your lifestyle: </span>
                <span className="text-emerald-800">
                  {matchReasonOverride || property.lifestyleFitReason}
                </span>
              </div>
            </div>
          </div>

          {/* Key Highlight Bullets */}
          {!compact && (
            <div className="space-y-1 mb-3">
              {property.highlights.slice(0, 2).map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="line-clamp-1">{highlight}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 mt-auto">
          <button
            onClick={() => onScheduleTour(property)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:shadow-emerald-600/20 active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Tour</span>
          </button>

          <button
            onClick={() => onOpenCalculator(property)}
            title="Calculate monthly payment"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenDetails(property)}
            title="View complete property specs"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
