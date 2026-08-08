import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { EventItem } from '../types';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';

interface FeaturedEventCardProps {
  event: EventItem;
  onPress: (event: EventItem) => void;
  onToggleAttendance: (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => void;
}

export const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({
  event,
  onPress,
  onToggleAttendance,
}) => {
  const { displayFont, sansFont } = useFontTheme();
  const isGoing = event.user_attendance_status === 'GOING';
  const isSpotSuggestion = event.is_suggestion || event.source_type === 'SUGGESTION';

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).toUpperCase();
    } catch {
      return isoString;
    }
  };

  let curationLabel = isSpotSuggestion ? 'LOCAL SPOT RECOMMENDATION' : "EDITOR'S PICK";
  if (!isSpotSuggestion) {
    if (event.going_count >= 2) {
      curationLabel = 'POPULAR WITH YOUR COHORT';
    } else if (event.is_free) {
      curationLabel = 'GOOD & FREE';
    } else if (event.category === 'Outdoor & Fitness') {
      curationLabel = 'SATURDAY MORNING PICK';
    } else if (event.city === 'Chapel Hill' || event.city === 'Durham') {
      curationLabel = 'WORTH THE DRIVE';
    }
  }

  const eyebrowText = `${curationLabel} · ${event.city.toUpperCase()}`;

  const attendeesList = event.attendees || [];
  const goingUsers = attendeesList.filter((a) => a.status === 'GOING');
  let humanSocialText = 'Be the first in your cohort';
  if (goingUsers.length > 0) {
    const firstTwo = goingUsers.slice(0, 2).map((a) => a.user_name.split(' ')[0]);
    const remaining = goingUsers.length - firstTwo.length;
    humanSocialText = remaining > 0 ? `${firstTwo.join(', ')} + ${remaining} friends going` : `${firstTwo.join(' & ')} going`;
  }

  const metaText = isSpotSuggestion
    ? `Anytime Spot · ${event.venue_name || event.city} · ${event.is_free ? 'FREE ENTRY' : `$${event.price_min}`}`
    : `${formatDate(event.start_at)} · ${event.venue_name} · ${event.is_free ? 'FREE' : `$${event.price_min}`}`;

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.92} onPress={() => onPress(event)}>
      <Text style={[styles.eyebrow, { fontFamily: sansFont }, isSpotSuggestion && styles.spotEyebrow]}>{eyebrowText}</Text>

      {event.image_url ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: event.image_url }} style={styles.heroPhoto} resizeMode="cover" />
        </View>
      ) : null}

      <Text style={[styles.serifTitle, { fontFamily: displayFont }]}>{event.title}</Text>

      <Text style={[styles.metaLine, { fontFamily: sansFont }]}>{metaText}</Text>

      {event.description ? (
        <Text style={[styles.description, { fontFamily: sansFont }]} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}

      <View style={styles.actionRow}>
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
          <Text style={[styles.socialText, { fontFamily: sansFont }]}>{humanSocialText}</Text>
        </View>

        <TouchableOpacity
          style={[styles.ctaBtn, isGoing && styles.ctaBtnActive]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleAttendance(event.id, isGoing ? 'NONE' : 'GOING');
          }}
        >
          <Text style={[styles.ctaText, { fontFamily: sansFont }, isGoing && styles.ctaTextActive]}>
            {isGoing ? '✓ You are Going' : "I'm going →"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1,
    marginBottom: 8,
  },
  spotEyebrow: {
    color: colors.forest,
  },
  photoContainer: {
    height: 190,
    width: '100%',
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  serifTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.forest,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
  socialText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  ctaBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.button,
  },
  ctaBtnActive: {
    backgroundColor: colors.forest,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.paper,
  },
  ctaTextActive: {
    color: colors.paper,
  },
});
