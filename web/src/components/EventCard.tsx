import React from 'react';
import type { EventItem } from '../types';
import { Share2, Repeat, Check } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
  onShare: (event: EventItem, e: React.MouseEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onToggleAttendance,
  onShare,
}) => {
  const isSpot = event.is_suggestion || event.source_type === 'SUGGESTION';
  const isGoing = event.user_attendance_status === 'GOING';
  const isInterested = event.user_attendance_status === 'INTERESTED';

  const categoryCityHeader = isSpot
    ? `ANYTIME SPOT · ${event.city.toUpperCase()}`
    : `${(event.category || 'SOCIAL').toUpperCase()} · ${event.city.toUpperCase()}`;

  const formattedDate = isSpot
    ? 'Open regular hours'
    : new Date(event.start_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

  const priceStr = event.is_free ? 'Free' : `$${event.price_min}`;
  const timePriceVenueLine = `${formattedDate} · ${priceStr} · ${event.venue_name || event.city}`;

  const goingUsers = (event.attendees || []).filter((a) => a.status === 'GOING');
  let humanSocialText = 'Be first from cohort!';
  if (goingUsers.length > 0) {
    const names = goingUsers.slice(0, 2).map((a) => a.user_name.split(' ')[0]);
    const extra = goingUsers.length - names.length;
    humanSocialText = extra > 0 ? `${names.join(', ')} + ${extra} friends going` : `${names.join(' & ')} going`;
  }

  return (
    <div
      onClick={() => onSelect(event)}
      className="group py-4 border-b border-[#E5E0D8] dark:border-white/10 hover:bg-[#F5F1EC]/60 dark:hover:bg-[#0B172E]/60 px-2 rounded-xl transition-all cursor-pointer flex flex-col justify-between gap-3"
    >
      {/* Top Main Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left Column Text Content */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow Label */}
          <div
            className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
              isSpot ? 'text-[#075E59] dark:text-[#00E5FF]' : 'text-[#D95F4B] dark:text-[#38BDF8]'
            }`}
          >
            {categoryCityHeader}
          </div>

          {/* Title in Bricolage Grotesque */}
          <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A] dark:text-[#F8FAFC] leading-snug group-hover:text-[#D95F4B] dark:group-hover:text-[#38BDF8] transition-colors mb-1.5 line-clamp-2">
            {event.title}
          </h3>

          {/* Metadata Sub-line */}
          <p className="text-xs text-[#77736F] dark:text-[#94A3B8] font-semibold truncate mb-2">
            {timePriceVenueLine}
          </p>

          {/* Recurrence Summary */}
          {event.recurrence_rule && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D95F4B] dark:text-[#38BDF8] mb-2">
              <Repeat size={11} />
              <span>Recurring {event.recurrence_rule.toLowerCase()}</span>
            </span>
          )}
        </div>

        {/* Right Thumbnail Image */}
        {event.image_url ? (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#E5E0D8] dark:bg-[#0B172E] shrink-0 border border-[#E5E0D8] dark:border-white/10">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : null}
      </div>

      {/* Footer Social Line & Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E5E0D8]/40 dark:border-white/10">
        {/* Left: Avatar Stack & Social Proof */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center shrink-0">
            {goingUsers.slice(0, 3).map((a, idx) => (
              <img
                key={a.user_id + idx}
                src={a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={a.user_name}
                className="w-5 h-5 rounded-full border-1.5 border-[#FFFEFD] dark:border-[#020916] object-cover -ml-1.5 first:ml-0"
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-[#1A1A1A] dark:text-[#F8FAFC] truncate">
            {humanSocialText}
          </span>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => onShare(event, e)}
            className="p-1.5 rounded-lg text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A] dark:hover:text-[#F8FAFC] hover:bg-[#E5E0D8] dark:hover:bg-[#0B172E] transition-colors"
            title="Share"
          >
            <Share2 size={13} />
          </button>

          <button
            onClick={() => onToggleAttendance(event.id, isInterested ? 'NONE' : 'INTERESTED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              isInterested
                ? 'bg-[#E8D7CC] dark:bg-[#0018A8]/30 text-[#D95F4B] dark:text-[#38BDF8] border-[#D95F4B] dark:border-[#38BDF8]'
                : 'bg-[#F5F1EC] dark:bg-[#0B172E] text-[#1A1A1A] dark:text-[#F8FAFC] border-[#E5E0D8] dark:border-white/10 hover:border-[#1A1A1A] dark:hover:border-[#38BDF8]'
            }`}
          >
            {isInterested ? '★ Interested' : '☆ Interested'}
          </button>

          <button
            onClick={() => onToggleAttendance(event.id, isGoing ? 'NONE' : 'GOING')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
              isGoing
                ? 'bg-[#1A1A1A] dark:bg-[#0018A8] text-white border-[#1A1A1A] dark:border-[#0018A8]'
                : 'bg-[#F5F1EC] dark:bg-[#0B172E] text-[#1A1A1A] dark:text-[#F8FAFC] border-[#E5E0D8] dark:border-white/10 hover:border-[#1A1A1A] dark:hover:border-[#38BDF8]'
            }`}
          >
            {isGoing ? <Check size={12} /> : null}
            <span>{isGoing ? 'Going' : '+ Going'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
