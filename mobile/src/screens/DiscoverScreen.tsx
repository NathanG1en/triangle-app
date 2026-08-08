import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { EventItem, EventCreatePayload } from '../types';
import { fetchEvents, toggleAttendance, createCommunityEvent, triggerSampleIngestion } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Header } from '../components/Header';
import { FeaturedEventCard } from '../components/FeaturedEventCard';
import { FriendActivityRow } from '../components/FriendActivityRow';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { CreateEventModal } from '../components/CreateEventModal';

const CITIES = ['All', 'Durham', 'Cary', 'Raleigh', 'Morrisville', 'Chapel Hill'];
const CATEGORIES = ['All', 'Food & Drink', 'Outdoor & Fitness', 'Tech & Professional', 'Arts & Music', 'Sports', 'Social'];

export const DiscoverScreen: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'weekend'>('all');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const data = await fetchEvents({
        city: selectedCity,
        category: selectedCategory,
        search: searchQuery,
        date_filter: dateFilter,
        free_only: freeOnly,
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCity, selectedCategory, searchQuery, dateFilter, freeOnly]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleToggleAttendance = async (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => {
    try {
      const updated = await toggleAttendance(eventId, status);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      if (activeModalEvent && activeModalEvent.id === eventId) {
        setActiveModalEvent(updated);
      }
    } catch (err) {
      alert('Could not update attendance status');
    }
  };

  const handleCreateEvent = async (payload: EventCreatePayload) => {
    const newEvent = await createCommunityEvent(payload);
    setEvents((prev) => [newEvent, ...prev]);
    showBanner(`🎉 Event "${newEvent.title}" posted to cohort!`);
  };

  const handleTriggerIngest = async () => {
    try {
      setLoading(true);
      const ingested = await triggerSampleIngestion();
      await loadEvents();
      showBanner(`⚡ Ingested ${ingested.length} latest events from Durham Lowdown Newsletter!`);
    } catch (err) {
      alert('Failed to trigger ingestion process');
    } finally {
      setLoading(false);
    }
  };

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(null);
    }, 4500);
  };

  const featuredEvent = events.length > 0 ? events[0] : null;
  const feedEvents = events.length > 0 ? events.slice(1) : [];

  return (
    <View style={styles.container}>
      <Header
        onOpenCreate={() => setShowCreateModal(true)}
        onTriggerIngest={handleTriggerIngest}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {bannerMessage ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{bannerMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search Cary, Durham, Raleigh activities..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity style={styles.clearSearch} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* City Filter Horizontal Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.cityPill, selectedCity === city && styles.activeCityPill]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.cityPillText, selectedCity === city && styles.activeCityText]}>
                {city === 'All' ? '🌐 All Triangle' : `📍 ${city}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date Filter & Free Pill */}
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity
            style={[styles.dateTab, dateFilter === 'all' && styles.activeDateTab]}
            onPress={() => setDateFilter('all')}
          >
            <Text style={[styles.dateTabText, dateFilter === 'all' && styles.activeDateText]}>All Upcoming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateTab, dateFilter === 'today' && styles.activeDateTab]}
            onPress={() => setDateFilter('today')}
          >
            <Text style={[styles.dateTabText, dateFilter === 'today' && styles.activeDateText]}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateTab, dateFilter === 'weekend' && styles.activeDateTab]}
            onPress={() => setDateFilter('weekend')}
          >
            <Text style={[styles.dateTabText, dateFilter === 'weekend' && styles.activeDateText]}>This Weekend</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.freeChip, freeOnly && styles.activeFreeChip]}
            onPress={() => setFreeOnly(!freeOnly)}
          >
            <Text style={[styles.freeChipText, freeOnly && styles.activeFreeText]}>
              {freeOnly ? '✓ Free' : 'Free Only'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.activeCatChip]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.ink} />
            <Text style={styles.loadingText}>Curating cohort events near you...</Text>
          </View>
        ) : (
          <View style={styles.magazineLayout}>
            {/* 1. Featured Top Event Hero Card */}
            {featuredEvent ? (
              <FeaturedEventCard
                event={featuredEvent}
                onPress={(item) => setActiveModalEvent(item)}
                onToggleAttendance={handleToggleAttendance}
              />
            ) : null}

            {/* 2. "YOUR PEOPLE ARE GOING" Avatar Social Carousel */}
            <FriendActivityRow
              events={events}
              onSelectEvent={(item) => setActiveModalEvent(item)}
            />

            {/* 3. Editorial Collection Header */}
            <View style={styles.feedHeader}>
              <View>
                <Text style={styles.feedSectionLabel}>LOCAL CULTURE DISCOVERY</Text>
                <Text style={styles.feedTitle}>
                  {selectedCity !== 'All' ? `What's Happening in ${selectedCity}` : 'Worth Leaving the House For'}
                </Text>
              </View>
              <Text style={styles.feedCount}>{events.length} Plans</Text>
            </View>

            {/* 4. Event Feed List */}
            {feedEvents.length > 0 ? (
              feedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={(item) => setActiveModalEvent(item)}
                  onToggleAttendance={handleToggleAttendance}
                />
              ))
            ) : !featuredEvent ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No events match your search</Text>
                <Text style={styles.emptySubtitle}>
                  Try selecting a different Triangle city or date, or post a new plan for your cohort!
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <EventDetailModal
        event={activeModalEvent}
        visible={!!activeModalEvent}
        onClose={() => setActiveModalEvent(null)}
        onToggleAttendance={handleToggleAttendance}
      />

      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  banner: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  bannerText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchContainer: {
    marginVertical: 12,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
    fontFamily: typography.sansFont,
  },
  clearSearch: {
    position: 'absolute',
    right: 14,
    top: 10,
  },
  clearSearchText: {
    color: colors.muted,
    fontSize: 16,
  },
  pillsScroll: {
    marginBottom: 10,
  },
  cityPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  activeCityPill: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  cityPillText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  activeCityText: {
    color: colors.paper,
    fontWeight: '700',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  dateTab: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  activeDateTab: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  dateTabText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  activeDateText: {
    color: colors.ink,
    fontWeight: '800',
  },
  freeChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  activeFreeChip: {
    backgroundColor: '#D1EBE7',
    borderColor: colors.forest,
  },
  freeChipText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  activeFreeText: {
    color: colors.forest,
    fontWeight: '700',
  },
  catChip: {
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  activeCatChip: {
    backgroundColor: colors.surface,
    borderColor: colors.ink,
  },
  catChipText: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  activeCatText: {
    color: colors.ink,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 13,
    marginTop: 10,
  },
  magazineLayout: {
    marginTop: 6,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ticketBorder,
  },
  feedSectionLabel: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1.2,
  },
  feedTitle: {
    fontFamily: typography.displayFont,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  feedCount: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  emptyTitle: {
    fontFamily: typography.displayFont,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
