import React, { useState, useEffect, useCallback } from 'react';
import type { EventItem, NotificationItem, EventCreatePayload } from './types';
import {
  fetchEvents,
  fetchEventById,
  toggleAttendance,
  createCommunityEvent,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  currentUser,
} from './services/api';
import { subscribeAuthState } from './services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

import { Header } from './components/Header';
import { VibeBar } from './components/VibeBar';
import { EventFeed } from './components/EventFeed';
import { EventMapView } from './components/EventMapView';
import { EventDetailModal } from './components/EventDetailModal';
import { ProposePlanModal } from './components/ProposePlanModal';
import { NotificationPanel } from './components/NotificationPanel';
import { UserProfileModal } from './components/UserProfileModal';
import { PublicProfileModal } from './components/PublicProfileModal';
import { AuthModal } from './components/AuthModal';
import { LayoutGrid, Map as MapIcon } from 'lucide-react';

export function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('triangle_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('triangle_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('triangle_theme', 'light');
    }
  }, [darkMode]);

  // Filters
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeType, setSelectedTimeType] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile View Toggle ('feed' vs 'map')
  const [mobileView, setMobileView] = useState<'feed' | 'map'>('feed');

  // Modals
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [publicProfileUserId, setPublicProfileUserId] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeAuthState((u) => {
      setFirebaseUser(u);
      if (u) {
        currentUser.id = u.uid;
        currentUser.name = u.displayName || u.email?.split('@')[0] || 'Cohort Member';
        currentUser.email = u.email || currentUser.email;
        if (u.photoURL) currentUser.avatar_url = u.photoURL;
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    const data = await fetchEvents({
      city: selectedCity,
      category: selectedCategory,
      search: searchQuery,
      free_only: freeOnly,
      time_type: selectedTimeType,
    });
    setEvents(data);
    setLoading(false);
  }, [selectedCity, selectedCategory, searchQuery, freeOnly, selectedTimeType]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Load Notifications
  const loadNotifications = useCallback(async () => {
    const list = await fetchNotifications();
    const count = await fetchUnreadNotificationCount();
    setNotifications(list);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  // Deep Link ?event=123 handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('event');
    if (eventIdParam) {
      const id = parseInt(eventIdParam, 10);
      if (!isNaN(id)) {
        fetchEventById(id).then((ev) => {
          if (ev) setSelectedEventDetail(ev);
        });
      }
    }
  }, []);

  // Handlers
  const handleToggleAttendance = async (eventId: number, status: 'INTERESTED' | 'GOING' | 'NONE') => {
    try {
      const updated = await toggleAttendance(eventId, status);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      if (selectedEventDetail && selectedEventDetail.id === eventId) {
        setSelectedEventDetail(updated);
      }
    } catch (err) {
      alert('Failed to update attendance');
    }
  };

  const handleCreatePlan = async (payload: EventCreatePayload) => {
    const created = await createCommunityEvent(payload);
    setEvents((prev) => [created, ...prev]);
    setSelectedEventDetail(created);
  };

  const handleShare = async (event: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?event=${event.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      alert('🔗 Deep link copied to clipboard!');
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleResetFilters = () => {
    setSelectedCity('All');
    setSelectedCategory('All');
    setSelectedTimeType('all');
    setFreeOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#FFFEFD] dark:bg-[#020916] text-[#1A1A1A] dark:text-[#F8FAFC] flex flex-col justify-between transition-colors">
      <div>
        {/* Header Masthead */}
        <Header
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          unreadCount={unreadCount}
          onOpenNotifications={() => setIsNotifOpen(true)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenProfileModal={() => setIsProfileOpen(true)}
          firebaseUser={firebaseUser}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Vibe Strip & Search */}
        <VibeBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTimeType={selectedTimeType}
          onSelectTimeType={setSelectedTimeType}
          freeOnly={freeOnly}
          onToggleFreeOnly={() => setFreeOnly(!freeOnly)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Mobile View Switcher (Visible only on < lg screens) */}
        <div className="lg:hidden bg-[#F5F1EC] dark:bg-[#0B172E] border-b border-[#E5E0D8] dark:border-white/10 px-6 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-[#77736F] dark:text-[#94A3B8]">
            {events.length} {events.length === 1 ? 'Plan' : 'Plans'} Found
          </span>

          <div className="flex items-center bg-[#FFFEFD] dark:bg-[#050E21] p-1 rounded-lg border border-[#E5E0D8] dark:border-white/10">
            <button
              onClick={() => setMobileView('feed')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                mobileView === 'feed' ? 'bg-[#1A1A1A] dark:bg-[#0018A8] text-white' : 'text-[#77736F] dark:text-[#94A3B8]'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                mobileView === 'map' ? 'bg-[#1A1A1A] dark:bg-[#0018A8] text-white' : 'text-[#77736F] dark:text-[#94A3B8]'
              }`}
            >
              <MapIcon size={13} />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Area */}
        <main className="layout-container py-8">
          {/* Desktop Split Screen Layout (lg:grid) */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            {/* Left 7 Columns: Editorial Feed */}
            <div className={`lg:col-span-7 ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
              <EventFeed
                events={events}
                loading={loading}
                searchQuery={searchQuery}
                onSelectEvent={setSelectedEventDetail}
                onToggleAttendance={handleToggleAttendance}
                onShare={handleShare}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Right 5 Columns: Sticky Interactive Map */}
            <div className={`lg:col-span-5 lg:sticky lg:top-20 ${mobileView === 'feed' ? 'hidden lg:block' : 'block'}`}>
              <div className="hidden lg:flex items-center justify-between mb-2">
                <h3 className="font-['Bricolage_Grotesque'] text-xs font-bold uppercase tracking-wider text-[#77736F] dark:text-[#94A3B8]">
                  TRIANGLE MAP EXPLORER
                </h3>
              </div>
              <EventMapView
                events={events}
                onSelectEvent={setSelectedEventDetail}
                fullHeight={true}
                darkMode={darkMode}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#F5F1EC] dark:bg-[#050E21] border-t border-[#E5E0D8] dark:border-white/10 py-8 mt-12 transition-colors">
        <div className="layout-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#D95F4B] dark:bg-[#0018A8] text-white flex items-center justify-center font-bold text-[10px]">▲</div>
            <span className="font-['Bricolage_Grotesque'] text-sm font-bold text-[#1A1A1A] dark:text-[#F8FAFC]">Triangle Social Events</span>
            <span className="text-xs text-[#77736F] dark:text-[#94A3B8]">· Cohort of '26</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-[#77736F] dark:text-[#94A3B8]">
            <a href="http://localhost:8000/privacy" target="_blank" rel="noreferrer" className="hover:text-[#1A1A1A] dark:hover:text-[#F8FAFC]">Privacy Policy</a>
            <span>·</span>
            <a href="http://localhost:8000/support" target="_blank" rel="noreferrer" className="hover:text-[#1A1A1A] dark:hover:text-[#F8FAFC]">Support</a>
            <span>·</span>
            <span>RTP Grad Cohort 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <EventDetailModal
        event={selectedEventDetail}
        isOpen={!!selectedEventDetail}
        onClose={() => setSelectedEventDetail(null)}
        onToggleAttendance={handleToggleAttendance}
      />

      <ProposePlanModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePlan}
      />

      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllRead}
        onSelectEvent={async (eventId) => {
          setIsNotifOpen(false);
          const ev = await fetchEventById(eventId);
          if (ev) setSelectedEventDetail(ev);
        }}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={loadEvents}
      />

      <PublicProfileModal
        userId={publicProfileUserId}
        isOpen={!!publicProfileUserId}
        onClose={() => setPublicProfileUserId(null)}
        onSelectEvent={(ev) => setSelectedEventDetail(ev)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={firebaseUser}
        onAuthSuccess={() => loadEvents()}
      />
    </div>
  );
}

export default App;
