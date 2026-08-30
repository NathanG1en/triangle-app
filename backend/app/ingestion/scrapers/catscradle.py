import re
from datetime import datetime, timedelta
from typing import List
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class CatsCradleScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Cat's Cradle Official",
            base_url="https://catscradle.com"
        )

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        html = self.fetch_html(self.base_url)
        if not html:
            return candidates

        soup = BeautifulSoup(html, "html.parser")
        event_cards = soup.find_all(['div', 'article'], class_=re.compile(r'event|show|card', re.I))

        if not event_cards:
            event_cards = soup.find_all('a', href=True)

        for card in event_cards[:15]:
            text = self.clean_text(card.get_text())
            if len(text) < 10 or "copyright" in text.lower():
                continue

            lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 3]
            if not lines:
                continue

            title = lines[0]
            if any(w in title.lower() for w in ['ticket', 'buy', 'more info', 'cat\'s cradle']):
                if len(lines) > 1:
                    title = lines[1]

            if len(title) > 5 and not any(w in title.lower() for w in ['copyright', 'privacy', 'facebook', 'instagram']):
                min_p, max_p, is_free = self.parse_price(text)
                
                # Parse date if available
                event_date = datetime.now() + timedelta(days=3)
                month_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})', text, re.I)
                if month_match:
                    try:
                        month_str, day_str = month_match.group(1), month_match.group(2)
                        month_num = datetime.strptime(month_str[:3], "%b").month
                        event_date = datetime(2026, month_num, int(day_str), 20, 0)
                    except Exception:
                        pass

                candidates.append(
                    EventCandidate(
                        title=f"{title} (Live at Cat's Cradle)",
                        description=f"Live concert at Cat's Cradle. {text[:200]}",
                        venue_name="Cat's Cradle",
                        address="300 E Main St",
                        city="Chapel Hill",
                        start_at=event_date,
                        category="Arts & Music",
                        is_free=is_free,
                        price_min=min_p or 15.0,
                        price_max=max_p or 25.0,
                        source_name=self.source_name,
                        source_url=self.base_url,
                        image_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
                        external_id=f"cc_{hash(title)}"
                    )
                )

        print(f"[{self.source_name}] Extracted {len(candidates)} event candidates")
        return candidates
