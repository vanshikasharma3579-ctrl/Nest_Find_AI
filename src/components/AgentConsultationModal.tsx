import React, { useState } from 'react';
import { agents } from '../data/properties';
import { X, PhoneCall, Video, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AgentConsultationModalProps {
  onClose: () => void;
  onBookedMessage: (msg: string) => void;
}

export const AgentConsultationModal: React.FC<AgentConsultationModalProps> = ({
  onClose,
  onBookedMessage,
}) => {
  const [selectedAgentKey, setSelectedAgentKey] = useState<string>('sarah');
  const [consultType, setConsultType] = useState<'phone' | 'video'>('video');
  const [topic, setTopic] = useState('First-Time Homebuyer Discovery & Matchmaking');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedAgent = agents[selectedAgentKey] || agents.sarah;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitted(true);
    onBookedMessage(
      `Consultation booked with ${selectedAgent.name} (${selectedAgent.role}) for "${topic}". We'll connect via ${consultType === 'video' ? 'Google Meet video call' : 'phone'} shortly!`
    );

    try {
      confetti({
        particleCount: 70,
        spread: 50,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Licensed Partner Network
            </span>
            <h3 className="font-bold text-base">Speak with a Real Estate Matchmaker</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Consultation Scheduled!</h4>
              <p className="text-xs text-slate-600 mt-1">
                {selectedAgent.name} has been notified and sent a calendar invite to <strong>{email}</strong>.
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Agent:</span>
                <span className="font-semibold text-slate-800">{selectedAgent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-medium text-slate-800">
                  15-Min {consultType === 'video' ? 'Video Meeting' : 'Phone Call'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Topic:</span>
                <span className="font-medium text-slate-800">{topic}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              Return to Assistant
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Agent Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Select Your Matchmaker Advisor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(agents).map(([key, ag]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedAgentKey(key)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center ${
                      selectedAgentKey === key
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={ag.photo}
                      alt={ag.name}
                      className="w-10 h-10 rounded-full object-cover mb-1.5 ring-1 ring-slate-200"
                    />
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{ag.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{ag.role.split('&')[0]}</div>
                    <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                      ★ {ag.rating}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Preferred Meeting Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConsultType('video')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                    consultType === 'video'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Google Meet Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultType('phone')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                    consultType === 'phone'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Direct Phone Call</span>
                </button>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Consultation Focus
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/60 font-medium text-slate-800"
              >
                <option value="First-Time Homebuyer Discovery & Matchmaking">
                  First-Time Homebuyer Discovery & Matchmaking
                </option>
                <option value="Neighborhood Walkability & School Review">
                  Neighborhood Walkability & School Review
                </option>
                <option value="Off-Market Inventory & Upcoming Listings">
                  Off-Market Inventory & Upcoming Listings
                </option>
                <option value="Relocation & City Orientation Advisory">
                  Relocation & City Orientation Advisory
                </option>
              </select>
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Complimentary 15-minute consultation. No obligation, no spam.</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || !email.trim() || !phone.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Book 15-Min Advisory Call</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
