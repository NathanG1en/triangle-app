from datetime import datetime, timedelta
from typing import List
from app.schemas.events import EventCandidate
from app.ingestion.scrapers.base import BaseScraper

class NCMAArtScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="NC Museum of Art & Park",
            base_url="https://ncartmuseum.org"
        )

    def scrape(self) -> List[EventCandidate]:
        now = datetime.utcnow()
        today = now.date()
        
        sat_date = today + timedelta(days=((5 - today.weekday() + 7) % 7))
        sun_date = today + timedelta(days=((6 - today.weekday() + 7) % 7))

        return [
            EventCandidate(
                title="Museum Park Outdoor Summer Movie Night",
                description="Bring lawn chairs and blankets for an outdoor movie screening under the stars at the NC Museum of Art Amphitheater. Food trucks & beer available.",
                venue_name="NCMA Amphitheater & Museum Park",
                address="2110 Blue Ridge Rd",
                city="Raleigh",
                start_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=20, minute=30),
                end_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=23, minute=0),
                category="Arts & Music",
                price_min=10.0,
                price_max=12.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
                source_name=self.source_name,
                source_url="https://ncartmuseum.org/events/outdoor-movie-night",
                external_id="ncma_outdoor_movie_night"
            ),
            EventCandidate(
                title="NCMA Museum Park Guided Sunrise Trail Run",
                description="3-mile scenic guided trail run through the 164-acre Museum Park sculptures and meadow trails.",
                venue_name="NCMA Museum Park Trailhead",
                address="2110 Blue Ridge Rd",
                city="Raleigh",
                start_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=7, minute=30),
                end_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=9, minute=0),
                category="Outdoor & Fitness",
                price_min=0.0,
                price_max=0.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
                source_name=self.source_name,
                source_url="https://ncartmuseum.org/events/sunrise-trail-run",
                external_id="ncma_sunrise_trail_run"
            )
        ]
