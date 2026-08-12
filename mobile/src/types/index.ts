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
  city: string; // Cary, Morrisville, Raleigh, Durham, Chapel Hill
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  cohort_year: string;
  company: string;
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
