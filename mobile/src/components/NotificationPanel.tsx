import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';
import { API_BASE_URL } from '../services/api';

export interface NotificationItem {
  id: number;
  user_id: string;
  notif_type: string; // EVENT_REMINDER_2H, EVENT_REMINDER_24H, FRIEND_RSVP, NEW_PLAN_POSTED
  title: string;
  body?: string;
  event_id?: number;
  is_read: boolean;
  created_at: string;
}

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSelectEvent?: (eventId: number) => void;
}

const API_BASE = API_BASE_URL;

const NOTIF_ICONS: Record<string, string> = {
  EVENT_REMINDER_2H:  '⏰',
  EVENT_REMINDER_24H: '📅',
  FRIEND_RSVP:        '👋',
  NEW_PLAN_POSTED:    '🚀',
};

const NOTIF_ACCENT: Record<string, string> = {
  EVENT_REMINDER_2H:  colors.coral,
  EVENT_REMINDER_24H: colors.forest,
  FRIEND_RSVP:        colors.aubergine,
  NEW_PLAN_POSTED:    colors.ink,
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ visible, onClose, onSelectEvent }) => {
  const { displayFont, sansFont } = useFontTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications?user_id=user_1`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  const handleMarkRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all?user_id=user_1`, { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleTapNotification = (notif: NotificationItem) => {
    if (!notif.is_read) handleMarkRead(notif.id);
    if (notif.event_id && onSelectEvent) {
      onSelectEvent(notif.event_id);
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.panelTitle, { fontFamily: displayFont }]}>Notifications</Text>
              {unreadCount > 0 ? (
                <Text style={[styles.unreadLabel, { fontFamily: sansFont }]}>
                  {unreadCount} unread
                </Text>
              ) : (
                <Text style={[styles.unreadLabel, { fontFamily: sansFont, color: colors.muted }]}>
                  All caught up
                </Text>
              )}
            </View>
            {unreadCount > 0 ? (
              <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
                <Text style={[styles.markAllBtnText, { fontFamily: sansFont }]}>Mark all read</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.ink} />
              <Text style={[styles.loadingText, { fontFamily: sansFont }]}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyIcon]}>🔔</Text>
              <Text style={[styles.emptyTitle, { fontFamily: displayFont }]}>No notifications yet</Text>
              <Text style={[styles.emptyBody, { fontFamily: sansFont }]}>
                RSVP to events and you'll get reminders here before they start.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {notifications.map((notif) => {
                const icon = NOTIF_ICONS[notif.notif_type] || '🔔';
                const accent = NOTIF_ACCENT[notif.notif_type] || colors.ink;
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[styles.notifCard, !notif.is_read && styles.notifCardUnread]}
                    onPress={() => handleTapNotification(notif)}
                    activeOpacity={0.7}
                  >
                    {/* Unread dot */}
                    {!notif.is_read ? (
                      <View style={[styles.unreadDot, { backgroundColor: accent }]} />
                    ) : (
                      <View style={styles.unreadDotPlaceholder} />
                    )}

                    {/* Icon */}
                    <View style={[styles.notifIcon, { backgroundColor: `${accent}18` }]}>
                      <Text style={styles.notifIconText}>{icon}</Text>
                    </View>

                    {/* Body */}
                    <View style={styles.notifContent}>
                      <Text
                        style={[
                          styles.notifTitle,
                          { fontFamily: sansFont },
                          !notif.is_read && styles.notifTitleUnread,
                        ]}
                        numberOfLines={2}
                      >
                        {notif.title}
                      </Text>
                      {notif.body ? (
                        <Text style={[styles.notifBody, { fontFamily: sansFont }]} numberOfLines={2}>
                          {notif.body}
                        </Text>
                      ) : null}
                      <Text style={[styles.notifTime, { fontFamily: sansFont }]}>
                        {timeAgo(notif.created_at)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '75%',
    minHeight: 300,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  unreadLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.coral,
    marginTop: 1,
  },
  markAllBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  markAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  closeBtnText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  // List
  list: { marginTop: 4 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderRule,
    gap: 8,
  },
  notifCardUnread: {
    backgroundColor: `${colors.sand}44`,
    marginHorizontal: -4,
    paddingHorizontal: 8,
    borderRadius: radii.button,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  unreadDotPlaceholder: {
    width: 8,
    height: 8,
    marginTop: 6,
    flexShrink: 0,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifIconText: { fontSize: 18 },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    lineHeight: 17,
  },
  notifTitleUnread: {
    fontWeight: '800',
  },
  notifBody: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 3,
    fontWeight: '600',
  },
  // States
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  emptyBody: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 260,
  },
});
