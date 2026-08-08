import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { EventItem, EventCreatePayload } from '../types';
import { fetchEvents, toggleAttendance, createCommunityEvent } from '../services/api';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';
import { Header } from '../components/Header';
import { FeaturedEventCard } from '../components/FeaturedEventCard';
import { FriendActivityRow } from '../components/FriendActivityRow';
import { EventCard } from '../components/EventCard';
import { EventDetailModal } from '../components/EventDetailModal';
import { CreateEventModal } from '../components/CreateEventModal';
import { FilterSheetModal } from '../components/FilterSheetModal';
import { IngestionModal } from '../components/IngestionModal';
import { CalendarExportModal } from '../components/CalendarExportModal';
import { ProposeSpotPlanModal } from '../components/ProposeSpotPlanModal';

export const DiscoverScreen: React.FC = () => {
  const { displayFont, sansFont } = useFontTheme();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'weekend'>('all');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeTypeFilter, setTimeTypeFilter] = useState<'all' | 'timed' | 'untimed'>('all');

  const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);
  const [showIngestionModal, setShowIngestionModal] = useState<boolean>(false);
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarTargetEvent, setCalendarTargetEvent] = useState<EventItem | null>(null);

  const [proposeTargetSpot, setProposeTargetSpot] = useState<EventItem | null>(null);
  const [showProposeModal, setShowProposeModal] = useState<boolean>(false);

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const data = await fetchEvents({
        city: selectedCity,
        category: selectedCategory,
        search: searchQuery,
        date_filter: dateFilter,
        free_only: freeOnly,
        time_type: timeTypeFilter,
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCity, selectedCategory, searchQuery, dateFilter, freeOnly, timeTypeFilter]);

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
    showBanner(`🎉 Post "${newEvent.title}" published to your cohort!`);
  };

  const handleSpotPlanScheduled = (createdEvent: EventItem) => {
    setShowProposeModal(false);
    loadEvents();
    setCalendarTargetEvent(createdEvent);
    setShowCalendarModal(true);
    showBanner(`🚀 Scheduled hangout "${createdEvent.title}" posted! Add it to your calendar.`);
  };

  const handleIngestionComplete = (count: number) => {
    loadEvents();
    showBanner(`⚡ Scraped & updated ${count} latest events from Durham Lowdown, Indy Week & Raleigh Mag!`);
  };

  const resetFilters = () => {
    setSelectedCity('All');
    setSelectedCategory('All');
    setDateFilter('all');
    setFreeOnly(false);
    setTimeTypeFilter('all');
    setSearchQuery('');
  };

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(null);
    }, 5000);
  };

  const featuredEvent = events.length > 0 ? events[0] : null;
  const feedEvents = events.length > 0 ? events.slice(1) : [];

  const hasActiveFilterSheet = selectedCity !== 'All' || selectedCategory !== 'All' || timeTypeFilter !== 'all';

  let sectionTitle = `${events.length} things worth doing around the Triangle`;
  if (timeTypeFilter === 'timed') {
    sectionTitle = `⏰ Showing ${events.length} Scheduled Timed Events`;
  } else if (timeTypeFilter === 'untimed') {
    sectionTitle = `📍 Showing ${events.length} Anytime Spot Suggestions`;
  } else if (selectedCity !== 'All') {
    sectionTitle = `Worth the drive to ${selectedCity} (${events.length})`;
  } else if (freeOnly) {
    sectionTitle = `Free stuff worth leaving the apartment for (${events.length})`;
  } else if (dateFilter === 'today') {
    sectionTitle = `What's happening today (${events.length})`;
  } else if (dateFilter === 'weekend') {
    sectionTitle = `${events.length} things worth doing this weekend`;
  }

  return (
    <View style={styles.container}>
      <Header
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenIngestion={() => setShowIngestionModal(true)}
        onOpenSyncCalendar={() => {
          setCalendarTargetEvent(null);
          setShowCalendarModal(true);
        }}
      />

      {bannerMessage ? (
        <View style={styles.banner}>
          <Text style={[styles.bannerText, { fontFamily: sansFont }]}>{bannerMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}
      >
        <View style={styles.discoveryToolbar}>
          <View style={styles.searchBox}>
            <TextInput
              style={[styles.searchInput, { fontFamily: sansFont }]}
              placeholder="Search events, spots, or activities..."
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

          <View style={styles.chipsRow}>
            <TouchableOpacity
              style={[styles.chipPill, timeTypeFilter === 'timed' && styles.chipActive]}
              onPress={() => setTimeTypeFilter(timeTypeFilter === 'timed' ? 'all' : 'timed')}
            >
              <Text style={[styles.chipText, { fontFamily: sansFont }, timeTypeFilter === 'timed' && styles.chipTextActive]}>
                ⏰ Timed Events
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chipPill, timeTypeFilter === 'untimed' && styles.chipActive]}
              onPress={() => setTimeTypeFilter(timeTypeFilter === 'untimed' ? 'all' : 'untimed')}
            >
              <Text style={[styles.chipText, { fontFamily: sansFont }, timeTypeFilter === 'untimed' && styles.chipTextActive]}>
                📍 Anytime Spots
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chipPill, dateFilter === 'weekend' && styles.chipActive]}
              onPress={() => setDateFilter(dateFilter === 'weekend' ? 'all' : 'weekend')}
            >
              <Text style={[styles.chipText, { fontFamily: sansFont }, dateFilter === 'weekend' && styles.chipTextActive]}>
                This Weekend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chipPill, freeOnly && styles.chipActive]}
              onPress={() => setFreeOnly(!freeOnly)}
            >
              <Text style={[styles.chipText, { fontFamily: sansFont }, freeOnly && styles.chipTextActive]}>
                {freeOnly ? '✓ Free' : 'Free'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterSheetBtn, hasActiveFilterSheet && styles.filterSheetActive]}
              onPress={() => setShowFilterSheet(true)}
            >
              <Text style={[styles.filterSheetText, { fontFamily: sansFont }, hasActiveFilterSheet && styles.filterSheetTextActive]}>
                {selectedCity !== 'All' ? `📍 ${selectedCity}` : 'Filters ⚙'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.ink} />
            <Text style={[styles.loadingText, { fontFamily: sansFont }]}>Curating cohort events & spots around the Triangle...</Text>
          </View>
        ) : (
          <View style={styles.altWeeklyLayout}>
            {featuredEvent ? (
              <FeaturedEventCard
                event={featuredEvent}
                onPress={(item) => setActiveModalEvent(item)}
                onToggleAttendance={handleToggleAttendance}
              />
            ) : null}

            <FriendActivityRow
              events={events}
              onSelectEvent={(item) => setActiveModalEvent(item)}
            />

            <View style={styles.sectionHeaderBar}>
              <Text style={[styles.sectionHeadline, { fontFamily: displayFont }]}>{sectionTitle}</Text>
            </View>

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
                <Text style={[styles.emptyTitle, { fontFamily: displayFont }]}>No listings found</Text>
                <Text style={[styles.emptySubtitle, { fontFamily: sansFont }]}>
                  Try clearing your search or filters, or post a new spot for your cohort!
                </Text>
                <TouchableOpacity style={styles.resetLink} onPress={resetFilters}>
                  <Text style={[styles.resetLinkText, { fontFamily: sansFont }]}>Clear all filters</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <FilterSheetModal
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        freeOnly={freeOnly}
        onToggleFreeOnly={() => setFreeOnly(!freeOnly)}
        timeType={timeTypeFilter}
        onSelectTimeType={setTimeTypeFilter}
        onReset={resetFilters}
      />

      <IngestionModal
        visible={showIngestionModal}
        onClose={() => setShowIngestionModal(false)}
        onIngestionComplete={handleIngestionComplete}
      />

      <EventDetailModal
        event={activeModalEvent}
        visible={!!activeModalEvent}
        onClose={() => setActiveModalEvent(null)}
        onToggleAttendance={handleToggleAttendance}
        onOpenCalendarModal={(ev) => {
          setCalendarTargetEvent(ev);
          setShowCalendarModal(true);
        }}
        onProposeSpotPlan={(spot) => {
          setProposeTargetSpot(spot);
          setShowProposeModal(true);
        }}
      />

      <ProposeSpotPlanModal
        spot={proposeTargetSpot}
        visible={showProposeModal}
        onClose={() => setShowProposeModal(false)}
        onPlanScheduled={handleSpotPlanScheduled}
      />

      <CalendarExportModal
        event={calendarTargetEvent}
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
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
    padding: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: radii.button,
  },
  bannerText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  discoveryToolbar: {
    marginVertical: 10,
  },
  searchBox: {
    position: 'relative',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  clearSearch: {
    position: 'absolute',
    right: 12,
    top: 9,
  },
  clearSearchText: {
    color: colors.muted,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  chipActive: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  chipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    fontWeight: '800',
    color: colors.ink,
  },
  filterSheetBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderRule,
    marginLeft: 'auto',
  },
  filterSheetActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  filterSheetText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  filterSheetTextActive: {
    color: colors.paper,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 10,
  },
  altWeeklyLayout: {
    marginTop: 2,
  },
  sectionHeaderBar: {
    marginTop: 12,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ink,
  },
  sectionHeadline: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  resetLink: {
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.button,
  },
  resetLinkText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: '700',
  },
});
