import React, { useState, useEffect } from 'react';
import type { EventCreatePayload, PlaceSuggestion } from '../types';
import { fetchPlaceAutocomplete, resolveVenuePhoto } from '../services/api';
import { X, Repeat } from 'lucide-react';

interface ProposePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: EventCreatePayload) => Promise<void>;
}

export const ProposePlanModal: React.FC<ProposePlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Durham');
  const [category, setCategory] = useState('Social');
  const [startAt, setStartAt] = useState('');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [priceMin, setPriceMin] = useState('0');
  const [isFree, setIsFree] = useState(true);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [recurrenceRule, setRecurrenceRule] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | null>(null);

  // Autocomplete state
  const [autocompleteResults, setAutocompleteResults] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!venueName.trim() || venueName.length < 2) {
      setAutocompleteResults([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      const suggestions = await fetchPlaceAutocomplete(venueName);
      setAutocompleteResults(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setIsSearchingPlaces(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [venueName]);

  if (!isOpen) return null;

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setVenueName(place.venue_name);
    if (place.address) setAddress(place.address);
    if (place.city) setCity(place.city);
    if (place.category) setCategory(place.category);
    if (place.image_url) setImageUrl(place.image_url);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a plan title');
      return;
    }

    let finalImage = imageUrl.trim();
    if (!finalImage) {
      finalImage = await resolveVenuePhoto(venueName, city, category);
    }

    const finalStart = startAt ? new Date(startAt).toISOString() : new Date().toISOString();

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        city,
        category,
        start_at: finalStart,
        venue_name: venueName.trim(),
        address: address.trim(),
        price_min: isFree ? 0 : parseFloat(priceMin) || 0,
        price_max: isFree ? 0 : parseFloat(priceMin) || 0,
        is_free: isFree,
        description: description.trim(),
        image_url: finalImage,
        recurrence_rule: recurrenceRule,
        source_name: 'Community Member'
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert('Failed to publish plan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#FFFEFD] rounded-2xl w-full max-w-xl border-1.5 border-[#1A1A1A] shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="bg-[#F5F1EC] px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div>
            <h2 className="font-['Bricolage_Grotesque'] text-xl font-bold text-[#1A1A1A]">
              Propose a Cohort Plan
            </h2>
            <p className="font-['Outfit'] text-xs text-[#77736F]">
              Share an event, spot meetup, or recurring activity with the Triangle cohort.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EBE5DD] text-[#1A1A1A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Plan Title */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1">
              Plan Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Saturday Night DBAP Baseball & Drinks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#D95F4B]"
              required
            />
          </div>

          {/* City Hub & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1">
                City Hub *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-xs font-bold text-[#1A1A1A] outline-none cursor-pointer"
              >
                {['Durham', 'Raleigh', 'Cary', 'Chapel Hill', 'Morrisville'].map((c) => (
                  <option key={c} value={c}>
                    {c}, NC
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-xl px-3 py-2.5 text-xs font-bold text-[#1A1A1A] outline-none cursor-pointer"
              >
                {['Social', 'Arts & Music', 'Food & Drink', 'Sports & Fitness', 'Outdoors', 'Nightlife'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1">
              Date & Start Time *
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#D95F4B]"
            />
          </div>

          {/* Venue Autocomplete Input */}
          <div className="relative">
            <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1">
              Venue Name (Smart Autocomplete)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Boxcar, Fullsteam, Morgan Street Food Hall..."
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#D95F4B]"
              />
              {isSearchingPlaces && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#D95F4B] border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && autocompleteResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#FFFEFD] border border-[#1A1A1A] rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                {autocompleteResults.map((place: PlaceSuggestion, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#F5F1EC] border-b border-[#E5E0D8] last:border-none flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">{place.venue_name}</div>
                      <div className="text-[10px] text-[#77736F]">{place.address}, {place.city}</div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-[#E8D7CC] text-[#D95F4B] px-2 py-0.5 rounded-full">
                      1-Tap Fill
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1">
              Address / Location Details
            </label>
            <input
              type="text"
              placeholder="e.g. 330 W Davie St, Raleigh, NC"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1A1A1A] outline-none"
            />
          </div>

          {/* Recurrence Selector */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Repeat size={12} />
              <span>Recurrence Rule</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Once', value: null },
                { label: 'Weekly', value: 'WEEKLY' },
                { label: 'Biweekly', value: 'BIWEEKLY' },
                { label: 'Monthly', value: 'MONTHLY' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setRecurrenceRule(item.value as any)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    recurrenceRule === item.value
                      ? 'bg-[#D95F4B] text-white border-[#D95F4B]'
                      : 'bg-[#F5F1EC] text-[#1A1A1A] border-[#E5E0D8]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#F5F1EC] p-3 rounded-xl border border-[#E5E0D8] flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 accent-[#D95F4B]"
              />
              <span>This plan is free to attend</span>
            </label>

            {!isFree && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#1A1A1A]">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-20 bg-[#FFFEFD] border border-[#E5E0D8] rounded-lg px-2 py-1 text-xs font-bold text-[#1A1A1A] outline-none"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#D95F4B] uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              placeholder="What makes this spot or plan special? Meetup details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-xl p-3 text-xs font-semibold text-[#1A1A1A] outline-none min-h-[70px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#F5F1EC] text-[#1A1A1A] border border-[#E5E0D8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#D95F4B] hover:bg-[#C54E3A] text-white shadow-sm transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
