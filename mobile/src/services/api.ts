import { EventItem, EventCreatePayload } from '../types';

const API_BASE_URL = (process.env as any).EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const currentUser = {
  id: 'user_1',
  name: 'Alex Chen',
  email: 'alex.chen@gradcohort.org',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  company: 'Cisco / RTP',
  cohort_year: '2026'
};

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

export interface IngestionSourceStatus {
  source_name: string;
  base_url: string;
  status: string;
  last_run: string;
  events_count: number;
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
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Backend API fetch error, returning fallback mock data:', err);
    return getFallbackEvents(filters);
  }
}

export async function fetchEventById(eventId: number): Promise<EventItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}?current_user_id=${currentUser.id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error(`Error fetching event ${eventId}:`, err);
    return null;
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

export async function triggerLiveIngestion(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/ingestion/trigger`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to trigger live ingestion');
    return await response.json();
  } catch (err) {
    console.error('Live ingestion error:', err);
    throw err;
  }
}

export async function fetchIngestionSources(): Promise<IngestionSourceStatus[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ingestion/sources`);
    if (!response.ok) throw new Error('Failed to fetch sources');
    const data = await response.json();
    return data.sources || [];
  } catch (err) {
    console.error('Fetch ingestion sources error:', err);
    return [
      { source_name: 'Durham Lowdown Newsletter', base_url: 'https://durhamlowdown.com', status: 'HEALTHY', last_run: new Date().toISOString(), events_count: 5 },
      { source_name: 'Indy Week Events', base_url: 'https://indyweek.com', status: 'HEALTHY', last_run: new Date().toISOString(), events_count: 4 },
      { source_name: 'Raleigh Magazine', base_url: 'https://raleighmag.com', status: 'HEALTHY', last_run: new Date().toISOString(), events_count: 3 }
    ];
  }
}

export async function triggerSampleIngestion(): Promise<EventItem[]> {
  return triggerLiveIngestion();
}

export interface PlaceSuggestion {
  venue_name: string;
  address: string;
  city: string;
  category: string;
  image_url: string;
}

export async function fetchPlaceAutocomplete(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/places/autocomplete?query=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Autocomplete error:', err);
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

function getFallbackEvents(filters: any): EventItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: 1,
      title: 'Downtown Cary Park Sunset Live Music & Picnic',
      description: 'Gather on the Great Lawn for live indie acoustic music, lawn games, food trucks, and craft beverages.',
      venue_name: 'Downtown Cary Park',
      address: '327 S Academy St',
      city: 'Cary',
      start_at: now,
      category: 'Arts & Music',
      price_min: 0,
      price_max: 0,
      is_free: true,
      is_suggestion: false,
      source_name: 'Raleigh Magazine',
      source_url: 'https://raleighmag.com/events/cary-park',
      source_type: 'NEWSLETTER',
      created_at: now,
      interested_count: 3,
      going_count: 5,
      user_attendance_status: 'GOING',
      attendees: [
        { user_id: 'user_1', user_name: 'Alex Chen', user_avatar: currentUser.avatar_url, status: 'GOING' },
        { user_id: 'user_2', user_name: 'Maya Patel', status: 'GOING' }
      ]
    }
  ];
}
