import re
from datetime import datetime, timedelta
from typing import List, Optional
from bs4 import BeautifulSoup
from app.ingestion.scrapers.base import BaseScraper
from app.schemas.events import EventCandidate

class ThisIsRaleighScraper(BaseScraper):
    def __init__(self):
        super().__init__(
            source_name="This Is Raleigh",
            base_url="https://thisisraleigh.com/things-to-do-in-raleigh-this-weekend/"
        )

    def _parse_heading_date(self, text: str) -> Optional[datetime]:
        """Convert headings like 'Friday Aug 28' or 'Saturday, Aug 29' into a datetime object."""
        try:
            cleaned = re.sub(r'^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[,\s]*', '', text, flags=re.I).strip()
            # Match formats like 'Aug 28', 'August 30', 'Sep 5'
            match = re.search(r'([A-Za-z]+)\s+(\d{1,2})', cleaned)
            if match:
                month_str, day_str = match.groups()
                now = datetime.now()
                month_num = datetime.strptime(month_str[:3], "%b").month
                year = now.year
                # If month passed early next year transition
                if month_num < now.month - 2:
                    year += 1
                return datetime(year, month_num, int(day_str), 18, 0)
        except Exception:
            pass
        return None

    def _guess_city(self, text: str) -> str:
        lower = text.lower()
        if "durham" in lower:
            return "Durham"
        if "cary" in lower:
            return "Cary"
        if "chapel hill" in lower:
            return "Chapel Hill"
        if "morrisville" in lower:
            return "Morrisville"
        return "Raleigh"

    def scrape(self) -> List[EventCandidate]:
        candidates: List[EventCandidate] = []
        html = self.fetch_html(self.base_url)
        if not html:
            return candidates

        soup = BeautifulSoup(html, "html.parser")
        current_date = datetime.now() + timedelta(days=1)

        for heading in soup.find_all(['h2', 'h3']):
            htext = self.clean_text(heading.get_text())
            parsed_dt = self._parse_heading_date(htext)
            if parsed_dt:
                current_date = parsed_dt

            # Collect event items under heading
            nxt = heading.find_next_sibling()
            count = 0
            while nxt and nxt.name not in ['h2', 'h3'] and count < 8:
                if nxt.name in ['ul', 'ol']:
                    for li in nxt.find_all('li'):
                        item_text = self.clean_text(li.get_text())
                        if len(item_text) < 5 or "http" in item_text and len(item_text) < 15:
                            continue

                        # Extract title and venue from item_text
                        parts = item_text.split(',')
                        title = parts[0].strip()
                        venue = parts[1].strip() if len(parts) > 1 else "Raleigh Venue"

                        if len(title) > 3:
                            min_p, max_p, is_free = self.parse_price(item_text)
                            city = self._guess_city(item_text)

                            # Find link if present
                            a_tag = li.find('a', href=True)
                            link = a_tag['href'] if a_tag else self.base_url

                            candidate = EventCandidate(
                                title=title[:150],
                                description=item_text,
                                start_at=current_date,
                                city=city,
                                venue_name=venue[:100],
                                source_name=self.source_name,
                                source_url=link,
                                category="COMMUNITY",
                                is_free=is_free,
                                price_min=min_p,
                                price_max=max_p
                            )
                            candidates.append(candidate)
                nxt = nxt.find_next_sibling()
                count += 1

        print(f"[{self.source_name}] Extracted {len(candidates)} event candidates")
        return candidates
