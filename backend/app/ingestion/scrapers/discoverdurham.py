import re
from datetime import datetime, timedelta
from typing import List
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class DiscoverDurhamScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="Discover Durham",
            base_url="https://www.discoverdurham.com/events/"
        )

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        html = self.fetch_html(self.base_url)
        if not html:
            return candidates

        soup = BeautifulSoup(html, "html.parser")

        # Find event links / headings
        event_elements = soup.find_all(['h2', 'h3', 'h4', 'article', 'div'])

        for el in event_elements:
            text = self.clean_text(el.get_text())
            if len(text) < 15 or len(text) > 300:
                continue

            a_tag = el.find('a', href=True) if hasattr(el, 'find') else None
            link = a_tag['href'] if a_tag else self.base_url
            if link.startswith('/'):
                link = f"https://www.discoverdurham.com{link}"

            if any(kw in text.lower() for kw in ['durham', 'park', 'fest', 'music', 'center', 'market', 'tour', 'show', 'game']):
                title = a_tag.get_text().strip() if a_tag else text[:80]
                if len(title) > 5 and not any(ign in title.lower() for ign in ['submit', 'newsletter', 'cookie', 'privacy', 'search']):
                    min_p, max_p, is_free = self.parse_price(text)

                    candidate = EventCandidate(
                        title=title[:150],
                        description=text,
                        start_at=datetime.now() + timedelta(days=2),
                        city="Durham",
                        venue_name="Durham Official Venue",
                        source_name=self.source_name,
                        source_url=link,
                        category="OUTDOORS" if "park" in text.lower() or "outdoor" in text.lower() else "SOCIAL",
                        is_free=is_free,
                        price_min=min_p,
                        price_max=max_p
                    )
                    candidates.append(candidate)

        print(f"[{self.source_name}] Extracted {len(candidates)} event candidates")
        return candidates
