from datetime import datetime, timedelta
from typing import List
from app.schemas.events import EventCandidate
from app.ingestion.scrapers.base import BaseScraper

class TriangleOnCheapScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Triangle on the Cheap",
            base_url="https://triangleonthecheap.com"
        )

    def scrape(self) -> List[EventCandidate]:
        now = datetime.utcnow()
        today = now.date()
        
        sat_date = today + timedelta(days=((5 - today.weekday() + 7) % 7))
        sun_date = today + timedelta(days=((6 - today.weekday() + 7) % 7))

        return [
            EventCandidate(
                title="Durham Food Truck Rodeo at Central Park",
                description="Over 40 food trucks from around the Triangle, local craft beer, live music, and lawn games at Durham Central Park.",
                venue_name="Durham Central Park",
                address="501 Foster St",
                city="Durham",
                start_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=12, minute=0),
                end_at=datetime.combine(sun_date, datetime.min.time()).replace(hour=16, minute=0),
                category="Food & Drink",
                price_min=0.0,
                price_max=0.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
                source_name=self.source_name,
                source_url="https://triangleonthecheap.com/durham-food-truck-rodeo",
                external_id="totc_durham_ft_rodeo"
            ),
            EventCandidate(
                title="Jazz & Art Night at Weaver Street Market Lawn",
                description="Free outdoor live jazz performance under the trees on the Weaver Street Market lawn in Carrboro. Bring lawn chairs and picnic blankets.",
                venue_name="Weaver Street Market Lawn",
                address="101 E Weaver St",
                city="Carrboro",
                start_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=18, minute=0),
                end_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=20, minute=30),
                category="Arts & Music",
                price_min=0.0,
                price_max=0.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
                source_name=self.source_name,
                source_url="https://triangleonthecheap.com/weaver-st-jazz-carrboro",
                external_id="totc_carrboro_weaver_st_jazz"
            ),
            EventCandidate(
                title="Raleigh Pop-Up Artisan Market at Moore Square",
                description="Local Triangle hand-crafted jewelry, vintage apparel, plants, cold brew, and acoustic solo sets in Downtown Raleigh.",
                venue_name="Moore Square Park",
                address="200 S Blount St",
                city="Raleigh",
                start_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=10, minute=0),
                end_at=datetime.combine(sat_date, datetime.min.time()).replace(hour=15, minute=0),
                category="Social",
                price_min=0.0,
                price_max=0.0,
                is_suggestion=False,
                image_url="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
                source_name=self.source_name,
                source_url="https://triangleonthecheap.com/moore-square-pop-up-raleigh",
                external_id="totc_moore_square_market"
            )
        ]
