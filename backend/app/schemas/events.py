from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

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
    image_url: Optional[str] = None
    source_name: str = "Community"
    source_url: Optional[str] = None
    source_type: str = "COMMUNITY"
    external_id: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventResponse(EventBase):
    id: int
    created_at: datetime
    interested_count: int = 0
    going_count: int = 0
    user_attendance_status: Optional[str] = None  # None, 'INTERESTED', 'GOING'
    attendees: List[AttendeeSummary] = []

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
    source_name: str
    source_url: str
    external_id: Optional[str] = None


class AttendanceRequest(BaseModel):
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    status: str  # 'INTERESTED', 'GOING', or 'NONE' (to remove)
