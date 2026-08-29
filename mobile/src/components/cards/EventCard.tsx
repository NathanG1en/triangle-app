import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { EventItem } from '../../types';
import { colors, radii } from '../../theme/colors';
import { useFontTheme } from '../../theme/typography';

interface EventCardProps {
  event: EventItem;
  onPress: (event: EventItem) => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, onToggleAttendance }) => {
  const { displayFont, sansFont } = useFontTheme();

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

  const attendeesList = event.attendees || [];
  const goingUsers = attendeesList.filter((a) => a.status === 'GOING');
  let humanSocialText = 'Be first from cohort!';
  if (goingUsers.length > 0) {
    const names = goingUsers.slice(0, 2).map((a) => a.user_name.split(' ')[0]);
    const extra = goingUsers.length - names.length;
    humanSocialText = extra > 0 ? `${names.join(', ')} + ${extra} friends going` : `${names.join(' & ')} going`;
  }

  const isSpotSuggestion = event.is_suggestion || event.source_type === 'SUGGESTION';

  const categoryCityHeader = isSpotSuggestion
    ? `LOCAL SPOT · ${event.city.toUpperCase()}`
    : `${event.category.toUpperCase()} · ${event.city.toUpperCase()}`;

  const timePriceLine = isSpotSuggestion
    ? `Anytime Spot · ${event.is_free ? 'Free Entry' : `$${event.price_min}`} · ${event.venue_name || event.city}`
    : `${formatDate(event.start_at)} · ${event.is_free ? 'Free' : `$${event.price_min}`} · ${event.venue_name}`;

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.88} onPress={() => onPress(event)}>
      <View style={styles.topRow}>
        <View style={styles.textContent}>
          <Text style={[styles.catCityHeader, { fontFamily: sansFont }, isSpotSuggestion && styles.spotHeader]}>
            {categoryCityHeader}
          </Text>

          <Text style={[styles.serifTitle, { fontFamily: displayFont }]} numberOfLines={2}>
            {event.title}
          </Text>

          <Text style={[styles.timePriceText, { fontFamily: sansFont }]} numberOfLines={1}>
            {timePriceLine}
          </Text>
        </View>

        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={styles.thumbnail} resizeMode="cover" />
        ) : null}
      </View>

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
          <Text style={[styles.humanSocialText, { fontFamily: sansFont }]}>{humanSocialText}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, isInterested && styles.interestedActive]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleAttendance(event.id, isInterested ? 'NONE' : 'INTERESTED');
            }}
          >
            <Text style={[styles.actionBtnText, { fontFamily: sansFont }, isInterested && styles.activeBtnText]}>
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
            <Text style={[styles.actionBtnText, { fontFamily: sansFont }, isGoing && styles.activeBtnText]}>
              {isGoing ? '✓ Going' : '+ Going'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderRule,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  textContent: {
    flex: 1,
  },
  catCityHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  spotHeader: {
    color: colors.forest,
  },
  serifTitle: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  timePriceText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radii.button,
    backgroundColor: colors.surface,
  },
  footer: {
    marginTop: 6,
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
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  humanSocialText: {
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
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
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
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
  activeBtnText: {
    color: colors.paper,
    fontWeight: '700',
  },
});
