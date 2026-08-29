import React from 'react';
import type { EventItem } from '../types';

interface SocialStoryHeroProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const SocialStoryHero: React.FC<SocialStoryHeroProps> = ({ events, onSelectEvent }) => {
  // Find top event with going attendees
  const featuredEvent = events.find((e) => (e.attendees || []).some((a) => a.status === 'GOING')) || events[0];

  if (!featuredEvent) return null;

  const goingAttendees = (featuredEvent.attendees || []).filter((a) => a.status === 'GOING');
  const leadAttendee = goingAttendees[0]?.user_name.split(' ')[0] || 'Jordan';
  const otherCount = Math.max(1, goingAttendees.length - 1);

  const secondaryEvents = events.filter((e) => e.id !== featuredEvent.id).slice(0, 2);

  return (
    <div className="bg-[#F5F1EC] p-5 sm:p-6 rounded-2xl border border-[#E5E0D8] mb-6">
      {/* Eyebrow Label */}
      <div className="font-['Outfit'] text-[11px] font-extrabold uppercase tracking-widest text-[#D95F4B] mb-2">
        YOUR PEOPLE ARE GOING
      </div>

      {/* Main Headline */}
      <div className="cursor-pointer group" onClick={() => onSelectEvent(featuredEvent)}>
        <h3 className="font-['Bricolage_Grotesque'] text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-tight group-hover:text-[#D95F4B] transition-colors mb-3">
          {leadAttendee} + {otherCount} others are headed to {featuredEvent.title} {new Date(featuredEvent.start_at).toLocaleDateString('en-US', { weekday: 'short' })}.
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {(goingAttendees.length > 0 ? goingAttendees : [
              { user_id: '1', user_name: 'Jordan', user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', status: 'GOING' as const },
              { user_id: '2', user_name: 'Maya', user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'GOING' as const },
              { user_id: '3', user_name: 'Alex', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', status: 'GOING' as const },
            ]).slice(0, 3).map((a, idx) => (
              <img
                key={a.user_id + idx}
                src={a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={a.user_name}
                className="w-7 h-7 rounded-full border-2 border-[#F5F1EC] object-cover -ml-2 first:ml-0"
              />
            ))}
          </div>

          <span className="text-xs font-bold text-[#D95F4B] group-hover:underline">
            See who's going →
          </span>
        </div>
      </div>

      {/* Divider Rule */}
      {secondaryEvents.length > 0 && (
        <div className="my-4 border-t border-[#E5E0D8]" />
      )}

      {/* Secondary Cohort Activity List */}
      <div className="space-y-2">
        {secondaryEvents.map((e) => {
          const attendees = (e.attendees || []).filter((a) => a.status === 'GOING');
          const name = attendees[0]?.user_name.split(' ')[0] || 'Alex';
          const count = Math.max(1, attendees.length);

          return (
            <div
              key={e.id}
              onClick={() => onSelectEvent(e)}
              className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A] hover:text-[#D95F4B] cursor-pointer transition-colors"
            >
              <span>
                <strong className="font-bold">{name} + {count}</strong> → {e.title}
              </span>
              <span className="text-[#77736F] font-normal">{e.city}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
