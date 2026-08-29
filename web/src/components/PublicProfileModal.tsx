import React, { useState, useEffect } from 'react';
import type { UserProfilePublic, EventItem } from '../types';
import { fetchPublicUserProfile } from '../services/api';
import { X, MapPin, GraduationCap, AtSign, Calendar, Loader2, Sparkles } from 'lucide-react';

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (event: EventItem) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectEvent,
}) => {
  const [profileData, setProfileData] = useState<UserProfilePublic | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      fetchPublicUserProfile(userId)
        .then((data) => setProfileData(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  const user = profileData?.user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-[#FFFEFD] border border-[#E5E0D8] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#F5F1EC] border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D95F4B]" />
            <h3 className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
              Cohort Member Card
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#77736F] hover:bg-[#EBE5DD] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading || !user ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#77736F] space-y-2">
              <Loader2 size={24} className="animate-spin text-[#D95F4B]" />
              <span className="text-xs font-bold">Loading member details...</span>
            </div>
          ) : (
            <>
              {/* Top Hero Info Card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F5F1EC] border border-[#E5E0D8]">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#D95F4B] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-['Bricolage_Grotesque'] text-xl font-bold text-[#1A1A1A] leading-tight">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-[#77736F] font-semibold mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={13} />
                      <span>Cohort '{user.cohort_year || '26'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      <span>{user.city || 'Durham'}</span>
                    </span>
                    {user.instagram_handle && (
                      <span className="flex items-center gap-1 text-[#D95F4B]">
                        <AtSign size={13} />
                        <span>{user.instagram_handle}</span>
                      </span>
                    )}
                  </div>
                  {user.bio && (
                    <p className="text-xs text-[#1A1A1A] mt-2 font-medium leading-relaxed">
                      "{user.bio}"
                    </p>
                  )}
                </div>
              </div>

              {/* Interests Pills */}
              {user.interests && (
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#77736F] mb-2">
                    FAVORITE VIBES & INTERESTS
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {user.interests.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8D7CC] text-[#D95F4B] border border-[#D95F4B]/40"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Plans Created */}
              {profileData.created_events.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#77736F] mb-2">
                    PLANS CREATED BY {user.name.split(' ')[0].toUpperCase()} ({profileData.created_events.length})
                  </h4>
                  <div className="space-y-2">
                    {profileData.created_events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          onClose();
                          onSelectEvent(ev);
                        }}
                        className="p-3 rounded-xl bg-[#FFFEFD] border border-[#E5E0D8] hover:border-[#1A1A1A] transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h5 className="font-['Bricolage_Grotesque'] text-xs font-bold text-[#1A1A1A] truncate">
                            {ev.title}
                          </h5>
                          <span className="text-[11px] text-[#77736F] font-medium">
                            {ev.city} · {ev.venue_name || 'Venue'}
                          </span>
                        </div>
                        <Calendar size={14} className="text-[#D95F4B] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plans Attending */}
              {profileData.attending_events.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#77736F] mb-2">
                    UPCOMING PLANS ATTENDING ({profileData.attending_events.length})
                  </h4>
                  <div className="space-y-2">
                    {profileData.attending_events.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          onClose();
                          onSelectEvent(ev);
                        }}
                        className="p-3 rounded-xl bg-[#FFFEFD] border border-[#E5E0D8] hover:border-[#1A1A1A] transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h5 className="font-['Bricolage_Grotesque'] text-xs font-bold text-[#1A1A1A] truncate">
                            {ev.title}
                          </h5>
                          <span className="text-[11px] text-[#77736F] font-medium">
                            {ev.city} · {ev.venue_name || 'Venue'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white shrink-0">
                          Going
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
