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
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1A1A1A] dark:border-white/20">
        <h2 className="font-['Bricolage_Grotesque'] text-sm font-extrabold text-[#1A1A1A] dark:text-[#F8FAFC] tracking-wider uppercase">
          {events.length} THINGS WORTH DOING THIS WEEKEND
        </h2>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-[#D95F4B] dark:border-[#38BDF8] border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="font-['Outfit'] text-xs font-semibold text-[#77736F] dark:text-[#94A3B8]">Loading Triangle feed...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center bg-[#F5F1EC] dark:bg-[#0B172E] rounded-2xl border border-[#E5E0D8] dark:border-white/10 p-6 my-4">
          <p className="font-['Bricolage_Grotesque'] text-base font-bold text-[#1A1A1A] dark:text-[#F8FAFC] mb-1">
            No plans match your current filters
          </p>
          <p className="text-xs text-[#77736F] dark:text-[#94A3B8] mb-4">
            Try adjusting your vibe chips or clearing your search term.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-[#1A1A1A] dark:bg-[#0018A8] text-white text-xs font-bold rounded-lg hover:bg-black dark:hover:bg-[#001073] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
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
