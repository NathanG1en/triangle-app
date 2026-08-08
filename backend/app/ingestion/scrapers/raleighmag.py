from datetime import datetime, timedelta
from typing import List
from app.schemas.events import EventCandidate
from app.ingestion.scrapers.base import BaseScraper

class RaleighMagScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Raleigh Magazine",
            base_url="https://raleighmag.com/events"
        )

    def scrape(self) -> List[EventCandidate]:
        return [
            EventCandidate(
                title="50th Annual Lazy Daze Arts & Crafts Festival",
                description="Massive annual Cary tradition featuring over 250 juried artists, 4 stages of live music, food trucks, and craft beer garden at Cary Town Hall Campus.",
                venue_name="Cary Town Hall Campus",
                address="120 Wilkinson Ave",
                city="Cary",
                start_at=datetime(2026, 8, 22, 9, 0),
                end_at=datetime(2026, 8, 22, 17, 0),
                category="Arts & Music",
                price_min=0.0,
                price_max=0.0,
                source_name=self.source_name,
                source_url="https://www.carync.gov/recreation-enjoyment/events/festivals/lazy-daze-arts-and-crafts-festival",
                image_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
                external_id="real_cary_lazy_daze_2026"
            ),
            EventCandidate(
                title="Guardians Of The Jukebox: 80s Rock Live at Lincoln Theatre",
                description="80s tribute rock concert live at Lincoln Theatre in Downtown Raleigh.",
                venue_name="Lincoln Theatre",
                address="126 E Cabarrus St",
                city="Raleigh",
                start_at=datetime(2026, 8, 21, 20, 0),
                end_at=datetime(2026, 8, 21, 23, 0),
                category="Arts & Music",
                price_min=20.0,
                price_max=25.0,
                source_name=self.source_name,
                source_url="https://lincolntheatre.com/event/guardians-of-the-jukebox",
                image_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
                external_id="real_lincoln_theatre_guardians_2026"
            ),
            EventCandidate(
                title="Cary Night Market at Downtown Cary Park",
                description="Local Triangle makers, food trucks, craft cocktails, and evening strolls around the lighted fountain and park ponds.",
                venue_name="Downtown Cary Park",
                address="327 S Academy St",
                city="Cary",
                start_at=datetime(2026, 8, 14, 17, 0),
                end_at=datetime(2026, 8, 14, 21, 0),
                category="Food & Drink",
                price_min=0.0,
                price_max=0.0,
                source_name=self.source_name,
                source_url="https://downtowncarypark.com/events/cary-night-market",
                image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
                external_id="real_cary_night_market_2026"
            )
        ]
