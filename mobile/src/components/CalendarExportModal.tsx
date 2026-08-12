import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, Clipboard } from 'react-native';
import { EventItem } from '../types';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';
import { API_BASE_URL } from '../services/api';

interface CalendarExportModalProps {
  event: EventItem | null;
  visible: boolean;
  onClose: () => void;
}

const BACKEND_BASE_URL = API_BASE_URL;

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  event,
  visible,
  onClose,
}) => {
  const { displayFont, sansFont } = useFontTheme();
  const [copiedFeed, setCopiedFeed] = useState<boolean>(false);

  if (!visible) return null;

  const openGoogleCalendar = async () => {
    if (!event) return;
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/calendar/events/${event.id}/google-url`);
      const data = await res.json();
      if (data.google_calendar_url) {
        Linking.openURL(data.google_calendar_url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadIcsFile = () => {
    if (!event) return;
    const url = `${BACKEND_BASE_URL}/calendar/events/${event.id}/export.ics`;
    Linking.openURL(url);
  };

  const copyIcalFeed = () => {
    const feedUrl = `${BACKEND_BASE_URL}/calendar/users/user_1/feed.ics`;
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(feedUrl);
    }
    setCopiedFeed(true);
    setTimeout(() => {
      setCopiedFeed(false);
    }, 4000);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.topRow}>
            <Text style={[styles.title, { fontFamily: displayFont }]}>Add to Calendar</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {event ? (
            <Text style={[styles.eventTitle, { fontFamily: sansFont }]} numberOfLines={1}>
              {event.title}
            </Text>
          ) : null}

          <View style={styles.optionsList}>
            {/* Google Calendar */}
            <TouchableOpacity style={styles.optionCard} onPress={openGoogleCalendar}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>📅</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { fontFamily: sansFont }]}>Google Calendar</Text>
                <Text style={[styles.optionSub, { fontFamily: sansFont }]}>Open prefilled Google Calendar event form</Text>
              </View>
              <Text style={[styles.arrow, { fontFamily: sansFont }]}>→</Text>
            </TouchableOpacity>

            {/* Apple / Outlook iCal File */}
            <TouchableOpacity style={styles.optionCard} onPress={downloadIcsFile}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>📥</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { fontFamily: sansFont }]}>Apple / Outlook (.ics File)</Text>
                <Text style={[styles.optionSub, { fontFamily: sansFont }]}>Download iCal file for Apple Calendar or Outlook</Text>
              </View>
              <Text style={[styles.arrow, { fontFamily: sansFont }]}>↓</Text>
            </TouchableOpacity>

            {/* Sync Personal Cohort Feed */}
            <TouchableOpacity style={[styles.optionCard, styles.feedCard]} onPress={copyIcalFeed}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🔗</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { fontFamily: sansFont }]}>
                  {copiedFeed ? '✓ Feed URL Copied!' : 'Sync Cohort iCal Feed URL'}
                </Text>
                <Text style={[styles.optionSub, { fontFamily: sansFont }]}>
                  Subscribe to all your "Going" events in iOS/Google Calendar
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.paper,
    borderRadius: radii.card,
    width: '100%',
    maxWidth: 440,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  closeBtnText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.coral,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  feedCard: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  iconText: {
    fontSize: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  optionSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 8,
  },
});
