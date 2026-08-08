from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    venue_name = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    start_at = Column(DateTime, nullable=False, index=True)
    end_at = Column(DateTime, nullable=True)
    category = Column(String(100), nullable=False, index=True, default="Social")
    price_min = Column(Float, default=0.0)
    price_max = Column(Float, default=0.0)
    is_free = Column(Boolean, default=True)
    image_url = Column(String(500), nullable=True)
    source_name = Column(String(100), nullable=False, default="Community")
    source_url = Column(String(500), nullable=True)
    source_type = Column(String(50), default="COMMUNITY") # API, RSS, NEWSLETTER, HTML, COMMUNITY
    external_id = Column(String(255), nullable=True, index=True)
    created_by_user_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attendances = relationship("Attendance", back_populates="event", cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    user_name = Column(String(100), nullable=False, default="Cohort Member")
    user_avatar = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False) # 'INTERESTED' or 'GOING'
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event", back_populates="attendances")

    __table_args__ = (
        UniqueConstraint('event_id', 'user_id', name='_event_user_uc'),
    )


class User(Base):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    cohort_year = Column(String(20), default="2026")
    company = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
