import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { EventItem } from '../types';
import { colors, categoryColors } from '../theme/colors';
import { typography } from '../theme/typography';

interface EventCardProps {
  event: EventItem;
  onPress: (event: EventItem) => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, onToggleAttendance }) => {
  const catStyle = categoryColors[event.category] || { bg: colors.surface, text: colors.ink };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const isGoing = event.user_attendance_status === 'GOING';
  const isInterested = event.user_attendance_status === 'INTERESTED';

  // Human social text
  const attendeesList = event.attendees || [];
  const goingUsers = attendeesList.filter((a) => a.status === 'GOING');
  let humanSocialText = 'Be first from cohort!';
  if (goingUsers.length > 0) {
    const names = goingUsers.slice(0, 2).map((a) => a.user_name.split(' ')[0]);
    const extra = goingUsers.length - names.length;
    humanSocialText = extra > 0 ? `${names.join(', ')} + ${extra} going` : `${names.join(' & ')} going`;
  }

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress(event)}>
      {/* Thumbnail + Main Meta */}
      <View style={styles.topContent}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.placeholderText, { color: catStyle.text }]}>{event.category[0]}</Text>
          </View>
        )}

        <View style={styles.mainMeta}>
          <View style={styles.badgeRow}>
            <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
              <Text style={[styles.catBadgeText, { color: catStyle.text }]}>{event.category}</Text>
            </View>

            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>📍 {event.city}</Text>
            </View>

            <View style={[styles.priceTag, event.is_free ? styles.freePrice : styles.paidPrice]}>
              <Text style={styles.priceTagText}>{event.is_free ? 'FREE' : `$${event.price_min}`}</Text>
            </View>
          </View>

          <Text style={styles.serifTitle} numberOfLines={2}>
            {event.title}
          </Text>

          <Text style={styles.dateTimeText}>📅 {formatDate(event.start_at)}</Text>
          <Text style={styles.venueText} numberOfLines={1}>
            🏢 {event.venue_name}
          </Text>
        </View>
      </View>

      {/* Source Provenance Label */}
      <View style={styles.sourceRow}>
        <Text style={styles.sourceText}>Source: {event.source_name}</Text>
      </View>

      {/* Social Attendance Footer */}
      <View style={styles.footer}>
        <View style={styles.socialLeft}>
          <View style={styles.avatarStack}>
            {goingUsers.slice(0, 3).map((a, idx) => (
              <Image
                key={a.user_id + idx}
                source={{ uri: a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
                style={[styles.stackedAvatar, { marginLeft: idx > 0 ? -6 : 0 }]}
              />
            ))}
          </View>
          <Text style={styles.humanSocialText}>{humanSocialText}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, isInterested && styles.interestedActive]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleAttendance(event.id, isInterested ? 'NONE' : 'INTERESTED');
            }}
          >
            <Text style={[styles.actionBtnText, isInterested && styles.activeBtnText]}>
              {isInterested ? '★ Interested' : '☆ Interested'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, isGoing && styles.goingActive]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleAttendance(event.id, isGoing ? 'NONE' : 'GOING');
            }}
          >
            <Text style={[styles.actionBtnText, isGoing && styles.activeBtnText]}>
              {isGoing ? '✓ Going' : '+ Going'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
    boxShadow: `0px 2px 6px ${colors.cardShadow}`,
  },
  topContent: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  thumbnailPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: typography.displayFont,
    fontSize: 28,
    fontWeight: '700',
  },
  mainMeta: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catBadgeText: {
    fontFamily: typography.sansFont,
    fontSize: 10,
    fontWeight: '700',
  },
  cityBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  cityBadgeText: {
    fontFamily: typography.sansFont,
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
  },
  priceTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  freePrice: {
    backgroundColor: '#D1EBE7',
  },
  paidPrice: {
    backgroundColor: colors.sand,
  },
  priceTagText: {
    fontFamily: typography.sansFont,
    fontSize: 10,
    fontWeight: '800',
    color: colors.ink,
  },
  serifTitle: {
    fontFamily: typography.displayFont,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  dateTimeText: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    fontWeight: '700',
    color: colors.forest,
  },
  venueText: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    color: colors.muted,
  },
  sourceRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  sourceText: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    color: colors.muted,
    fontStyle: 'italic',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.ticketBorder,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  humanSocialText: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  interestedActive: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  goingActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  actionBtnText: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
  activeBtnText: {
    color: colors.paper,
    fontWeight: '700',
  },
});
