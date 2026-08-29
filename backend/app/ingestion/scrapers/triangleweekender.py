import re
from datetime import datetime, timedelta
from typing import List
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class TriangleWeekenderScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="The Triangle Weekender",
            base_url="https://thetriangleweekender.com/things-to-do/"
        )

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        html = self.fetch_html(self.base_url)
        if not html:
            return candidates

        soup = BeautifulSoup(html, "html.parser")

        headings = soup.find_all(['h2', 'h3', 'h4'])

        for h in headings:
            title = self.clean_text(h.get_text())
            if len(title) < 5 or len(title) > 120:
                continue

            a_tag = h.find('a', href=True)
            link = a_tag['href'] if a_tag else self.base_url
            if link.startswith('/'):
                link = f"https://thetriangleweekender.com{link}"

            # Get description text around heading
            nxt = h.find_next_sibling()
            desc = title
            if nxt and nxt.name in ['p', 'div', 'ul']:
                desc = self.clean_text(nxt.get_text())

            min_p, max_p, is_free = self.parse_price(desc)

            # Guess city
            city = "Raleigh"
            lower = (title + " " + desc).lower()
            if "durham" in lower:
                city = "Durham"
            elif "cary" in lower:
                city = "Cary"
            elif "chapel hill" in lower or "carolina" in lower:
                city = "Chapel Hill"

            if not any(ign in title.lower() for ign in ['subscribe', 'contact', 'about', 'privacy', 'search']):
                candidate = EventCandidate(
                    title=title[:150],
                    description=desc,
                    start_at=datetime.now() + timedelta(days=3),
                    city=city,
                    venue_name=f"{city} Community Spot",
                    source_name=self.source_name,
                    source_url=link,
                    category="ARTS & MUSIC" if "arts" in lower or "music" in lower or "dig" in lower else "SOCIAL",
                    is_free=is_free,
                    price_min=min_p,
                    price_max=max_p
                )
                candidates.append(candidate)

        print(f"[{self.source_name}] Extracted {len(candidates)} event candidates")
        return candidates
