from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, ConfigDict, Field

RecurrenceRule = Optional[Literal['WEEKLY', 'BIWEEKLY', 'MONTHLY']]

class AttendeeSummary(BaseModel):
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    status: str  # 'INTERESTED' or 'GOING'

    model_config = ConfigDict(from_attributes=True)


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    city: str
    start_at: datetime
    end_at: Optional[datetime] = None
    category: str = "Social"
    price_min: float = 0.0
    price_max: float = 0.0
    is_free: bool = True
    is_suggestion: bool = False
    image_url: Optional[str] = None
    source_name: str = "Community"
    source_url: Optional[str] = None
    source_type: str = "COMMUNITY"
    external_id: Optional[str] = None
    recurrence_rule: RecurrenceRule = None
    recurrence_parent_id: Optional[int] = None


class EventCreate(EventBase):
    pass


class EventResponse(EventBase):
    id: int
    created_at: datetime
    interested_count: int = 0
    going_count: int = 0
    user_attendance_status: Optional[str] = None  # None, 'INTERESTED', 'GOING'
    attendees: List[AttendeeSummary] = []
    recurrence_rule: RecurrenceRule = None
    recurrence_parent_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class EventCandidate(BaseModel):
    title: str
    description: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    city: str
    start_at: datetime
    end_at: Optional[datetime] = None
    category: Optional[str] = "Social"
    price_min: Optional[float] = 0.0
    price_max: Optional[float] = 0.0
    is_suggestion: bool = False
    image_url: Optional[str] = None
    source_name: str
    source_url: str
    external_id: Optional[str] = None


class AttendanceRequest(BaseModel):
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    status: str  # 'INTERESTED', 'GOING', or 'NONE' (to remove)


class NotificationResponse(BaseModel):
    id: int
    user_id: str
    notif_type: str
    title: str
    body: Optional[str] = None
    event_id: Optional[int] = None
    is_read: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventPhotoUpdate(BaseModel):
    image_url: str


class ReportCreate(BaseModel):
    reporter_user_id: str
    target_event_id: Optional[int] = None
    target_user_id: Optional[str] = None
    reason: str  # 'SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'MISLEADING', 'OTHER'
    details: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    reporter_user_id: str
    target_event_id: Optional[int] = None
    target_user_id: Optional[str] = None
    reason: str
    details: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBlockCreate(BaseModel):
    blocker_user_id: str
    blocked_user_id: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    cohort_year: Optional[str] = "2026"
    company: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = "Durham"
    interests: Optional[str] = "Outdoors, Food & Drink"
    instagram_handle: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    cohort_year: Optional[str] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    interests: Optional[str] = None
    instagram_handle: Optional[str] = None


class UserProfilePublicResponse(BaseModel):
    user: UserResponse
    created_events: List[EventResponse] = []
    attending_events: List[EventResponse] = []
