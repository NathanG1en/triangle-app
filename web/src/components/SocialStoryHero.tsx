import React from 'react';
import type { EventItem } from '../types';

interface SocialStoryHeroProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const SocialStoryHero: React.FC<SocialStoryHeroProps> = ({
  events,
  onSelectEvent,
}) => {
  if (!events || events.length === 0) return null;

  const heroEvent = events[0];
  const secondaryEvents = events.slice(1, 3);

  const goingUsers = (heroEvent.attendees || []).filter((a) => a.status === 'GOING');
  const leadAttendee = goingUsers[0]?.user_name || 'Alex';
  const otherCount = Math.max(1, goingUsers.length - 1);

  return (
    <div className="bg-[#F5F1EC] dark:bg-[#0B172E] border border-[#E5E0D8] dark:border-white/10 rounded-2xl p-6 mb-8 transition-colors shadow-xs">
      {/* Top Banner Headline */}
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#D95F4B] dark:text-[#38BDF8] mb-2">
        YOUR PEOPLE ARE GOING
      </div>

      <h2
        onClick={() => onSelectEvent(heroEvent)}
        className="font-['Bricolage_Grotesque'] text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-[#F8FAFC] leading-tight tracking-tight mb-4 hover:text-[#D95F4B] dark:hover:text-[#38BDF8] transition-colors cursor-pointer"
      >
        {leadAttendee} + {otherCount} {otherCount === 1 ? 'other is' : 'others are'} headed to {heroEvent.title}.
      </h2>

      {/* Hero Attendees Avatar Row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center">
          {goingUsers.slice(0, 4).map((a, idx) => (
            <img
              key={a.user_id + idx}
              src={a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={a.user_name}
              className="w-7 h-7 rounded-full border-2 border-[#FFFEFD] dark:border-[#020916] object-cover -ml-2 first:ml-0 shadow-xs"
            />
          ))}
        </div>
        <button
          onClick={() => onSelectEvent(heroEvent)}
          className="text-xs font-bold text-[#D95F4B] dark:text-[#38BDF8] hover:underline"
        >
          See who's going →
        </button>
      </div>

      {/* Secondary Story Bullet Points */}
      {secondaryEvents.length > 0 && (
        <div className="border-t border-[#E5E0D8] dark:border-white/10 pt-4 flex flex-col gap-2">
          {secondaryEvents.map((sec) => {
            const secGoing = (sec.attendees || []).filter((a) => a.status === 'GOING');
            const secLead = secGoing[0]?.user_name || 'Chris';
            const secExtra = secGoing.length - 1;

            return (
              <div
                key={sec.id}
                onClick={() => onSelectEvent(sec)}
                className="flex items-center justify-between text-xs font-semibold cursor-pointer group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[#1A1A1A] dark:text-[#F8FAFC] font-bold group-hover:text-[#D95F4B] dark:group-hover:text-[#38BDF8] transition-colors truncate">
                    {secLead} {secExtra > 0 ? `+ ${secExtra}` : ''} → {sec.title}
                  </span>
                </div>
                <span className="text-[#77736F] dark:text-[#94A3B8] text-[11px] shrink-0 font-medium">
                  {sec.city}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
