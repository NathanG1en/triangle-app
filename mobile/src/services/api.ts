import { EventItem, EventCreatePayload } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const currentUser = {
  id: 'user_1',
  name: 'Alex Chen',
  email: 'alex.chen@gradcohort.org',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  company: 'Cisco / RTP',
  cohort_year: '2026'
};

export async function fetchEvents(filters: {
  city?: string;
  category?: string;
  search?: string;
  date_filter?: string;
  free_only?: boolean;
}): Promise<EventItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters.city && filters.city !== 'All') params.append('city', filters.city);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.date_filter && filters.date_filter !== 'all') params.append('date_filter', filters.date_filter);
    if (filters.free_only) params.append('free_only', 'true');
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

export async function triggerSampleIngestion(): Promise<EventItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/ingest/sample-durham-newsletter`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to trigger ingestion');
    return await response.json();
  } catch (err) {
    console.error('Ingestion trigger error:', err);
    throw err;
  }
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
      source_name: 'Town of Cary Events',
      source_url: 'https://www.carync.gov',
      source_type: 'API',
      created_at: now,
      interested_count: 3,
      going_count: 5,
      user_attendance_status: 'GOING',
      attendees: [
        { user_id: 'user_1', user_name: 'Alex Chen', user_avatar: currentUser.avatar_url, status: 'GOING' },
        { user_id: 'user_2', user_name: 'Maya Patel', status: 'GOING' }
      ]
    },
    {
      id: 2,
      title: 'Raleigh Tech Cohort Happy Hour',
      description: 'Meet fellow tech & business new grads working across RTP and Downtown Raleigh.',
      venue_name: 'Morgan Street Food Hall',
      address: '411 W Morgan St',
      city: 'Raleigh',
      start_at: now,
      category: 'Tech & Professional',
      price_min: 0,
      price_max: 15,
      is_free: true,
      source_name: 'Raleigh Grads Network',
      source_type: 'COMMUNITY',
      created_at: now,
      interested_count: 8,
      going_count: 12,
      user_attendance_status: 'INTERESTED',
      attendees: [
        { user_id: 'user_1', user_name: 'Alex Chen', user_avatar: currentUser.avatar_url, status: 'INTERESTED' }
      ]
    }
  ];
}
