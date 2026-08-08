import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { EventItem } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface FriendActivityRowProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const FriendActivityRow: React.FC<FriendActivityRowProps> = ({ events, onSelectEvent }) => {
  // Filter events with attending cohort members
  const socialEvents = events.filter((e) => e.attendees && e.attendees.length > 0);

  if (socialEvents.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>YOUR PEOPLE ARE GOING</Text>
        <Text style={styles.subTitle}>Cohort activity this week</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {socialEvents.map((event) => {
          const topAttendee = event.attendees[0];
          const remainingCount = event.attendees.length - 1;

          return (
            <TouchableOpacity
              key={event.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => onSelectEvent(event)}
            >
              <View style={styles.topRow}>
                <Image
                  source={{ uri: topAttendee.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {topAttendee.user_name}
                  </Text>
                  <Text style={styles.userStatus}>
                    {remainingCount > 0 ? `+ ${remainingCount} cohort friends` : 'marked Going'}
                  </Text>
                </View>
              </View>

              <View style={styles.eventBox}>
                <Text style={styles.cityBadge}>📍 {event.city}</Text>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.venueText} numberOfLines={1}>
                  🏢 {event.venue_name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontFamily: typography.displayFont,
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  scroll: {
    paddingLeft: 20,
  },
  card: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.coral,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  userStatus: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    color: colors.muted,
  },
  eventBox: {
    backgroundColor: colors.paper,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  cityBadge: {
    fontFamily: typography.sansFont,
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 2,
  },
  eventTitle: {
    fontFamily: typography.displayFont,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  venueText: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    color: colors.muted,
  },
});
