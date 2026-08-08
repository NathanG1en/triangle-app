import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { EventItem } from '../types';
import { fetchEvents, toggleAttendance } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';

export const MyEventsScreen: React.FC = () => {
  const [tab, setTab] = useState<'GOING' | 'INTERESTED'>('GOING');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchEvents({});
      setEvents(data.filter((e) => e.user_attendance_status === tab));
      setLoading(false);
    }
    load();
  }, [tab]);

  const handleToggle = async (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => {
    const updated = await toggleAttendance(eventId, status);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (activeModalEvent && activeModalEvent.id === eventId) {
      setActiveModalEvent(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>YOUR COHORT PLANS</Text>
        <Text style={styles.title}>My Saved & Attending</Text>
        <Text style={styles.subtitle}>Plans you are coordinating with fellow Triangle grads</Text>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'GOING' && styles.activeTabBtn]}
          onPress={() => setTab('GOING')}
        >
          <Text style={[styles.tabBtnText, tab === 'GOING' && styles.activeTabText]}>Going</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'INTERESTED' && styles.activeTabBtn]}
          onPress={() => setTab('INTERESTED')}
        >
          <Text style={[styles.tabBtnText, tab === 'INTERESTED' && styles.activeTabText]}>Interested</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.ink} style={{ marginTop: 40 }} />
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={(item) => setActiveModalEvent(item)}
              onToggleAttendance={handleToggle}
            />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No events marked as {tab.toLowerCase()} yet.</Text>
            <Text style={styles.emptySub}>Browse the Discover tab to find activities in Cary, Durham, Raleigh, or Chapel Hill!</Text>
          </View>
        )}
      </ScrollView>

      <EventDetailModal
        event={activeModalEvent}
        visible={!!activeModalEvent}
        onClose={() => setActiveModalEvent(null)}
        onToggleAttendance={handleToggle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.paper,
  },
  sectionLabel: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: typography.displayFont,
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  subtitle: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: colors.ink,
  },
  tabBtnText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.paper,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  emptyText: {
    fontFamily: typography.displayFont,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
