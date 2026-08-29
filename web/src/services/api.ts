import type {
  EventItem,
  EventCreatePayload,
  PlaceSuggestion,
  NotificationItem,
  UserProfile,
  UserUpdatePayload,
  UserProfilePublic
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export const currentUser = {
  id: 'user_1',
  name: 'Alex Chen',
  email: 'alex.chen@gradcohort.org',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  company: 'Cisco / RTP',
  cohort_year: '2026'
};

export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me?user_id=${currentUser.id}`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return await res.json();
  } catch (err) {
    return {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      avatar_url: currentUser.avatar_url,
      cohort_year: currentUser.cohort_year,
      company: currentUser.company,
      bio: 'Building social events for RTP grad students. Love morning 5K runs and Durham coffee spots!',
      city: 'Durham',
      interests: 'Outdoors, Food & Drink, Tech',
      instagram_handle: 'alex_rtp',
      created_at: new Date().toISOString()
    };
  }
}

export async function updateUserProfile(payload: UserUpdatePayload): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me?user_id=${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update user profile');
    const updated = await res.json();

    // Sync in-memory currentUser object
    if (updated.name) currentUser.name = updated.name;
    if (updated.avatar_url) currentUser.avatar_url = updated.avatar_url;
    if (updated.cohort_year) currentUser.cohort_year = updated.cohort_year;
    if (updated.company) currentUser.company = updated.company;

    return updated;
  } catch (err) {
    console.error('Profile update error:', err);
    throw err;
  }
}

export async function fetchPublicUserProfile(userId: string): Promise<UserProfilePublic> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}?current_user_id=${currentUser.id}`);
    if (!res.ok) throw new Error('Failed to fetch public user profile');
    return await res.json();
  } catch (err) {
    const fallbacks = getFallbackEvents({});
    return {
      user: {
        id: userId,
        email: `${userId}@cohort.edu`,
        name: userId.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        cohort_year: '2026',
        city: 'Durham',
        bio: 'RTP Grad Cohort member exploring local events.',
        interests: 'Social, Outdoors',
        created_at: new Date().toISOString()
      },
      created_events: fallbacks.slice(0, 1),
      attending_events: fallbacks.slice(1, 3)
    };
  }
}

export async function fetchEvents(filters: {
  city?: string;
  category?: string;
  search?: string;
  date_filter?: string;
  free_only?: boolean;
  time_type?: string;
}): Promise<EventItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters.city && filters.city !== 'All') params.append('city', filters.city);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.date_filter && filters.date_filter !== 'all') params.append('date_filter', filters.date_filter);
    if (filters.free_only) params.append('free_only', 'true');
    if (filters.time_type && filters.time_type !== 'all') params.append('time_type', filters.time_type);
    params.append('current_user_id', currentUser.id);

    const response = await fetch(`${API_BASE_URL}/events?${params.toString()}`);
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Backend API fetch error, returning curated Triangle mock data:', err);
    return getFallbackEvents(filters);
  }
}

export async function fetchEventById(eventId: number): Promise<EventItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}?current_user_id=${currentUser.id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    const fallbacks = getFallbackEvents({});
    return fallbacks.find(e => e.id === eventId) || null;
  }
}

export async function toggleAttendance(
  eventId: number,
  status: 'INTERESTED' | 'GOING' | 'NONE'
): Promise<EventItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar_url,
        status: status
      })
    });
    if (!response.ok) throw new Error('Failed to update attendance');
    return await response.json();
  } catch (err) {
    console.error('Attendance toggle error:', err);
    throw err;
  }
}

export async function createCommunityEvent(payload: EventCreatePayload): Promise<EventItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/events?current_user_id=${currentUser.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        is_free: payload.is_free ?? true,
        price_min: payload.price_min ?? 0,
        price_max: payload.price_max ?? 0,
        source_name: payload.source_name || 'Community Member'
      })
    });
    if (!response.ok) throw new Error('Failed to create community event');
    return await response.json();
  } catch (err) {
    console.error('Create event error:', err);
    throw err;
  }
}

export async function updateEventPhoto(eventId: number, imageUrl: string): Promise<EventItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/photo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    if (!response.ok) throw new Error('Failed to update event photo');
    return await response.json();
  } catch (err) {
    console.error('Update photo error:', err);
    throw err;
  }
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    await fetch(`${API_BASE_URL}/notifications/generate-reminders?user_id=${currentUser.id}`, { method: 'POST' });
    const response = await fetch(`${API_BASE_URL}/notifications?user_id=${currentUser.id}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    return [
      {
        id: 1,
        user_id: currentUser.id,
        notif_type: 'EVENT_REMINDER_2H',
        title: '⏰ Durham Bulls Game starts in 2 hours!',
        body: 'Your plan at DBAP is coming up soon. Time to head out!',
        event_id: 2,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: currentUser.id,
        notif_type: 'FRIEND_RSVP',
        title: 'Jordan RSVP\'d Going to Food Truck Rodeo!',
        body: 'Jordan just RSVP\'d GOING to Durham Central Park. Your cohort is showing up!',
        event_id: 3,
        is_read: false,
        created_at: new Date().toISOString(),
      }
    ];
  }
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/unread-count?user_id=${currentUser.id}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.unread_count || 0;
  } catch (err) {
    return 2;
  }
}

export async function markNotificationRead(notifId: number): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, { method: 'POST' });
  } catch (err) {}
}

export async function markAllNotificationsRead(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/notifications/read-all?user_id=${currentUser.id}`, { method: 'POST' });
  } catch (err) {}
}

export async function fetchPlaceAutocomplete(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/places/autocomplete?query=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function resolveVenuePhoto(venue: string, city?: string, category?: string): Promise<string> {
  try {
    const params = new URLSearchParams();
    if (venue) params.append('venue_name', venue);
    if (city) params.append('city', city);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE_URL}/places/resolve-photo?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.image_url;
    }
  } catch (err) {}
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800';
}

export async function reportEvent(
  targetEventId: number,
  reason: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISLEADING' | 'OTHER',
  details?: string
): Promise<{ id: number; status: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/moderation/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporter_user_id: currentUser.id,
        target_event_id: targetEventId,
        reason,
        details
      })
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return await res.json();
  } catch (err) {
    console.error('Report error:', err);
    throw err;
  }
}

export async function blockUser(blockedUserId: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/moderation/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocker_user_id: currentUser.id,
        blocked_user_id: blockedUserId
      })
    });
    if (!res.ok) throw new Error('Failed to block user');
  } catch (err) {
    console.error('Block user error:', err);
    throw err;
  }
}

export async function deleteAccount(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me?user_id=${currentUser.id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete account');
  } catch (err) {
    console.error('Delete account error:', err);
    throw err;
  }
}

function getFallbackEvents(filters: any): EventItem[] {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000 * 1);
  const thisSaturday = new Date(now.getTime() + 86400000 * 3);

  const mockEvents: EventItem[] = [
    {
      id: 1,
      title: 'Downtown Cary Park Sunset Live Music & Picnic',
      description: 'Gather on the Great Lawn for live indie acoustic music, lawn games, food trucks, and craft beverages.',
      venue_name: 'Downtown Cary Park',
      address: '327 S Academy St',
      city: 'Cary',
      start_at: tomorrow.toISOString(),
      category: 'Arts & Music',
      price_min: 0,
      price_max: 0,
      is_free: true,
      is_suggestion: false,
      image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      source_name: 'Raleigh Magazine',
      source_url: 'https://raleighmag.com/events/cary-park',
      source_type: 'NEWSLETTER',
      created_at: now.toISOString(),
      interested_count: 8,
      going_count: 14,
      user_attendance_status: 'GOING',
      attendees: [
        { user_id: 'user_1', user_name: 'Alex Chen', user_avatar: currentUser.avatar_url, status: 'GOING' },
        { user_id: 'user_2', user_name: 'Maya Patel', user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'GOING' },
        { user_id: 'user_3', user_name: 'Jordan Smith', user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', status: 'GOING' }
      ]
    },
    {
      id: 2,
      title: 'Durham Bulls Saturday Night Game & Fireworks',
      description: 'Cheer on the Bulls at DBAP! Fireworks show immediately following the final inning.',
      venue_name: 'Durham Bulls Athletic Park (DBAP)',
      address: '409 Blackwell St',
      city: 'Durham',
      start_at: thisSaturday.toISOString(),
      category: 'Sports & Fitness',
      price_min: 14,
      price_max: 28,
      is_free: false,
      is_suggestion: false,
      image_url: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800',
      source_name: 'Visit Raleigh',
      source_url: 'https://visitraleigh.com/events/durham-bulls',
      source_type: 'API',
      created_at: now.toISOString(),
      interested_count: 12,
      going_count: 19,
      user_attendance_status: 'INTERESTED',
      recurrence_rule: 'WEEKLY',
      attendees: [
        { user_id: 'user_4', user_name: 'Chris Taylor', user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', status: 'GOING' },
        { user_id: 'user_5', user_name: 'Sarah Connor', status: 'INTERESTED' }
      ]
    },
    {
      id: 3,
      title: 'Durham Central Park Sunday Food Truck Rodeo',
      description: 'Over 35 local food trucks, craft beer, local artisans, and live community music.',
      venue_name: 'Durham Central Park',
      address: '501 Foster St',
      city: 'Durham',
      start_at: new Date(thisSaturday.getTime() + 86400000).toISOString(),
      category: 'Food & Drink',
      price_min: 0,
      price_max: 0,
      is_free: true,
      is_suggestion: false,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      source_name: 'Durham Lowdown',
      source_url: 'https://durhamlowdown.com',
      source_type: 'NEWSLETTER',
      created_at: now.toISOString(),
      interested_count: 22,
      going_count: 31,
      user_attendance_status: null,
      attendees: [
        { user_id: 'user_2', user_name: 'Maya Patel', status: 'GOING' }
      ]
    },
    {
      id: 4,
      title: 'Boxcar Bar + Arcade Retro Gaming Social',
      description: 'Casual RTP cohort mixer with free tokens, retro arcade games, and craft beer on draft.',
      venue_name: 'Boxcar Bar + Arcade',
      address: '330 W Davie St',
      city: 'Raleigh',
      start_at: new Date(now.getTime() + 86400000 * 2).toISOString(),
      category: 'Nightlife',
      price_min: 0,
      price_max: 0,
      is_free: true,
      is_suggestion: true,
      image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      source_name: 'Cohort Member',
      source_type: 'SUGGESTION',
      created_at: now.toISOString(),
      interested_count: 5,
      going_count: 9,
      user_attendance_status: null,
      attendees: []
    },
    {
      id: 5,
      title: 'Eno River State Park Morning Trail Hike',
      description: 'Scenic 4-mile Cole Mill trail hike along the Eno River. All fitness levels welcome.',
      venue_name: 'Eno River State Park',
      address: '6101 Cole Mill Rd',
      city: 'Durham',
      start_at: new Date(thisSaturday.getTime() + 86400000 * 2).toISOString(),
      category: 'Outdoors',
      price_min: 0,
      price_max: 0,
      is_free: true,
      is_suggestion: false,
      image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      source_name: 'Triangle Sports & Parks',
      source_type: 'HTML',
      created_at: now.toISOString(),
      interested_count: 14,
      going_count: 8,
      user_attendance_status: null,
      attendees: []
    }
  ];

  return mockEvents.filter(e => {
    if (filters.city && filters.city !== 'All' && !e.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.category && filters.category !== 'All' && !e.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
    if (filters.search && !e.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.free_only && !e.is_free) return false;
    return true;
  });
}
