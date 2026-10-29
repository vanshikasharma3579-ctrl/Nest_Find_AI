import React, { useState, useMemo } from 'react';
import { Property, BuyerProfile } from '../types';
import { PropertyCard } from './PropertyCard';
import { Search, SlidersHorizontal } from 'lucide-react';

interface CuratedMatchesTabProps {
  properties: Property[];
  buyerProfile: BuyerProfile;
  savedPropertyIds: string[];
  comparedPropertyIds: string[];
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onScheduleTour: (property: Property) => void;
  onOpenDetails: (property: Property) => void;
  onOpenCalculator: (property: Property) => void;
}

export const CuratedMatchesTab: React.FC<CuratedMatchesTabProps> = ({
  properties,
  buyerProfile,
  savedPropertyIds,
  comparedPropertyIds,
  onToggleSave,
  onToggleCompare,
  onScheduleTour,
  onOpenDetails,
  onOpenCalculator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'rent'>('all');
  const [amenityFilter, setAmenityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'price_asc' | 'price_desc' | 'sqft'>('match');

  // Compute matched properties
  const filteredAndSorted = useMemo(() => {
    return properties
      .filter((p) => {
        // Intent filter
        if (filterType !== 'all' && p.rentOrBuy !== filterType) return false;

        // Amenity filter
        if (amenityFilter === 'yard' && !p.amenities.some((a) => a.toLowerCase().includes('yard'))) {
          return false;
        }
        if (amenityFilter === 'office' && !p.amenities.some((a) => a.toLowerCase().includes('office'))) {
          return false;
        }
        if (amenityFilter === 'pool' && !p.amenities.some((a) => a.toLowerCase().includes('pool'))) {
          return false;
        }
        if (amenityFilter === 'schools' && p.schoolRating < 8) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          const matchNeigh = p.neighborhood.toLowerCase().includes(q);
          const matchAmenity = p.amenities.some((a) => a.toLowerCase().includes(q));
          if (!matchTitle && !matchCity && !matchNeigh && !matchAmenity) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'sqft') return b.sqft - a.sqft;

        // Match sorting: prioritize location match & user must-haves
        let scoreA = 0;
        let scoreB = 0;

        if (buyerProfile.location && a.city.toLowerCase().includes(buyerProfile.location.toLowerCase())) {
          scoreA += 10;
        }
        if (buyerProfile.location && b.city.toLowerCase().includes(buyerProfile.location.toLowerCase())) {
          scoreB += 10;
        }

        buyerProfile.mustHaves.forEach((tag) => {
          if (a.amenities.some((am) => am.toLowerCase().includes(tag.toLowerCase()))) scoreA += 5;
          if (b.amenities.some((am) => am.toLowerCase().includes(tag.toLowerCase()))) scoreB += 5;
        });

        return scoreB - scoreA;
      });
  }, [properties, filterType, amenityFilter, searchQuery, sortBy, buyerProfile]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by neighborhood, city, or feature..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs bg-slate-50/60"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-medium"
            >
              <option value="match">Lifestyle Match Score</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="sqft">Largest Sq. Footage</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Intent filters */}
          <button
            onClick={() => setFilterType('all')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilterType('buy')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
              filterType === 'buy'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            For Sale
          </button>
          <button
            onClick={() => setFilterType('rent')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
              filterType === 'rent'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            For Rent
          </button>

          <span className="h-4 w-px bg-slate-200 mx-1" />

          {/* Feature filters */}
          {[
            { id: 'yard', label: '🏡 Fenced Yard' },
            { id: 'office', label: '💼 Dedicated Office' },
            { id: 'pool', label: '🏊 Pool' },
            { id: 'schools', label: '🎓 Top Schools (8+)' },
          ].map((feat) => (
            <button
              key={feat.id}
              onClick={() => setAmenityFilter(amenityFilter === feat.id ? 'all' : feat.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                amenityFilter === feat.id
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {feat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{filteredAndSorted.length}</strong> vetted properties
        </span>
        {buyerProfile.location && (
          <span>
            Prioritizing market: <strong className="text-emerald-700">{buyerProfile.location}</strong>
          </span>
        )}
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSorted.map((prop) => (
          <PropertyCard
            key={prop.id}
            property={prop}
            isSaved={savedPropertyIds.includes(prop.id)}
            onToggleSave={onToggleSave}
            isCompared={comparedPropertyIds.includes(prop.id)}
            onToggleCompare={onToggleCompare}
            onScheduleTour={onScheduleTour}
            onOpenDetails={onOpenDetails}
            onOpenCalculator={onOpenCalculator}
          />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/90 p-6">
          <p className="text-slate-500 text-sm">No properties found matching these exact criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setAmenityFilter('all');
            }}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:underline"
          >
            Reset all search filters
          </button>
        </div>
      )}
    </div>
  );
};
