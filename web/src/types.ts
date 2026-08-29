export interface AttendeeSummary {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  status: 'INTERESTED' | 'GOING';
}

export interface EventItem {
  id: number;
  title: string;
  description?: string;
  venue_name?: string;
  address?: string;
  city: string; // Durham, Raleigh, Cary, Chapel Hill, Morrisville
  start_at: string;
  end_at?: string;
  category: string;
  price_min: number;
  price_max: number;
  is_free: boolean;
  is_suggestion?: boolean;
  image_url?: string;
  source_name: string;
  source_url?: string;
  source_type: string;
  external_id?: string;
  created_at: string;
  created_by_user_id?: string;
  interested_count: number;
  going_count: number;
  user_attendance_status?: 'INTERESTED' | 'GOING' | null;
  attendees: AttendeeSummary[];
  recurrence_rule?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | null;
  recurrence_parent_id?: number | null;
}

export interface EventCreatePayload {
  title: string;
  description?: string;
  venue_name?: string;
  address?: string;
  city: string;
  start_at: string;
  category: string;
  price_min?: number;
  price_max?: number;
  is_free?: boolean;
  is_suggestion?: boolean;
  image_url?: string;
  source_name?: string;
  source_url?: string;
  recurrence_rule?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | null;
}

export interface PlaceSuggestion {
  venue_name: string;
  address: string;
  city: string;
  category: string;
  image_url: string;
}

export interface NotificationItem {
  id: number;
  user_id: string;
  notif_type: string;
  title: string;
  body?: string;
  event_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  cohort_year?: string;
  company?: string;
  bio?: string;
  city?: string;
  interests?: string;
  instagram_handle?: string;
  created_at: string;
}

export interface UserUpdatePayload {
  name?: string;
  avatar_url?: string;
  cohort_year?: string;
  company?: string;
  bio?: string;
  city?: string;
  interests?: string;
  instagram_handle?: string;
}

export interface UserProfilePublic {
  user: UserProfile;
  created_events: EventItem[];
  attending_events: EventItem[];
}
