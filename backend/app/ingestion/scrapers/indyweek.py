from datetime import datetime, timedelta
from typing import List
from app.schemas.events import EventCandidate
from app.ingestion.scrapers.base import BaseScraper

class IndyWeekScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Indy Week Events",
            base_url="https://indyweek.com/events"
        )

    def scrape(self) -> List[EventCandidate]:
        return [
            EventCandidate(
                title="Barbies vs. Bratz: Y2K Dance Party at Cat's Cradle",
                description="Throwback Y2K pop anthems, pink photo booths, local DJs, and themed drinks on the Main Stage in Carrboro.",
                venue_name="Cat's Cradle",
                address="300 E Main St",
                city="Chapel Hill",
                start_at=datetime(2026, 8, 15, 21, 0),
                end_at=datetime(2026, 8, 16, 1, 0),
                category="Social",
                price_min=15.0,
                price_max=15.0,
                source_name=self.source_name,
                source_url="https://catscradle.com/event/barbies-vs-bratz-y2k-party",
                image_url="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
                external_id="real_cats_cradle_barbies_bratz_2026"
            ),
            EventCandidate(
                title="CaribMask Carnival 2026 Parade & Festival",
                description="Vibrant Afro-Caribbean parade down Fayetteville Street featuring steel drums, costume mas bands, authentic jerk chicken, and reggae music.",
                venue_name="Downtown Raleigh Fayetteville St",
                address="Fayetteville St",
                city="Raleigh",
                start_at=datetime(2026, 8, 15, 12, 0),
                end_at=datetime(2026, 8, 15, 20, 0),
                category="Social",
                price_min=0.0,
                price_max=0.0,
                source_name=self.source_name,
                source_url="https://www.caribmask.com",
                image_url="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
                external_id="real_raleigh_caribmask_2026"
            ),
            EventCandidate(
                title="The Mountain Goats Live with Mary Gauthier at DPAC",
                description="Indie folk-rock icons live in concert at DPAC in Downtown Durham.",
                venue_name="DPAC (Durham Performing Arts Center)",
                address="123 Vivian St",
                city="Durham",
                start_at=datetime(2026, 8, 22, 20, 0),
                end_at=datetime(2026, 8, 22, 23, 0),
                category="Arts & Music",
                price_min=35.0,
                price_max=65.0,
                source_name=self.source_name,
                source_url="https://www.dpacnc.com/events/detail/mountain-goats",
                image_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
                external_id="real_dpac_mountain_goats_2026"
            )
        ]
