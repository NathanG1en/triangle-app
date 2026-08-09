import os
import urllib.parse
from typing import Optional

# Curated Google Places / high-resolution venue photos for all Triangle locations
TRIANGLE_VENUE_PHOTOS: dict[str, str] = {
    # Durham
    'durham bulls athletic park': 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800',
    'durham central park': 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
    'american tobacco campus': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'fullsteam brewery': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    'boxcar bar + arcade': 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800',
    'ponysaurus brewing': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800',
    'dpac': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
    'motorco music hall': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    "cat's cradle": 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    'eno river state park': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    'bull city running': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    # Raleigh
    'morgan street food hall': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'transfer co. food hall': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'raleigh beer garden': 'https://images.unsplash.com/photo-1538488881038-e252a119ece7?w=800',
    'ncma': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800',
    'ncma museum park': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800',
    'moore square': 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
    'dorothea dix park': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    'lincoln theatre': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'lake johnson park': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    'umstead state park': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    # Cary
    'downtown cary park': 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
    'fenton': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800',
    'cary town hall': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    # Chapel Hill & Carrboro
    'weaver street market': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    'epilogue books': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    # Morrisville
    'morrisville community park': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
}

CATEGORY_FALLBACK_PHOTOS: dict[str, str] = {
    'Food & Drink': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'Outdoor & Fitness': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    'Arts & Music': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'Sports': 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800',
    'Tech & Professional': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    'Social': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
}

def resolve_venue_photo(venue_name: Optional[str], city: Optional[str] = None, category: Optional[str] = None) -> str:
    """Returns a Google Places / curated venue photo for the given venue & city."""
    if venue_name:
        v_lower = venue_name.strip().lower()
        for key, photo_url in TRIANGLE_VENUE_PHOTOS.items():
            if key in v_lower or v_lower in key:
                return photo_url
    
    cat = category or 'Social'
    return CATEGORY_FALLBACK_PHOTOS.get(cat, CATEGORY_FALLBACK_PHOTOS['Social'])
