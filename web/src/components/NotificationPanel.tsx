import React from 'react';
import type { NotificationItem } from '../types';
import { X, Bell, CheckCheck, Clock, UserCheck } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onSelectEvent: (eventId: number) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectEvent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-[#FFFEFD] w-full max-w-md h-full overflow-y-auto border-l border-[#E5E0D8] shadow-2xl flex flex-col justify-between">
        <div>
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-[#FFFEFD]/95 backdrop-blur-md px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E8D7CC] text-[#D95F4B] flex items-center justify-center font-bold">
                <Bell size={16} />
              </div>
              <h2 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A]">
                Cohort Notifications
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllRead}
                className="text-xs font-bold text-[#075E59] hover:underline flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F5F1EC] text-[#1A1A1A] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-4 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isReminder = n.notif_type.includes('REMINDER');
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      onMarkRead(n.id);
                      if (n.event_id) onSelectEvent(n.event_id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      n.is_read
                        ? 'bg-[#FFFEFD] border-[#E5E0D8] opacity-75'
                        : 'bg-[#F5F1EC] border-[#1A1A1A] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                          isReminder ? 'bg-[#D95F4B]' : 'bg-[#075E59]'
                        }`}
                      >
                        {isReminder ? <Clock size={14} /> : <UserCheck size={14} />}
                      </div>

                      <div className="flex-1">
                        <div className="text-xs font-bold text-[#1A1A1A] mb-1">{n.title}</div>
                        {n.body && <div className="text-xs text-[#77736F] leading-snug">{n.body}</div>}
                        <div className="text-[10px] text-[#77736F] mt-2 font-semibold">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-[#77736F]">
                <Bell size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No notifications right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
