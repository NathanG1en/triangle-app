import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Linking, TextInput, ActivityIndicator, Platform } from 'react-native';
import { EventItem } from '../types';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';
import { updateEventPhoto, reportEvent, blockUser } from '../services/api';

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
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState<boolean>(false);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [updatingPhoto, setUpdatingPhoto] = useState<boolean>(false);

  // Apple Guideline 1.2 UGC Moderation state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISLEADING' | 'OTHER'>('SPAM');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const [isBlocking, setIsBlocking] = useState<boolean>(false);

  if (!event) return null;

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
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleBlockAuthor = async () => {
    if (!event.created_by_user_id) return;
    try {
      setIsBlocking(true);
      await blockUser(event.created_by_user_id);
      setIsBlocking(false);
      alert(`User blocked. You will no longer see content created by this user.`);
      onClose();
    } catch (err) {
      setIsBlocking(false);
      alert('Failed to block user.');
    }
  };

  const handleSavePhoto = async (newUrl: string) => {
    if (!newUrl.trim()) return;
    setUpdatingPhoto(true);
    try {
      const updated = await updateEventPhoto(event.id, newUrl.trim());
      event.image_url = updated.image_url;
      setShowPhotoPicker(false);
      setPhotoUrlInput('');
    } catch (err) {
      alert('Failed to update event photo');
    } finally {
      setUpdatingPhoto(false);
    }
  };

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

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?event=${event.id}`
      : `https://trianglesocial.app/?event=${event.id}`;

    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: event.title,
          text: `Check out "${event.title}" on Triangle Social!`,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
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
                <TouchableOpacity
                  style={styles.changePhotoSticker}
                  onPress={() => setShowPhotoPicker(!showPhotoPicker)}
                >
                  <Text style={[styles.changePhotoText, { fontFamily: sansFont }]}>📷 Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Photo Picker Drawer */}
            {showPhotoPicker ? (
              <View style={styles.photoPickerBox}>
                <Text style={[styles.photoPickerTitle, { fontFamily: sansFont }]}>
                  Choose Venue Photo Preset or Enter Custom Image URL:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoPresetsRow}>
                  {[
                    { label: '⚾ Stadium', url: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800' },
                    { label: '🍺 Brewery', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800' },
                    { label: '🕹 Arcade', url: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800' },
                    { label: '🌮 Food Hall', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' },
                    { label: '🎨 Art Museum', url: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800' },
                    { label: '🌲 Park Trail', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800' },
                    { label: '☕ Books & Cafe', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.label}
                      style={styles.photoPresetChip}
                      onPress={() => handleSavePhoto(p.url)}
                    >
                      <Text style={[styles.photoPresetText, { fontFamily: sansFont }]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.urlInputRow}>
                  <TextInput
                    style={[styles.urlInput, { fontFamily: sansFont }]}
                    placeholder="Paste custom image URL (https://...)"
                    placeholderTextColor={colors.muted}
                    value={photoUrlInput}
                    onChangeText={setPhotoUrlInput}
                  />
                  <TouchableOpacity style={styles.saveUrlBtn} onPress={() => handleSavePhoto(photoUrlInput)}>
                    {updatingPhoto ? (
                      <ActivityIndicator size="small" color={colors.paper} />
                    ) : (
                      <Text style={[styles.saveUrlText, { fontFamily: sansFont }]}>Save</Text>
                    )}
                  </TouchableOpacity>
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

                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                  <Text style={[styles.shareBtnText, { fontFamily: sansFont }]}>🔗 Share Plan</Text>
                </TouchableOpacity>

                {!isSpotSuggestion && onOpenCalendarModal ? (
                  <TouchableOpacity
                    style={styles.calBtn}
                    onPress={() => onOpenCalendarModal(event)}
                  >
                    <Text style={[styles.calBtnText, { fontFamily: sansFont }]}>📅 Calendar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {shareToast ? (
                <View style={styles.shareToastBanner}>
                  <Text style={[styles.shareToastText, { fontFamily: sansFont }]}>
                    ✓ Share link copied to clipboard!
                  </Text>
                </View>
              ) : null}
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

            {/* Apple App Store Guideline 1.2 UGC Safety Actions */}
            <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderRule, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={() => setShowReportModal(true)}
              >
                <Text style={{ fontSize: 12, color: colors.muted, fontFamily: sansFont }}>🚩 Report Plan</Text>
              </TouchableOpacity>

              {event.created_by_user_id ? (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={handleBlockAuthor}
                  disabled={isBlocking}
                >
                  <Text style={{ fontSize: 12, color: colors.coral, fontWeight: '600', fontFamily: sansFont }}>🚫 Block Author</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>

        {/* Report Content Modal */}
        <Modal visible={showReportModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: colors.paper, borderRadius: 16, padding: 20, width: '100%', maxWidth: 420, borderWidth: 1.5, borderColor: colors.ink }}>
              {reportSuccess ? (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Text style={{ fontSize: 28, marginBottom: 10 }}>✅</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: displayFont, color: colors.ink }}>Report Submitted</Text>
                  <Text style={{ fontSize: 13, color: colors.muted, fontFamily: sansFont, textAlign: 'center', marginTop: 6 }}>
                    Thank you. Our moderation team will review this content within 24 hours.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: displayFont, color: colors.ink, marginBottom: 8 }}>🚩 Report Objectionable Content</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, fontFamily: sansFont, marginBottom: 14 }}>
                    Please select the reason for reporting "{event.title}".
                  </Text>

                  {(['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'MISLEADING', 'OTHER'] as const).map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: radii.button,
                        borderWidth: 1,
                        borderColor: reportReason === reason ? colors.coral : colors.borderRule,
                        backgroundColor: reportReason === reason ? colors.sand : colors.surface,
                        marginBottom: 6,
                      }}
                      onPress={() => setReportReason(reason)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: reportReason === reason ? '700' : '500', color: colors.ink, fontFamily: sansFont }}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TextInput
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: radii.button,
                      borderWidth: 1,
                      borderColor: colors.borderRule,
                      padding: 10,
                      fontSize: 13,
                      fontFamily: sansFont,
                      minHeight: 60,
                      marginTop: 8,
                      marginBottom: 16,
                      color: colors.ink,
                    }}
                    placeholder="Additional details (optional)..."
                    placeholderTextColor={colors.muted}
                    multiline
                    value={reportDetails}
                    onChangeText={setReportDetails}
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.button, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderRule }}
                      onPress={() => setShowReportModal(false)}
                      disabled={isReporting}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, fontFamily: sansFont }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.button, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' }}
                      onPress={handleReportSubmit}
                      disabled={isReporting}
                    >
                      {isReporting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF', fontFamily: sansFont }}>Submit Report</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  changePhotoSticker: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(26, 26, 26, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  changePhotoText: {
    color: colors.paper,
    fontSize: 11,
    fontWeight: '700',
  },
  // Photo Picker Drawer
  photoPickerBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  photoPickerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  photoPresetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  photoPresetChip: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  photoPresetText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: colors.paper,
    color: colors.ink,
    borderRadius: radii.button,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  saveUrlBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveUrlText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: '700',
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
    flexDirection: 'column',
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  locationInfo: {
    width: '100%',
  },
  venueTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  addressText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  locationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mapBtn: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  mapBtnText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: colors.sand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.coral,
  },
  shareBtnText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
  shareToastBanner: {
    backgroundColor: colors.forest,
    padding: 8,
    borderRadius: radii.button,
    marginTop: 8,
    alignItems: 'center',
  },
  shareToastText: {
    color: colors.paper,
    fontSize: 12,
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
