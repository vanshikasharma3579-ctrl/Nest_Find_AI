import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Property, BuyerProfile } from '../types';
import { PropertyCard } from './PropertyCard';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ShieldAlert,
  Compass,
  RefreshCw,
  Calendar,
  PhoneCall,
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  buyerProfile: BuyerProfile;
  allProperties: Property[];
  savedPropertyIds: string[];
  comparedPropertyIds: string[];
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onScheduleTour: (property: Property) => void;
  onOpenDetails: (property: Property) => void;
  onOpenCalculator: (property: Property) => void;
  onOpenConsultation: () => void;
  onResetChat: () => void;
}

const STARTER_PROMPTS = [
  {
    icon: '🏡',
    title: 'Austin 3-Bed with Dog Yard',
    text: 'Looking to buy a 3-bedroom craftsman in Austin with a fenced yard for my dog, budget around $650,000.',
  },
  {
    icon: '🏙️',
    title: 'Downtown Walkable Rental',
    text: 'I want to rent a modern 2-bedroom loft or condo in a walkable downtown area under $3,500/month.',
  },
  {
    icon: '🌿',
    title: 'Family Home with Top Schools',
    text: 'Looking for a 4-bedroom single-family home with great school ratings and quiet suburban cul-de-sac.',
  },
  {
    icon: '🌊',
    title: 'Coastal Waterfront Retreat',
    text: 'Interested in luxury waterfront condos or penthouses with bay views and resort amenities.',
  },
];

// Helper to render markdown text with nice formatting
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base font-bold text-slate-900 mt-3 mb-1 border-b border-emerald-100 pb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        // Header ##
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-lg font-bold text-slate-900 mt-4 mb-2">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Top-level Property Pitch Header: - **[Title]** - *Price*
        if (trimmed.startsWith('- **') || trimmed.startsWith('**') && trimmed.includes('** - *')) {
          const formatted = trimmed
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-emerald-700 font-semibold">$1</em>');
          return (
            <div
              key={idx}
              className="mt-3 font-medium text-slate-900 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        }

        // Sub bullet points: - **Key:** Value
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          const formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-slate-600">$1</em>');
          return (
            <div key={idx} className="flex items-start gap-2 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <div
                className="text-slate-700 flex-1"
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            </div>
          );
        }

        // Disclaimer italic note
        if (trimmed.startsWith('*(') && trimmed.endsWith(')*') || trimmed.startsWith('(') && trimmed.includes('AI matchmaker')) {
          return (
            <p key={idx} className="text-xs text-slate-500 italic bg-amber-50/60 border border-amber-200/50 rounded-lg p-2.5 my-2">
              {trimmed.replace(/^\*\(/, '(').replace(/\)\*$/, ')')}
            </p>
          );
        }

        // Regular paragraph
        const formatted = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="text-slate-700">$1</em>');

        return (
          <p
            key={idx}
            className="text-slate-700"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  buyerProfile,
  allProperties,
  savedPropertyIds,
  comparedPropertyIds,
  onToggleSave,
  onToggleCompare,
  onScheduleTour,
  onOpenDetails,
  onOpenCalculator,
  onOpenConsultation,
  onResetChat,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  // Determine stage based on profile completion
  const getStageInfo = () => {
    if (!buyerProfile.intent || !buyerProfile.location) {
      return { step: 1, title: 'Step 1: Primary Goal & Location', progress: 25 };
    }
    if (!buyerProfile.budget || !buyerProfile.bedrooms) {
      return { step: 2, title: 'Step 2: Budget & Home Size', progress: 50 };
    }
    if (buyerProfile.mustHaves.length === 0) {
      return { step: 3, title: 'Step 3: Lifestyle & Amenities', progress: 75 };
    }
    return { step: 4, title: 'Step 4: Lifestyle Matches & Discovery', progress: 100 };
  };

  const stage = getStageInfo();

  // Find latest quick replies from the assistant
  const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
  const currentQuickReplies = lastAssistantMsg?.quickReplies || [];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Consultation Stage Tracker */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
            {stage.step}/4
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{stage.title}</span>
              {stage.progress === 100 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  Matches Active
                </span>
              )}
            </div>
            <div className="w-36 sm:w-56 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stage.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1"
            title="Start fresh conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Starter Prompts when conversation is fresh */}
        {messages.length <= 1 && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900">
                Explore popular lifestyle match searches
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Click any profile scenario below to begin your step-by-step discovery, or type your own ideal criteria.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STARTER_PROMPTS.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(starter.text)}
                  className="text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500/60 hover:bg-emerald-50/40 transition-all group flex items-start gap-2.5"
                >
                  <span className="text-xl leading-none">{starter.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                      {starter.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {starter.text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          const matchedProps = (message.matchedPropertyIds || [])
            .map((id) => allProperties.find((p) => p.id === id))
            .filter((p): p is Property => Boolean(p));

          return (
            <div key={message.id} className="space-y-3">
              <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-emerald-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 shadow-xs ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {!isUser ? (
                    <FormattedMessage text={message.text} />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  )}

                  <div
                    className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                      isUser ? 'text-emerald-100 justify-end' : 'text-slate-400'
                    }`}
                  >
                    <span>{message.timestamp}</span>
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Inline Property Recommendation Cards */}
              {matchedProps.length > 0 && (
                <div className="pl-11 pr-2 pt-1">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matched Properties Based on Your Criteria</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedProps.map((prop) => (
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
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 border border-slate-200/80 shadow-xs flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                NestFind AI is analyzing lifestyle fit & MLS records...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Response Pills */}
      {currentQuickReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-white/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            Suggested:
          </span>
          {currentQuickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(reply)}
              className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 whitespace-nowrap transition-colors flex items-center gap-1 font-medium shrink-0"
            >
              <span>{reply}</span>
              <ArrowRight className="w-3 h-3 text-emerald-600" />
            </button>
          ))}
        </div>
      )}

      {/* Input Bar & Actions */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tell NestFind your budget, location, lifestyle, or ask for home matches..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm bg-slate-50/60 placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium shadow-xs transition-all active:scale-[0.98] shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Legal & Privacy Guardrails Ribbon */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>AI Matchmaker guidance only. Never share sensitive bank/ID credentials.</span>
          </div>
          <button
            onClick={onOpenConsultation}
            className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Schedule Realtor® Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
