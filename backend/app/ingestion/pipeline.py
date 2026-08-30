import hashlib
import re
from datetime import datetime, timedelta
from typing import List, Optional
from difflib import SequenceMatcher
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.events import Event
from app.schemas.events import EventCandidate
from app.ingestion.places_photos import resolve_venue_photo

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

STOP_WORDS = {
    "a", "an", "the", "at", "by", "for", "from", "in", "of", "on", "to", "with",
    "and", "or", "vs", "versus", "presents", "presenting", "annual", "2026", "2025",
    "live", "fest", "festival", "show", "event", "game", "night", "day"
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
    date_str = start_at.strftime('%Y-%m-%d-%H') if start_at else "anytime"
    raw = f"{norm_title}|{norm_venue}|{date_str}"
    return hashlib.md5(raw.encode('utf-8')).hexdigest()

def clean_and_tokenize(text: str) -> set:
    if not text:
        return set()
    cleaned = re.sub(r'[^a-z0-9\s]', '', text.lower())
    words = cleaned.split()
    return {w for w in words if w not in STOP_WORDS and len(w) > 1}

def calculate_text_similarity(str1: str, str2: str) -> float:
    if not str1 or not str2:
        return 0.0
    
    clean1 = re.sub(r'[^a-z0-9]', '', str1.lower())
    clean2 = re.sub(r'[^a-z0-9]', '', str2.lower())
    if not clean1 or not clean2:
        return 0.0
    
    if clean1 == clean2:
        return 1.0
    
    if clean1 in clean2 or clean2 in clean1:
        min_len = min(len(clean1), len(clean2))
        max_len = max(len(clean1), len(clean2))
        if min_len / max_len >= 0.40:
            return 0.85

    tokens1 = clean_and_tokenize(str1)
    tokens2 = clean_and_tokenize(str2)
    
    if tokens1 and tokens2:
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        min_tokens = min(len(tokens1), len(tokens2))
        jaccard_sim = len(intersection) / len(union) if union else 0.0
        containment_sim = len(intersection) / min_tokens if min_tokens > 0 else 0.0
        token_sim = max(jaccard_sim, containment_sim * 0.85)
    else:
        token_sim = 0.0
        
    seq_sim = SequenceMatcher(None, clean1, clean2).ratio()
    return max(token_sim, seq_sim)

def is_same_event(candidate: EventCandidate, existing: Event) -> bool:
    # Title similarity
    title_sim = calculate_text_similarity(candidate.title, existing.title)
    
    # Venue similarity
    cand_venue = candidate.venue_name or ""
    exist_venue = existing.venue_name or ""
    venue_sim = calculate_text_similarity(cand_venue, exist_venue)

    # Date match check
    date_match = False
    if candidate.start_at and existing.start_at:
        d_diff = abs((candidate.start_at - existing.start_at).total_seconds())
        # Same day or within 24 hours
        if d_diff <= 86400:
            date_match = True
    elif candidate.is_suggestion and existing.is_suggestion:
        date_match = True

    if date_match:
        if title_sim >= 0.70:
            return True
        if title_sim >= 0.50 and venue_sim >= 0.60:
            return True
        if title_sim >= 0.40 and venue_sim >= 0.70:
            return True

    return False


REJECT_TITLE_PATTERNS = [
    r'find events across',
    r'can’t-miss triangle events',
    r'can\'t-miss triangle events',
    r'click here',
    r'read more',
    r'^duke arts$',
    r'subscribe to',
    r'sign up for',
    r'privacy policy',
    r'terms of service',
    r'around the triangle',
    r'eye on the triangle',
    r'^(a\s+)?guide\s+to',
    r'^guide\s+to',
    r'^if\s+you\s+like',
    r'^where\s+to',
    r'^top\s+\d+',
    r'^best\s+places\s+to',
    r'things\s+to\s+know',
]

def is_valid_event_title(title: str) -> bool:
    if not title or len(title.strip()) < 5:
        return False
    t_lower = title.strip().lower()
    for pat in REJECT_TITLE_PATTERNS:
        if re.search(pat, t_lower):
            return False
    return True


class IngestionPipeline:
    def __init__(self, db: Session):
        self.db = db

    def process_candidate(self, candidate: EventCandidate) -> Optional[Event]:
        if not candidate or not is_valid_event_title(candidate.title):
            return None

        city = normalize_city(candidate.city)
        category = normalize_category(candidate.category)
        venue_name = candidate.venue_name.strip() if candidate.venue_name else "Triangle Venue"
        title = candidate.title.strip()
        
        fingerprint = candidate.external_id or generate_fingerprint(title, venue_name, candidate.start_at)
        
        # 1. Exact external_id match
        existing = None
        if candidate.external_id:
            existing = self.db.query(Event).filter(Event.external_id == candidate.external_id).first()
        if not existing:
            existing = self.db.query(Event).filter(Event.external_id == fingerprint).first()

        # 2. Smart Fuzzy Deduplication search across DB events in same city / date window
        if not existing:
            query = self.db.query(Event).filter(Event.city.ilike(f"%{city}%"))
            if candidate.start_at:
                window_start = candidate.start_at - timedelta(days=1)
                window_end = candidate.start_at + timedelta(days=1)
                query = query.filter(
                    or_(
                        and_(Event.start_at >= window_start, Event.start_at <= window_end),
                        Event.is_suggestion == True
                    )
                )
            potential_matches = query.all()
            for pot in potential_matches:
                if is_same_event(candidate, pot):
                    existing = pot
                    break

        is_free = (candidate.price_min or 0.0) == 0.0 and (candidate.price_max or 0.0) == 0.0
        final_image_url = candidate.image_url or resolve_venue_photo(venue_name, city, category)

        if existing:
            # Merge / enrich existing event with new source metadata
            if candidate.source_name and candidate.source_name not in existing.source_name:
                existing.source_name = f"{existing.source_name} & {candidate.source_name}"
            
            # Enrich description if candidate description is longer/richer
            if candidate.description and len(candidate.description) > len(existing.description or ""):
                existing.description = candidate.description

            # Enrich image if missing
            if not existing.image_url:
                existing.image_url = final_image_url

            # Enrich address if missing
            if candidate.address and not existing.address:
                existing.address = candidate.address

            if candidate.source_url and not existing.source_url:
                existing.source_url = candidate.source_url

            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
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
                is_suggestion=candidate.is_suggestion,
                image_url=final_image_url,
                source_name=candidate.source_name,
                source_url=candidate.source_url,
                source_type="SUGGESTION" if candidate.is_suggestion else ("NEWSLETTER" if "Newsletter" in candidate.source_name else "API"),
                external_id=fingerprint,
                created_at=datetime.utcnow()
            )
            self.db.add(new_event)
            self.db.commit()
            self.db.refresh(new_event)
            return new_event

def parse_durham_lowdown_sample() -> List[EventCandidate]:
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
            is_suggestion=False,
            source_name="Durham Lowdown Newsletter",
            source_url="https://durhamlowdown.com/editions/friday-night-market",
            image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
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
            is_suggestion=False,
            source_name="Durham Lowdown Newsletter",
            source_url="https://durhamlowdown.com/editions/fullsteam-trivia",
            image_url="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
            external_id="dl_fullsteam_trivia_02"
        )
    ]
