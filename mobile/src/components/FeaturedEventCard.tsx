import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { EventItem } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

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
  const isGoing = event.user_attendance_status === 'GOING';

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

  // Build human attendee string
  const attendeesList = event.attendees || [];
  const goingUsers = attendeesList.filter((a) => a.status === 'GOING');
  let humanSocialText = 'Be first from your cohort to join';
  if (goingUsers.length > 0) {
    const firstTwo = goingUsers.slice(0, 2).map((a) => a.user_name.split(' ')[0]);
    const remaining = goingUsers.length - firstTwo.length;
    if (remaining > 0) {
      humanSocialText = `${firstTwo.join(', ')} + ${remaining} more going`;
    } else {
      humanSocialText = `${firstTwo.join(' & ')} going`;
    }
  }

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={() => onPress(event)}>
      {/* Top Banner Tag */}
      <View style={styles.featuredTagBar}>
        <Text style={styles.featuredLabel}>★ FEATURED THIS WEEKEND</Text>
        <Text style={styles.cityLabel}>📍 {event.city}</Text>
      </View>

      {/* Hero Photography */}
      {event.image_url ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image_url }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.priceTicket}>
            <Text style={styles.priceTicketText}>{event.is_free ? 'FREE ENTRY' : `$${event.price_min}`}</Text>
          </View>
        </View>
      ) : null}

      {/* Editorial Content Frame */}
      <View style={styles.contentBody}>
        <Text style={styles.categoryStamp}>{event.category.toUpperCase()}</Text>
        <Text style={styles.serifTitle}>{event.title}</Text>

        <View style={styles.infoLine}>
          <Text style={styles.dateTimeText}>📅 {formatDate(event.start_at)}</Text>
          <Text style={styles.dotSeparator}>·</Text>
          <Text style={styles.venueText}>🏢 {event.venue_name}</Text>
        </View>

        {event.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}

        {/* Provenance & Social Proof Footer */}
        <View style={styles.socialFooter}>
          <View style={styles.socialLeft}>
            <View style={styles.avatarStack}>
              {goingUsers.slice(0, 3).map((a, idx) => (
                <Image
                  key={a.user_id + idx}
                  source={{ uri: a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
                  style={[styles.stackedAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                />
              ))}
            </View>
            <Text style={styles.socialText}>{humanSocialText}</Text>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.ctaButton, isGoing && styles.ctaButtonActive]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleAttendance(event.id, isGoing ? 'NONE' : 'GOING');
            }}
          >
            <Text style={[styles.ctaText, isGoing && styles.ctaTextActive]}>
              {isGoing ? '✓ You are Going' : "I'm going"}
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
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.ink,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.cardShadow}`,
  },
  featuredTagBar: {
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredLabel: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '800',
    color: colors.lilac,
    letterSpacing: 1,
  },
  cityLabel: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '700',
    color: colors.paper,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  priceTicket: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  priceTicketText: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  contentBody: {
    padding: 18,
  },
  categoryStamp: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1,
    marginBottom: 4,
  },
  serifTitle: {
    fontFamily: typography.displayFont,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  dateTimeText: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    fontWeight: '700',
    color: colors.forest,
  },
  dotSeparator: {
    color: colors.muted,
  },
  venueText: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    color: colors.muted,
  },
  description: {
    fontFamily: typography.sansFont,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    marginBottom: 16,
  },
  socialFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.ticketBorder,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.paper,
  },
  socialText: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaButtonActive: {
    backgroundColor: colors.forest,
  },
  ctaText: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    fontWeight: '700',
    color: colors.paper,
  },
  ctaTextActive: {
    color: colors.paper,
  },
});
