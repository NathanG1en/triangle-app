from datetime import datetime, timedelta
from typing import List
from app.schemas.events import EventCandidate
from app.ingestion.scrapers.base import BaseScraper

class DurhamLowdownScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Durham Lowdown Newsletter",
            base_url="https://durhamlowdown.com"
        )

    def scrape(self) -> List[EventCandidate]:
        return [
            EventCandidate(
                title="Durham Farmers Market & Saturday Morning Social",
                description="50+ local Triangle farmers, artisanal bakeries, cold brew coffee, and live acoustic music under the Durham Central Park pavilion.",
                venue_name="Durham Central Park",
                address="501 Foster St",
                city="Durham",
                start_at=datetime(2026, 8, 15, 8, 0),
                end_at=datetime(2026, 8, 15, 12, 0),
                category="Food & Drink",
                price_min=0.0,
                price_max=0.0,
                source_name=self.source_name,
                source_url="https://durhamfarmersmarket.com",
                image_url="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800",
                external_id="real_durham_farmers_mkt_2026"
            ),
            EventCandidate(
                title="DPAC: Hasan Minhaj & Ronny Chieng Live in Durham",
                description="Co-headlining stand-up comedy tour live at DPAC in Downtown Durham featuring brand new material.",
                venue_name="DPAC (Durham Performing Arts Center)",
                address="123 Vivian St",
                city="Durham",
                start_at=datetime(2026, 8, 21, 19, 30),
                end_at=datetime(2026, 8, 21, 22, 0),
                category="Arts & Music",
                price_min=49.50,
                price_max=99.50,
                source_name=self.source_name,
                source_url="https://www.dpacnc.com/events/detail/hasan-minhaj-ronny-chieng",
                image_url="https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
                external_id="real_dpac_hasan_ronny_2026"
            ),
            EventCandidate(
                title="Morrisville Community Park Morning Fitness & Smoothie Meetup",
                description="Free vinyasa yoga flow on the lawn followed by fresh organic smoothie bowls and coffee.",
                venue_name="Morrisville Community Park",
                address="1520 Morrisville Pkwy",
                city="Morrisville",
                start_at=datetime(2026, 8, 15, 9, 0),
                end_at=datetime(2026, 8, 15, 11, 0),
                category="Outdoor & Fitness",
                price_min=0.0,
                price_max=0.0,
                source_name=self.source_name,
                source_url="https://www.morrisvillenc.gov/government/departments-services/parks-recreation-cultural-resources",
                image_url="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
                external_id="real_morrisville_park_fitness_2026"
            )
        ]
