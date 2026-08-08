import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { EventItem } from '../types';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';

interface EventDetailModalProps {
  event: EventItem | null;
  visible: boolean;
  onClose: () => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
  onOpenCalendarModal?: (event: EventItem) => void;
  onProposeSpotPlan?: (spot: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  visible,
  onClose,
  onToggleAttendance,
  onOpenCalendarModal,
  onProposeSpotPlan,
}) => {
  const { displayFont, sansFont } = useFontTheme();
  const [attendeeTab, setAttendeeTab] = useState<'ALL' | 'GOING' | 'INTERESTED'>('ALL');

  if (!event) return null;

  const isGoing = event.user_attendance_status === 'GOING';
  const isInterested = event.user_attendance_status === 'INTERESTED';
  const isSpotSuggestion = event.is_suggestion || event.source_type === 'SUGGESTION';

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

  const formattedTimeOrSpot = isSpotSuggestion
    ? 'LOCAL SPOT RECOMMENDATION · OPEN REGULAR HOURS'
    : new Date(event.start_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={[styles.cityTag, isSpotSuggestion && styles.spotCityTag]}>
              <Text style={[styles.cityText, { fontFamily: sansFont }, isSpotSuggestion && styles.spotCityText]}>
                {isSpotSuggestion ? 'LOCAL SPOT SUGGESTION' : `${event.city.toUpperCase()} · NC`}
              </Text>
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
                <View style={[styles.catSticker, isSpotSuggestion && styles.spotSticker]}>
                  <Text style={[styles.catStickerText, { fontFamily: sansFont }]}>
                    {isSpotSuggestion ? 'SPOT' : event.category.toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Display Title */}
            <Text style={[styles.serifTitle, { fontFamily: displayFont }]}>{event.title}</Text>

            {/* Quick Metadata */}
            <View style={styles.metaRow}>
              <Text style={[styles.metaTime, { fontFamily: sansFont }, isSpotSuggestion && styles.spotMetaTime]}>
                {formattedTimeOrSpot}
              </Text>
              <Text style={[styles.metaPrice, { fontFamily: sansFont }]}>
                {event.is_free ? 'FREE ENTRY' : `$${event.price_min}`}
              </Text>
            </View>

            {/* Venue & Location Box */}
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Text style={[styles.venueTitle, { fontFamily: sansFont }]}>{event.venue_name || event.city}</Text>
                {event.address ? <Text style={[styles.addressText, { fontFamily: sansFont }]}>{event.address}</Text> : null}
              </View>

              <View style={styles.locationActions}>
                <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
                  <Text style={[styles.mapBtnText, { fontFamily: sansFont }]}>Open Maps →</Text>
                </TouchableOpacity>

                {!isSpotSuggestion && onOpenCalendarModal ? (
                  <TouchableOpacity
                    style={styles.calBtn}
                    onPress={() => onOpenCalendarModal(event)}
                  >
                    <Text style={[styles.calBtnText, { fontFamily: sansFont }]}>📅 Add to Calendar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Propose Date & Time Card for Spots */}
            {isSpotSuggestion && onProposeSpotPlan ? (
              <TouchableOpacity
                style={styles.proposeSpotCard}
                onPress={() => {
                  onClose();
                  onProposeSpotPlan(event);
                }}
              >
                <View style={styles.proposeSpotContent}>
                  <Text style={[styles.proposeSpotTitle, { fontFamily: displayFont }]}>
                    💡 Propose a Date & Time for Cohort
                  </Text>
                  <Text style={[styles.proposeSpotSub, { fontFamily: sansFont }]}>
                    Schedule a specific hangout time here so members can RSVP & sync to Google/Apple Calendar!
                  </Text>
                </View>
                <View style={styles.proposeBtnPill}>
                  <Text style={[styles.proposeBtnPillText, { fontFamily: sansFont }]}>📅 Schedule →</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {/* Description */}
            <Text style={[styles.sectionHeading, { fontFamily: displayFont }]}>
              {isSpotSuggestion ? 'About this spot' : 'About this event'}
            </Text>
            <Text style={[styles.descriptionText, { fontFamily: sansFont }]}>
              {event.description || 'No detailed description available.'}
            </Text>

            {/* Source Provenance */}
            <View style={styles.sourceBox}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sourceLabel, { fontFamily: sansFont }]}>Source: {event.source_name}</Text>
                <Text style={[styles.sourceSub, { fontFamily: sansFont }]}>
                  {isSpotSuggestion ? 'Curated Cohort Spot' : `Ingested via ${event.source_type}`}
                </Text>
              </View>
              {event.source_url ? (
                <TouchableOpacity style={styles.sourceBtn} onPress={openSource}>
                  <Text style={[styles.sourceBtnText, { fontFamily: sansFont }]}>Original Page ↗</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Social RSVP Control Section */}
            <View style={styles.rsvpSection}>
              <Text style={[styles.sectionHeading, { fontFamily: displayFont }]}>
                {isSpotSuggestion ? 'Meet Up With Cohort' : 'Your Cohort Plan'}
              </Text>
              <View style={styles.rsvpButtonsRow}>
                <TouchableOpacity
                  style={[styles.rsvpBtn, isInterested && styles.rsvpInterestedActive]}
                  onPress={() => onToggleAttendance(event.id, isInterested ? 'NONE' : 'INTERESTED')}
                >
                  <Text style={[styles.rsvpBtnText, { fontFamily: sansFont }, isInterested && styles.rsvpActiveText]}>
                    {isInterested ? '★ Interested' : '☆ Mark Interested'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.rsvpBtn, isGoing && styles.rsvpGoingActive]}
                  onPress={() => onToggleAttendance(event.id, isGoing ? 'NONE' : 'GOING')}
                >
                  <Text style={[styles.rsvpBtnText, { fontFamily: sansFont }, isGoing && styles.rsvpActiveText]}>
                    {isGoing ? '✓ You are Going' : "+ I'm Going"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cohort Attendees List */}
            <View style={styles.attendeesSection}>
              <View style={styles.attendeesHeader}>
                <Text style={[styles.sectionHeading, { fontFamily: displayFont }]}>
                  Cohort Members Attending ({event.attendees?.length || 0})
                </Text>
                <View style={styles.tabPills}>
                  <TouchableOpacity
                    style={[styles.tabPill, attendeeTab === 'ALL' && styles.tabPillActive]}
                    onPress={() => setAttendeeTab('ALL')}
                  >
                    <Text style={[styles.tabPillText, { fontFamily: sansFont }]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabPill, attendeeTab === 'GOING' && styles.tabPillActive]}
                    onPress={() => setAttendeeTab('GOING')}
                  >
                    <Text style={[styles.tabPillText, { fontFamily: sansFont }]}>Going ({event.going_count})</Text>
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
                      <Text style={[styles.attendeeName, { fontFamily: sansFont }]}>{a.user_name}</Text>
                      <Text style={[styles.attendeeCohort, { fontFamily: sansFont }]}>Cohort of 2026</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        a.status === 'GOING' ? styles.statusGoing : styles.statusInterested,
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { fontFamily: sansFont }]}>{a.status}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyAttendees, { fontFamily: sansFont }]}>
                  No cohort members listed for this filter yet.
                </Text>
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
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderRule,
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
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  spotCityTag: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  cityText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  spotCityText: {
    color: colors.coral,
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
    borderRadius: radii.card,
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
    borderRadius: radii.button,
  },
  spotSticker: {
    backgroundColor: colors.forest,
  },
  catStickerText: {
    color: colors.paper,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  serifTitle: {
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
    color: colors.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  spotMetaTime: {
    color: colors.coral,
  },
  metaPrice: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  locationInfo: {
    flex: 1,
    marginRight: 10,
  },
  venueTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  addressText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  locationActions: {
    gap: 6,
  },
  mapBtn: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: 'center',
  },
  mapBtnText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  calBtn: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    alignItems: 'center',
  },
  calBtnText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  proposeSpotCard: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
    borderWidth: 1.5,
    borderRadius: radii.button,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proposeSpotContent: {
    flex: 1,
    marginRight: 10,
  },
  proposeSpotTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  proposeSpotSub: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
  },
  proposeBtnPill: {
    backgroundColor: colors.coral,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.button,
  },
  proposeBtnPillText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  descriptionText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  sourceBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  sourceLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  sourceSub: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  sourceBtn: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  sourceBtnText: {
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
    borderRadius: radii.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderRule,
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
    borderRadius: radii.button,
  },
  tabPillActive: {
    backgroundColor: colors.surface,
  },
  tabPillText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: radii.button,
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
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  attendeeCohort: {
    color: colors.muted,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.button,
  },
  statusGoing: {
    backgroundColor: '#D1EBE7',
  },
  statusInterested: {
    backgroundColor: colors.sand,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.ink,
  },
  emptyAttendees: {
    color: colors.muted,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 4,
  },
});
