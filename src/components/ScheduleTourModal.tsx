import React, { useState } from 'react';
import { Property, TourBooking } from '../types';
import { X, Calendar, Clock, Video, UserCheck, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleTourModalProps {
  property: Property;
  onClose: () => void;
  onConfirmBooking: (booking: TourBooking) => void;
}

export const ScheduleTourModal: React.FC<ScheduleTourModalProps> = ({
  property,
  onClose,
  onConfirmBooking,
}) => {
  const [tourType, setTourType] = useState<'in_person' | 'virtual'>('in_person');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM – 11:00 AM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<TourBooking | null>(null);

  const timeSlots = [
    '09:30 AM – 10:30 AM',
    '11:00 AM – 12:00 PM',
    '01:30 PM – 02:30 PM',
    '03:30 PM – 04:30 PM',
    '05:00 PM – 06:00 PM',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newBooking: TourBooking = {
      id: `tour-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyPrice: property.priceDisplay,
      propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
      propertyImage: property.images[0],
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      tourType,
      buyerName: name.trim(),
      buyerEmail: email.trim(),
      buyerPhone: phone.trim(),
      notes: notes.trim(),
      agent: property.agent,
      createdAt: new Date().toISOString(),
    };

    setBookedDetails(newBooking);
    setIsBooked(true);
    onConfirmBooking(newBooking);

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleDownloadCalendar = () => {
    if (!bookedDetails) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NestFind AI//Property Viewing//EN
BEGIN:VEVENT
SUMMARY:Property Tour: ${bookedDetails.propertyTitle}
DESCRIPTION:NestFind AI Viewing with ${bookedDetails.agent.name} (${bookedDetails.agent.phone}). Tour Type: ${bookedDetails.tourType === 'in_person' ? 'In-Person Tour' : 'Live Virtual Walkthrough'}.
LOCATION:${bookedDetails.propertyAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nestfind-tour-${property.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Viewing Appointment
            </span>
            <h3 className="font-bold text-base line-clamp-1">{property.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isBooked && bookedDetails ? (
          /* Booking Confirmation State */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Your Tour is Confirmed!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                We have assigned your licensed matchmaker advisor to host your tour. A confirmation has been prepared for <strong>{bookedDetails.buyerEmail}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-800">
                  {bookedDetails.date} @ {bookedDetails.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-semibold text-slate-800">
                  {bookedDetails.tourType === 'in_person' ? 'In-Person Guided Tour' : 'Live Virtual Walkthrough'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Agent:</span>
                <span className="font-semibold text-emerald-700">
                  {bookedDetails.agent.name} ({bookedDetails.agent.licenseNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="font-medium text-slate-800 text-right line-clamp-1">
                  {bookedDetails.propertyAddress}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleDownloadCalendar}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Add to Calendar (.ics)</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Tour Selection Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Tour Type Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Select Tour Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTourType('in_person')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    tourType === 'in_person'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>In-Person Walkthrough</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTourType('virtual')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    tourType === 'virtual'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Live Video Tour</span>
                </button>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/60"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Time Window
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/60 font-medium"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buyer Contact Details */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block">
                Your Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/60"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/60"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number (for SMS tour reminder)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/60"
              />
              <textarea
                rows={2}
                placeholder="Any special questions or focus areas (e.g., backyard inspection, HOA details)?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/60 resize-none"
              />
            </div>

            {/* Assigned Licensed Real Estate Agent Card */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={property.agent.photo}
                  alt={property.agent.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{property.agent.name}</span>
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-semibold">
                      Licensed
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{property.agent.agency}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800">★ {property.agent.rating}</div>
                <div className="text-[10px] text-slate-500">{property.agent.licenseNumber}</div>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>We never ask for or share sensitive financial numbers or SSNs.</span>
            </div>

            {/* Submit CTA */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || !email.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Confirm Viewing Appointment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
