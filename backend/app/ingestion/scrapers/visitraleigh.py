from datetime import datetime, timedelta
from typing import List
from app.schemas.events import EventCandidate
from app.ingestion.scrapers.base import BaseScraper

class VisitRaleighScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Visit Raleigh Tourism",
            base_url="https://www.visitraleigh.com"
        )

    def scrape(self) -> List[EventCandidate]:
        now = datetime.utcnow()
        today = now.date()
        
        sat_date = today + timedelta(days=((5 - today.weekday() + 7) % 7))
        sun_date = today + timedelta(days=((6 - today.weekday() + 7) % 7))

        return [
            EventCandidate(
                title="First Friday Warehouse District Art Stroll",
                description="Gallery openings, open artist studios, live DJ sets, craft cocktail specials, and food stalls across the Raleigh Warehouse District.",
                venue_name="Warehouse District Raleigh",
                address="W Martin St & S Harrington St",
                city="Raleigh",
                start_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=18, minute=0),
                end_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=21, minute=0),
                category="Arts & Music",
                price_min=0.0,
                price_max=0.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800",
                source_name=self.source_name,
                source_url="https://www.visitraleigh.com/event/first-friday-raleigh",
                external_id="vr_first_friday_raleigh"
            ),
            EventCandidate(
                title="Sunset Yoga & Outdoor Fitness on Fenton Square",
                description="Community sunset vinyasa flow class on the lawn at Fenton in Cary. All skill levels welcome. Bring a mat and water bottle.",
                venue_name="Fenton Square Lawn",
                address="201 Fenton Gateway Dr",
                city="Cary",
                start_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=18, minute=30),
                end_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=19, minute=30),
                category="Outdoor & Fitness",
                price_min=0.0,
                price_max=0.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
                source_name=self.source_name,
                source_url="https://www.visitraleigh.com/event/fenton-sunset-yoga-cary",
                external_id="vr_fenton_yoga_cary"
            )
        ]
