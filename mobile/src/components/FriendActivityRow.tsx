import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { EventItem } from '../types';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';

interface FriendActivityRowProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const FriendActivityRow: React.FC<FriendActivityRowProps> = ({ events, onSelectEvent }) => {
  const { displayFont, sansFont } = useFontTheme();
  const socialEvents = events.filter((e) => e.attendees && e.attendees.length > 0);

  if (socialEvents.length === 0) return null;

  const primaryEvent = socialEvents[0];
  const primaryAttendees = primaryEvent.attendees || [];
  const primaryFirstName = primaryAttendees[0]?.user_name.split(' ')[0] || 'Jordan';
  const primaryExtraCount = primaryAttendees.length - 1;

  const secondaryEvents = socialEvents.slice(1, 3);

  return (
    <View style={styles.container}>
      <Text style={[styles.eyebrow, { fontFamily: sansFont }]}>YOUR PEOPLE ARE GOING</Text>

      <TouchableOpacity
        style={styles.storyHero}
        activeOpacity={0.9}
        onPress={() => onSelectEvent(primaryEvent)}
      >
        <Text style={[styles.storyHeadline, { fontFamily: displayFont }]}>
          {primaryFirstName} {primaryExtraCount > 0 ? `+ ${primaryExtraCount} others` : ''} are headed to{' '}
          <Text style={styles.storyEventName}>{primaryEvent.title}</Text>.
        </Text>

        <View style={styles.storyFooter}>
          <View style={styles.avatarStack}>
            {primaryAttendees.slice(0, 4).map((a, idx) => (
              <Image
                key={a.user_id + idx}
                source={{ uri: a.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
                style={[styles.largeAvatar, { marginLeft: idx > 0 ? -10 : 0 }]}
              />
            ))}
          </View>
          <Text style={[styles.storyLink, { fontFamily: sansFont }]}>See who's going →</Text>
        </View>
      </TouchableOpacity>

      {secondaryEvents.map((secEvent) => {
        const secAttendees = secEvent.attendees || [];
        const secName = secAttendees[0]?.user_name.split(' ')[0] || 'Friend';
        const secExtra = secAttendees.length - 1;

        return (
          <TouchableOpacity
            key={secEvent.id}
            style={styles.secRow}
            activeOpacity={0.8}
            onPress={() => onSelectEvent(secEvent)}
          >
            <Text style={[styles.secText, { fontFamily: sansFont }]}>
              <Text style={styles.secName}>{secName}</Text>
              {secExtra > 0 ? ` + ${secExtra}` : ''} →{' '}
              <Text style={styles.secEventTitle}>{secEvent.title}</Text>
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderRule,
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  storyHero: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  storyHeadline: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 12,
  },
  storyEventName: {
    color: colors.coral,
    fontStyle: 'italic',
  },
  storyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  storyLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  secRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderRule,
  },
  secText: {
    fontSize: 13,
    color: colors.muted,
  },
  secName: {
    fontWeight: '700',
    color: colors.ink,
  },
  secEventTitle: {
    fontWeight: '700',
    color: colors.ink,
  },
});
