import React from 'react';
import type { EventItem } from '../types';
import { EventCard } from './EventCard';
import { SocialStoryHero } from './SocialStoryHero';

interface EventFeedProps {
  events: EventItem[];
  loading: boolean;
  searchQuery: string;
  onSelectEvent: (event: EventItem) => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
  onShare: (event: EventItem, e: React.MouseEvent) => void;
  onResetFilters: () => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({
  events,
  loading,
  searchQuery,
  onSelectEvent,
  onToggleAttendance,
  onShare,
  onResetFilters,
}) => {
  return (
    <div className="w-full">
      {/* Asymmetric Social Story Module */}
      {!loading && events.length > 0 && !searchQuery && (
        <SocialStoryHero events={events} onSelectEvent={onSelectEvent} />
      )}

      {/* Publication Section Headline */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1A1A1A]">
        <h2 className="font-['Bricolage_Grotesque'] text-sm font-extrabold text-[#1A1A1A] tracking-wider uppercase">
          {events.length} THINGS WORTH DOING THIS WEEKEND
        </h2>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-[#D95F4B] border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="font-['Outfit'] text-xs font-semibold text-[#77736F]">Loading Triangle feed...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center bg-[#F5F1EC] rounded-2xl border border-[#E5E0D8] p-6 my-4">
          <h4 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A] mb-1">No Plans Found</h4>
          <p className="text-xs text-[#77736F] mb-4">No events match your current city or filter criteria.</p>
          <button
            onClick={onResetFilters}
            className="bg-[#1A1A1A] text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#E5E0D8]">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
              onToggleAttendance={onToggleAttendance}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </div>
  );
};
