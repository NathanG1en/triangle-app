import hashlib
import re
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.events import Event
from app.schemas.events import EventCandidate

VALID_CITIES = {"Cary", "Morrisville", "Raleigh", "Durham", "Chapel Hill"}
CATEGORY_MAPPING = {
    "food": "Food & Drink",
    "drink": "Food & Drink",
    "dining": "Food & Drink",
    "outdoor": "Outdoor & Fitness",
    "fitness": "Outdoor & Fitness",
    "sports": "Sports",
    "tech": "Tech & Professional",
    "career": "Tech & Professional",
    "arts": "Arts & Music",
    "music": "Arts & Music",
    "social": "Social",
}

def normalize_city(city_raw: str) -> str:
    if not city_raw:
        return "Raleigh"
    c = city_raw.strip().title()
    for valid in VALID_CITIES:
        if valid.lower() in c.lower():
            return valid
    return "Raleigh"

def normalize_category(cat_raw: Optional[str]) -> str:
    if not cat_raw:
        return "Social"
    c_lower = cat_raw.lower()
    for key, val in CATEGORY_MAPPING.items():
        if key in c_lower:
            return val
    return "Social"

def generate_fingerprint(title: str, venue: Optional[str], start_at: datetime) -> str:
    norm_title = re.sub(r'[^a-z0-9]', '', title.lower())
    norm_venue = re.sub(r'[^a-z0-9]', '', (venue or '').lower())
    date_str = start_at.strftime('%Y-%m-%d-%H')
    raw = f"{norm_title}|{norm_venue}|{date_str}"
    return hashlib.md5(raw.encode('utf-8')).hexdigest()

class IngestionPipeline:
    def __init__(self, db: Session):
        self.db = db

    def process_candidate(self, candidate: EventCandidate) -> Event:
        # Normalize fields
        city = normalize_city(candidate.city)
        category = normalize_category(candidate.category)
        venue_name = candidate.venue_name.strip() if candidate.venue_name else "Triangle Venue"
        title = candidate.title.strip()
        
        fingerprint = candidate.external_id or generate_fingerprint(title, venue_name, candidate.start_at)
        
        # Deduplication check
        existing = None
        if candidate.external_id:
            existing = self.db.query(Event).filter(Event.external_id == candidate.external_id).first()
        if not existing:
            existing = self.db.query(Event).filter(Event.external_id == fingerprint).first()

        is_free = (candidate.price_min or 0.0) == 0.0 and (candidate.price_max or 0.0) == 0.0

        if existing:
            # Update event metadata if modified
            existing.title = title
            existing.description = candidate.description or existing.description
            existing.venue_name = venue_name
            existing.address = candidate.address or existing.address
            existing.city = city
            existing.category = category
            existing.source_url = candidate.source_url
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            # Create new event
            new_event = Event(
                title=title,
                description=candidate.description,
                venue_name=venue_name,
                address=candidate.address,
                city=city,
                start_at=candidate.start_at,
                end_at=candidate.end_at,
                category=category,
                price_min=candidate.price_min or 0.0,
                price_max=candidate.price_max or 0.0,
                is_free=is_free,
                source_name=candidate.source_name,
                source_url=candidate.source_url,
                source_type="NEWSLETTER" if "Newsletter" in candidate.source_name else "API",
                external_id=fingerprint,
                created_at=datetime.utcnow()
            )
            self.db.add(new_event)
            self.db.commit()
            self.db.refresh(new_event)
            return new_event


def parse_durham_lowdown_sample() -> List[EventCandidate]:
    """Sample parser simulating extraction from Durham Lowdown newsletter digest."""
    now = datetime.utcnow()
    next_friday = now + timedelta(days=(4 - now.weekday()) % 7 + 1)
    next_friday = next_friday.replace(hour=18, minute=0, second=0, microsecond=0)

    return [
        EventCandidate(
            title="Durham Night Market at American Tobacco Campus",
            description="Local artisans, live music, food trucks, and craft beer under the water tower.",
            venue_name="American Tobacco Campus",
            address="300 Blackwell St",
            city="Durham",
            start_at=next_friday,
            end_at=next_friday + timedelta(hours=4),
            category="Food & Drink",
            price_min=0.0,
            price_max=0.0,
            source_name="Durham Lowdown Newsletter",
            source_url="https://durhamlowdown.com/editions/friday-night-market",
            external_id="dl_night_market_01"
        ),
        EventCandidate(
            title="Fullsteam Brewery Trivia & Food Truck Rally",
            description="Bring your cohort team for weekly trivia, local brews, and authentic BBQ.",
            venue_name="Fullsteam Brewery",
            address="726 Rigsbee Ave",
            city="Durham",
            start_at=next_friday + timedelta(days=1, hours=1),
            end_at=next_friday + timedelta(days=1, hours=3),
            category="Social",
            price_min=0.0,
            price_max=0.0,
            source_name="Durham Lowdown Newsletter",
            source_url="https://durhamlowdown.com/editions/fullsteam-trivia",
            external_id="dl_fullsteam_trivia_02"
        )
    ]
