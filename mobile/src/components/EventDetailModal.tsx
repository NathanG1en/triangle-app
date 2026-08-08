import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { EventItem } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface EventDetailModalProps {
  event: EventItem | null;
  visible: boolean;
  onClose: () => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  visible,
  onClose,
  onToggleAttendance,
}) => {
  const [attendeeTab, setAttendeeTab] = useState<'ALL' | 'GOING' | 'INTERESTED'>('ALL');

  if (!event) return null;

  const isGoing = event.user_attendance_status === 'GOING';
  const isInterested = event.user_attendance_status === 'INTERESTED';

  const openMap = () => {
    const loc = encodeURIComponent(`${event.venue_name || ''} ${event.address || ''} ${event.city} NC`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${loc}`);
  };

  const openSource = () => {
    if (event.source_url) {
      Linking.openURL(event.source_url);
    }
  };

  const filteredAttendees = (event.attendees || []).filter((a) => {
    if (attendeeTab === 'GOING') return a.status === 'GOING';
    if (attendeeTab === 'INTERESTED') return a.status === 'INTERESTED';
    return true;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.cityTag}>
              <Text style={styles.cityText}>📍 {event.city}, NC</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Cover Frame */}
            {event.image_url ? (
              <View style={styles.heroCoverBox}>
                <Image source={{ uri: event.image_url }} style={styles.heroCoverImage} resizeMode="cover" />
                <View style={styles.catSticker}>
                  <Text style={styles.catStickerText}>{event.category.toUpperCase()}</Text>
                </View>
              </View>
            ) : null}

            {/* Serif Title */}
            <Text style={styles.serifTitle}>{event.title}</Text>

            {/* Quick Metadata */}
            <View style={styles.metaRow}>
              <Text style={styles.metaTime}>📅 {new Date(event.start_at).toLocaleString()}</Text>
              <Text style={styles.metaPrice}>{event.is_free ? 'FREE ENTRY' : `$${event.price_min}`}</Text>
            </View>

            {/* Venue & Location Box */}
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Text style={styles.venueTitle}>{event.venue_name}</Text>
                {event.address ? <Text style={styles.addressText}>{event.address}</Text> : null}
              </View>
              <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
                <Text style={styles.mapBtnText}>🗺️ Open Maps</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.sectionHeading}>About this event</Text>
            <Text style={styles.descriptionText}>
              {event.description || 'No detailed description available for this community event.'}
            </Text>

            {/* Source Provenance */}
            <View style={styles.sourceBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sourceLabel}>Source: {event.source_name}</Text>
                <Text style={styles.sourceSub}>Ingested via {event.source_type}</Text>
              </View>
              {event.source_url ? (
                <TouchableOpacity style={styles.sourceBtn} onPress={openSource}>
                  <Text style={styles.sourceBtnText}>Original Page ↗</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Social RSVP Control Section */}
            <View style={styles.rsvpSection}>
              <Text style={styles.sectionHeading}>Your Cohort Plan</Text>
              <View style={styles.rsvpButtonsRow}>
                <TouchableOpacity
                  style={[styles.rsvpBtn, isInterested && styles.rsvpInterestedActive]}
                  onPress={() => onToggleAttendance(event.id, isInterested ? 'NONE' : 'INTERESTED')}
                >
                  <Text style={[styles.rsvpBtnText, isInterested && styles.rsvpActiveText]}>
                    {isInterested ? '★ Interested' : '☆ Mark Interested'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.rsvpBtn, isGoing && styles.rsvpGoingActive]}
                  onPress={() => onToggleAttendance(event.id, isGoing ? 'NONE' : 'GOING')}
                >
                  <Text style={[styles.rsvpBtnText, isGoing && styles.rsvpActiveText]}>
                    {isGoing ? '✓ You are Going' : "+ I'm Going"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cohort Attendees List */}
            <View style={styles.attendeesSection}>
              <View style={styles.attendeesHeader}>
                <Text style={styles.sectionHeading}>Cohort Members Attending ({event.attendees?.length || 0})</Text>
                <View style={styles.tabPills}>
                  <TouchableOpacity
                    style={[styles.tabPill, attendeeTab === 'ALL' && styles.tabPillActive]}
                    onPress={() => setAttendeeTab('ALL')}
                  >
                    <Text style={styles.tabPillText}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabPill, attendeeTab === 'GOING' && styles.tabPillActive]}
                    onPress={() => setAttendeeTab('GOING')}
                  >
                    <Text style={styles.tabPillText}>Going ({event.going_count})</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((a) => (
                  <View key={a.user_id} style={styles.attendeeRow}>
                    <Image
                      source={{ uri: a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
                      style={styles.attendeeAvatar}
                    />
                    <View style={styles.attendeeInfo}>
                      <Text style={styles.attendeeName}>{a.user_name}</Text>
                      <Text style={styles.attendeeCohort}>Cohort of 2026</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        a.status === 'GOING' ? styles.statusGoing : styles.statusInterested,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>{a.status}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyAttendees}>No cohort members listed for this filter yet.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cityTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  cityText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  closeBtnText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroCoverBox: {
    height: 180,
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  heroCoverImage: {
    width: '100%',
    height: '100%',
  },
  catSticker: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.coral,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catStickerText: {
    fontFamily: typography.sansFont,
    color: colors.paper,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  serifTitle: {
    fontFamily: typography.displayFont,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metaTime: {
    fontFamily: typography.sansFont,
    color: colors.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  metaPrice: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  locationInfo: {
    flex: 1,
    marginRight: 10,
  },
  venueTitle: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  addressText: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  mapBtn: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  mapBtnText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontFamily: typography.displayFont,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  descriptionText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  sourceBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  sourceLabel: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  sourceSub: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  sourceBtn: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  sourceBtnText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  rsvpSection: {
    marginBottom: 20,
  },
  rsvpButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  rsvpBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  rsvpInterestedActive: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  rsvpGoingActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  rsvpBtnText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  rsvpActiveText: {
    color: colors.paper,
  },
  attendeesSection: {
    marginTop: 6,
  },
  attendeesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tabPills: {
    flexDirection: 'row',
    gap: 4,
  },
  tabPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tabPillActive: {
    backgroundColor: colors.surface,
  },
  tabPillText: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  attendeeCohort: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusGoing: {
    backgroundColor: '#D1EBE7',
  },
  statusInterested: {
    backgroundColor: colors.sand,
  },
  statusBadgeText: {
    fontFamily: typography.sansFont,
    fontSize: 10,
    fontWeight: '800',
    color: colors.ink,
  },
  emptyAttendees: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 4,
  },
});
