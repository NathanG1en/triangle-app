import React, { useState } from 'react';
import type { EventItem } from '../types';
import { updateEventPhoto, reportEvent, blockUser } from '../services/api';
import { X, MapPin, Calendar, ExternalLink, Share2, CheckCircle2, Users, Repeat, ShieldAlert, Flag, Ban, Camera, Check } from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onToggleAttendance,
}) => {
  const [attendeeTab, setAttendeeTab] = useState<'ALL' | 'GOING' | 'INTERESTED'>('ALL');
  const [shareToast, setShareToast] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  // Moderation state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISLEADING' | 'OTHER'>('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const isSpot = event.is_suggestion || event.source_type === 'SUGGESTION';
  const isGoing = event.user_attendance_status === 'GOING';
  const isInterested = event.user_attendance_status === 'INTERESTED';

  const timeLabel = isSpot
    ? 'LOCAL SPOT RECOMMENDATION · OPEN REGULAR HOURS'
    : new Date(event.start_at).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });



  const openGoogleMaps = () => {
    const query = encodeURIComponent(`${event.venue_name || ''} ${event.address || ''} ${event.city} NC`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?event=${event.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out "${event.title}" on Triangle Social!`,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handlePhotoUpdate = async () => {
    if (!newPhotoUrl.trim()) return;
    setUpdatingPhoto(true);
    try {
      const updated = await updateEventPhoto(event.id, newPhotoUrl.trim());
      event.image_url = updated.image_url;
      setShowPhotoInput(false);
      setNewPhotoUrl('');
    } catch (err) {
      alert('Failed to update photo');
    } finally {
      setUpdatingPhoto(false);
    }
  };

  const handleReportSubmit = async () => {
    try {
      setIsReporting(true);
      await reportEvent(event.id, reportReason, reportDetails);
      setIsReporting(false);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
      }, 2000);
    } catch (err) {
      setIsReporting(false);
      alert('Failed to submit report');
    }
  };

  const handleBlockAuthor = async () => {
    if (!event.created_by_user_id) return;
    try {
      await blockUser(event.created_by_user_id);
      alert('User blocked. You will no longer see content from this user.');
      onClose();
    } catch (err) {
      alert('Failed to block user');
    }
  };

  const filteredAttendees = (event.attendees || []).filter((a) => {
    if (attendeeTab === 'GOING') return a.status === 'GOING';
    if (attendeeTab === 'INTERESTED') return a.status === 'INTERESTED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-[#FFFEFD] w-full max-w-2xl h-full overflow-y-auto border-l border-[#E5E0D8] shadow-2xl flex flex-col justify-between">
        <div>
          {/* Modal Header Bar */}
          <div className="sticky top-0 z-20 bg-[#FFFEFD]/90 backdrop-blur-md px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-[#F5F1EC] text-[#1A1A1A] font-extrabold text-xs px-3 py-1 rounded-full border border-[#E5E0D8]">
                📍 {event.city}
              </span>
              {event.recurrence_rule && (
                <span className="bg-[#E8D7CC] text-[#D95F4B] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Repeat size={12} />
                  <span>{event.recurrence_rule}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-[#F5F1EC] text-[#1A1A1A] border border-[#E5E0D8] transition-colors relative"
                title="Share Plan"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#F5F1EC] text-[#1A1A1A] border border-[#E5E0D8] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {shareToast && (
            <div className="bg-[#075E59] text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 animate-fade-in">
              <Check size={14} />
              <span>Deep link copied to clipboard! Share it with your cohort.</span>
            </div>
          )}

          {/* Hero Photo Section */}
          <div className="relative h-64 w-full bg-[#E5E0D8]">
            <img
              src={event.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-extrabold tracking-wider uppercase text-white shadow-xs ${
                isSpot ? 'bg-[#075E59]' : 'bg-[#D95F4B]'
              }`}
            >
              {isSpot ? 'ANYTIME SPOT' : event.category || 'SOCIAL'}
            </span>

            <button
              onClick={() => setShowPhotoInput(!showPhotoInput)}
              className="absolute bottom-4 right-4 bg-[#FFFEFD]/90 hover:bg-[#FFFEFD] text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full border border-[#E5E0D8] shadow-xs flex items-center gap-1.5"
            >
              <Camera size={14} />
              <span>Change Photo</span>
            </button>
          </div>

          {/* Change Photo Input Bar */}
          {showPhotoInput && (
            <div className="bg-[#F5F1EC] p-4 border-b border-[#E5E0D8] flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste image URL..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="flex-1 bg-[#FFFEFD] text-xs px-3 py-2 rounded-lg border border-[#E5E0D8] outline-none"
              />
              <button
                onClick={handlePhotoUpdate}
                disabled={updatingPhoto}
                className="bg-[#1A1A1A] text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                {updatingPhoto ? 'Saving...' : 'Update'}
              </button>
            </div>
          )}

          {/* Content Body */}
          <div className="p-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D95F4B] uppercase tracking-wider mb-2">
              <Calendar size={14} />
              <span>{timeLabel}</span>
            </div>

            <h2 className="font-['Bricolage_Grotesque'] text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight mb-3">
              {event.title}
            </h2>

            {/* Location & Map Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F5F1EC] p-3.5 rounded-xl border border-[#E5E0D8] mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1A1A]">
                <MapPin size={16} className="text-[#D95F4B]" />
                <div>
                  <div className="font-bold">{event.venue_name || event.city}</div>
                  {event.address && <div className="text-[#77736F]">{event.address}, {event.city} NC</div>}
                </div>
              </div>

              <button
                onClick={openGoogleMaps}
                className="text-xs font-bold text-[#075E59] hover:underline flex items-center gap-1"
              >
                <span>Open in Maps</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                About This Plan
              </h4>
              <p className="text-sm text-[#444] leading-relaxed whitespace-pre-line">
                {event.description || 'No description provided for this community event.'}
              </p>
            </div>

            {/* Attendance Action Bar */}
            <div className="bg-[#F5F1EC] p-4 rounded-xl border border-[#E5E0D8] mb-6">
              <h4 className="font-['Bricolage_Grotesque'] text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">
                Your Cohort RSVP Status
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleAttendance(event.id, isGoing ? 'NONE' : 'GOING')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    isGoing
                      ? 'bg-[#075E59] text-white border-[#075E59] shadow-xs'
                      : 'bg-[#FFFEFD] text-[#1A1A1A] border-[#E5E0D8] hover:border-[#1A1A1A]'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>{isGoing ? "You're Going!" : "I'm Going"}</span>
                </button>

                <button
                  onClick={() => onToggleAttendance(event.id, isInterested ? 'NONE' : 'INTERESTED')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    isInterested
                      ? 'bg-[#E8D7CC] text-[#D95F4B] border-[#D95F4B] shadow-xs'
                      : 'bg-[#FFFEFD] text-[#1A1A1A] border-[#E5E0D8] hover:border-[#1A1A1A]'
                  }`}
                >
                  <span>{isInterested ? 'Interested' : '★ Interested'}</span>
                </button>
              </div>
            </div>

            {/* Attendees List Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} />
                  <span>Cohort Members ({event.attendees?.length || 0})</span>
                </h4>

                <div className="flex items-center bg-[#F5F1EC] p-0.5 rounded-lg border border-[#E5E0D8] text-[11px] font-bold">
                  <button
                    onClick={() => setAttendeeTab('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-all ${attendeeTab === 'ALL' ? 'bg-white shadow-xs' : 'text-[#77736F]'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAttendeeTab('GOING')}
                    className={`px-2.5 py-1 rounded-md transition-all ${attendeeTab === 'GOING' ? 'bg-white shadow-xs' : 'text-[#77736F]'}`}
                  >
                    Going ({event.going_count})
                  </button>
                </div>
              </div>

              {filteredAttendees.length > 0 ? (
                <div className="space-y-2">
                  {filteredAttendees.map((a) => (
                    <div key={a.user_id} className="flex items-center justify-between p-2.5 bg-[#F5F1EC] rounded-xl border border-[#E5E0D8]">
                      <div className="flex items-center gap-3">
                        <img
                          src={a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={a.user_name}
                          className="w-8 h-8 rounded-full object-cover border border-[#E5E0D8]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#1A1A1A]">{a.user_name}</div>
                          <div className="text-[10px] text-[#77736F]">Cohort of 2026</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          a.status === 'GOING' ? 'bg-[#D1EBE7] text-[#075E59]' : 'bg-[#E8D7CC] text-[#D95F4B]'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#77736F] italic bg-[#F5F1EC] p-4 rounded-xl text-center">
                  No cohort members listed for this filter yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Safety & Content Moderation Footer */}
        <div className="p-4 bg-[#F5F1EC] border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#77736F]">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1 hover:text-[#D95F4B] transition-colors"
          >
            <Flag size={13} />
            <span>Report Plan</span>
          </button>

          {event.created_by_user_id && (
            <button
              onClick={handleBlockAuthor}
              className="flex items-center gap-1 font-semibold text-[#D95F4B] hover:underline"
            >
              <Ban size={13} />
              <span>Block Author</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Content Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FFFEFD] rounded-2xl p-6 w-full max-w-md border border-[#1A1A1A] shadow-2xl">
            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A] mb-1">Report Submitted</h3>
                <p className="text-xs text-[#77736F]">Thank you. Our moderation team will review this within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-[#D95F4B]" />
                  <span>Report Objectionable Content</span>
                </h3>
                <p className="text-xs text-[#77736F] mb-4">Please select the reason for reporting "{event.title}".</p>

                <div className="space-y-2 mb-4">
                  {(['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'MISLEADING', 'OTHER'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setReportReason(r)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                        reportReason === r
                          ? 'bg-[#E8D7CC] text-[#D95F4B] border-[#D95F4B]'
                          : 'bg-[#F5F1EC] text-[#1A1A1A] border-[#E5E0D8]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Additional details (optional)..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full bg-[#F5F1EC] border border-[#E5E0D8] rounded-lg p-2.5 text-xs text-[#1A1A1A] outline-none mb-4 min-h-[70px]"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#F5F1EC] text-[#1A1A1A] border border-[#E5E0D8]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={isReporting}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-[#D95F4B] text-white"
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
