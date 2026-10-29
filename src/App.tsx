import React, { useState, useEffect } from 'react';
import { Property, BuyerProfile, ChatMessage, TourBooking } from './types';
import { sampleProperties } from './data/properties';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { BuyerProfilePanel } from './components/BuyerProfilePanel';
import { CuratedMatchesTab } from './components/CuratedMatchesTab';
import { ScheduleTourModal } from './components/ScheduleTourModal';
import { AgentConsultationModal } from './components/AgentConsultationModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { MortgageCalculatorModal } from './components/MortgageCalculatorModal';
import { CompareModal } from './components/CompareModal';
import { SavedHomesDrawer } from './components/SavedHomesDrawer';
import { LegalDisclaimerModal } from './components/LegalDisclaimerModal';
import { MessageSquare, LayoutGrid, Calculator } from 'lucide-react';

const INITIAL_PROFILE: BuyerProfile = {
  intent: null,
  budget: null,
  maxBudgetNum: null,
  location: null,
  bedrooms: null,
  bathrooms: null,
  propertyType: null,
  mustHaves: [],
  timeline: null,
  lifestyleVibe: null,
  completionScore: 20,
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: `Hello and welcome! I'm **NestFind AI**, your personal real estate property matchmaker. My mission is to uncover what makes a home truly fit your life—from daily morning routines and neighborhood vibes to your budget and must-have spaces.

To begin our discovery journey: **Are you looking to buy your next home or find a rental, and is there a specific city or area you have your sights on?**`,
  timestamp: 'Just now',
  quickReplies: [
    "I'm looking to buy in Austin",
    'I want to rent a walkable apartment',
    'First-time buyer under $600k',
    'Relocating for family & top schools',
  ],
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>(INITIAL_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'catalog' | 'calculator'>('chat');

  // Shortlisted & Compare state
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nestfind_saved_ids');
      return stored ? JSON.parse(stored) : ['prop-austin-modern-1'];
    } catch {
      return ['prop-austin-modern-1'];
    }
  });

  const [comparedPropertyIds, setComparedPropertyIds] = useState<string[]>([]);

  // Modals state
  const [scheduledProperty, setScheduledProperty] = useState<Property | null>(null);
  const [detailedProperty, setDetailedProperty] = useState<Property | null>(null);
  const [calculatorProperty, setCalculatorProperty] = useState<Property | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Sync saved properties to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nestfind_saved_ids', JSON.stringify(savedPropertyIds));
    } catch {
      // ignore
    }
  }, [savedPropertyIds]);

  const toggleSaveProperty = (id: string) => {
    setSavedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const toggleCompareProperty = (id: string) => {
    setComparedPropertyIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], id];
      }
      return [...prev, id];
    });
  };

  // Profile update calculation
  const updateProfileFields = (updates: Partial<BuyerProfile>) => {
    setBuyerProfile((prev) => {
      const next = { ...prev, ...updates };
      let filledCount = 0;
      if (next.intent) filledCount += 1;
      if (next.budget) filledCount += 1;
      if (next.location) filledCount += 1;
      if (next.bedrooms) filledCount += 1;
      if (next.mustHaves.length > 0) filledCount += 1;
      if (next.timeline) filledCount += 1;
      next.completionScore = Math.min(100, Math.round((filledCount / 6) * 100));
      return next;
    });
  };

  // Send message to backend Gemini assistant
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          currentProfile: buyerProfile,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedPropertyIds: data.metadata?.recommendedPropertyIds || [],
        quickReplies: data.metadata?.suggestedReplies || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Apply profile updates from server
      if (data.metadata?.profileUpdate) {
        updateProfileFields(data.metadata.profileUpdate);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `I'm analyzing your preferences! Based on your criteria, let's explore options in Austin or your target market. What price ceiling or special amenity (like a fenced yard for pets or dedicated office) would make this search perfect for you?`,
        timestamp: 'Just now',
        quickReplies: ['$500k – $650k range', 'Need a yard for my dog', 'Home office space', 'Show me top matches'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTourBooked = (booking: TourBooking) => {
    const confirmationText = `🎉 **Tour Confirmed!** I have reserved your ${
      booking.tourType === 'in_person' ? 'in-person viewing' : 'live virtual walkthrough'
    } for **${booking.propertyTitle}** on **${booking.date}** at **${booking.timeSlot}** with licensed advisor **${
      booking.agent.name
    }** (${booking.agent.phone}). A calendar invite has been dispatched to ${booking.buyerEmail}.`;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-booking-${Date.now()}`,
        sender: 'assistant',
        text: confirmationText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          'What questions should I ask during the tour?',
          'Show me similar homes in the area',
          'Calculate mortgage with 15% down',
        ],
      },
    ]);
  };

  const handleAgentBooked = (note: string) => {
    setIsConsultationOpen(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-agent-${Date.now()}`,
        sender: 'assistant',
        text: `🤝 ${note}\n\nOur licensed partner is preparing your customized neighborhood comp report. In the meantime, feel free to continue discovering homes or refining your must-haves!`,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setBuyerProfile(INITIAL_PROFILE);
  };

  const savedPropertiesList = sampleProperties.filter((p) => savedPropertyIds.includes(p.id));
  const comparedPropertiesList = sampleProperties.filter((p) =>
    comparedPropertyIds.includes(p.id)
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Application Header */}
      <Header
        savedCount={savedPropertyIds.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        compareCount={comparedPropertyIds.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenConsultation={() => setIsConsultationOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
        {/* View Switcher Tabs (Chat vs Curated Catalog vs Mortgage Calculator) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Matchmaker Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Curated Property Inventory</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                {sampleProperties.length}
              </span>
            </button>

            <button
              onClick={() => {
                setCalculatorProperty(sampleProperties[0]);
                setActiveTab('calculator');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Payment Calculator</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Consultative Matchmaker Active</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[640px]">
            {/* Left 8 Cols: Conversational Assistant */}
            <div className="lg:col-span-8 flex flex-col h-[720px]">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                buyerProfile={buyerProfile}
                allProperties={sampleProperties}
                savedPropertyIds={savedPropertyIds}
                comparedPropertyIds={comparedPropertyIds}
                onToggleSave={toggleSaveProperty}
                onToggleCompare={toggleCompareProperty}
                onScheduleTour={(p) => setScheduledProperty(p)}
                onOpenDetails={(p) => setDetailedProperty(p)}
                onOpenCalculator={(p) => setCalculatorProperty(p)}
                onOpenConsultation={() => setIsConsultationOpen(true)}
                onResetChat={handleResetChat}
              />
            </div>

            {/* Right 4 Cols: Live Buyer Profile Drawer & Quick Match Suggestions */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <BuyerProfilePanel
                profile={buyerProfile}
                onUpdateProfile={updateProfileFields}
                onRequestMatches={() =>
                  handleSendMessage('Based on my current buyer profile, please pitch 2 to 3 top matches!')
                }
              />

              {/* Quick Shortlist Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Shortlisted Properties ({savedPropertiesList.length})
                  </h4>
                  <button
                    onClick={() => setIsSavedDrawerOpen(true)}
                    className="text-[11px] text-emerald-700 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {savedPropertiesList.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No homes saved yet. Heart any suggestion to build your shortlist.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedPropertiesList.slice(0, 2).map((prop) => (
                      <div
                        key={prop.id}
                        onClick={() => setDetailedProperty(prop)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-slate-100 transition-colors"
                      >
                        <img
                          src={prop.images[0]}
                          alt={prop.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{prop.title}</div>
                          <div className="text-[11px] text-slate-500">{prop.priceDisplay}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <CuratedMatchesTab
            properties={sampleProperties}
            buyerProfile={buyerProfile}
            savedPropertyIds={savedPropertyIds}
            comparedPropertyIds={comparedPropertyIds}
            onToggleSave={toggleSaveProperty}
            onToggleCompare={toggleCompareProperty}
            onScheduleTour={(p) => setScheduledProperty(p)}
            onOpenDetails={(p) => setDetailedProperty(p)}
            onOpenCalculator={(p) => setCalculatorProperty(p)}
          />
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-3xl mx-auto w-full">
            <MortgageCalculatorModal
              property={calculatorProperty}
              onClose={() => setActiveTab('chat')}
            />
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      {scheduledProperty && (
        <ScheduleTourModal
          property={scheduledProperty}
          onClose={() => setScheduledProperty(null)}
          onConfirmBooking={(b) => {
            handleTourBooked(b);
          }}
        />
      )}

      {detailedProperty && (
        <PropertyDetailModal
          property={detailedProperty}
          onClose={() => setDetailedProperty(null)}
          isSaved={savedPropertyIds.includes(detailedProperty.id)}
          onToggleSave={toggleSaveProperty}
          onScheduleTour={(p) => {
            setDetailedProperty(null);
            setScheduledProperty(p);
          }}
          onOpenCalculator={(p) => {
            setDetailedProperty(null);
            setCalculatorProperty(p);
          }}
        />
      )}

      {calculatorProperty && activeTab !== 'calculator' && (
        <MortgageCalculatorModal
          property={calculatorProperty}
          onClose={() => setCalculatorProperty(null)}
        />
      )}

      {isConsultationOpen && (
        <AgentConsultationModal
          onClose={() => setIsConsultationOpen(false)}
          onBookedMessage={handleAgentBooked}
        />
      )}

      {isCompareModalOpen && (
        <CompareModal
          properties={comparedPropertiesList}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveFromCompare={toggleCompareProperty}
          onScheduleTour={(p) => {
            setIsCompareModalOpen(false);
            setScheduledProperty(p);
          }}
        />
      )}

      {isSavedDrawerOpen && (
        <SavedHomesDrawer
          savedProperties={savedPropertiesList}
          onClose={() => setIsSavedDrawerOpen(false)}
          onRemoveSaved={toggleSaveProperty}
          onScheduleTour={(p) => {
            setIsSavedDrawerOpen(false);
            setScheduledProperty(p);
          }}
          onOpenDetails={(p) => {
            setIsSavedDrawerOpen(false);
            setDetailedProperty(p);
          }}
        />
      )}

      {isDisclaimerOpen && (
        <LegalDisclaimerModal onClose={() => setIsDisclaimerOpen(false)} />
      )}
    </div>
  );
}
