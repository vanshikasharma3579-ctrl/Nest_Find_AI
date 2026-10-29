export type IntentType = 'buy' | 'rent';

export interface AgentInfo {
  name: string;
  role: string;
  agency: string;
  photo: string;
  phone: string;
  email: string;
  rating: number;
  reviewsCount: number;
  licenseNumber: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  priceDisplay: string;
  rentOrBuy: IntentType;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: 'Single Family' | 'Townhouse' | 'Condo' | 'Penthouse' | 'Craftsman' | 'Modern Loft';
  yearBuilt: number;
  hoaMonthly: number;
  estMonthlyPayment: number;
  images: string[];
  highlights: string[];
  lifestyleFitReason: string;
  walkScore: number;
  transitScore: number;
  schoolRating: number;
  amenities: string[];
  agent: AgentInfo;
  virtualTourAvailable: boolean;
  status: 'Active' | 'New Listing' | 'Price Improved' | 'Hot';
}

export interface BuyerProfile {
  intent: IntentType | null;
  budget: string | null;
  maxBudgetNum: number | null;
  location: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  propertyType: string | null;
  mustHaves: string[];
  timeline: string | null;
  lifestyleVibe: string | null;
  completionScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  matchedPropertyIds?: string[];
  quickReplies?: string[];
  buyerProfileUpdate?: Partial<BuyerProfile>;
  isStreaming?: boolean;
}

export interface TourBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: string;
  propertyAddress: string;
  propertyImage: string;
  date: string;
  timeSlot: string;
  tourType: 'in_person' | 'virtual';
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  notes?: string;
  agent: AgentInfo;
  createdAt: string;
}
