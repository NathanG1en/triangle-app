import urllib.request
import urllib.parse
import json
from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
from app.ingestion.places_photos import resolve_venue_photo

router = APIRouter()

class PlaceSuggestion(BaseModel):
    venue_name: str
    address: str
    city: str
    category: str
    image_url: str

# Detailed Triangle Places Database for instant autocomplete suggestions
TRIANGLE_PLACES_DB = [
    # Durham
    {"venue_name": "Durham Bulls Athletic Park (DBAP)", "address": "409 Blackwell St", "city": "Durham", "category": "Sports", "keywords": ["bulls", "dbap", "blackwell", "baseball", "durham bulls"]},
    {"venue_name": "Fullsteam Brewery", "address": "726 Rigsbee Ave", "city": "Durham", "category": "Food & Drink", "keywords": ["fullsteam", "rigsbee", "brewery", "trivia"]},
    {"venue_name": "Boxcar Bar + Arcade (Durham)", "address": "621 W Chapel Hill St", "city": "Durham", "category": "Social", "keywords": ["boxcar", "arcade", "chapel hill st", "durham boxcar"]},
    {"venue_name": "Durham Central Park", "address": "501 Foster St", "city": "Durham", "category": "Outdoor & Fitness", "keywords": ["durham central park", "foster", "farmers market"]},
    {"venue_name": "American Tobacco Campus", "address": "300 Blackwell St", "city": "Durham", "category": "Social", "keywords": ["american tobacco", "atc", "water tower", "blackwell"]},
    {"venue_name": "DPAC (Durham Performing Arts Center)", "address": "123 Vivian St", "city": "Durham", "category": "Arts & Music", "keywords": ["dpac", "vivian", "theater", "broadway"]},
    {"venue_name": "Motorco Music Hall", "address": "723 Rigsbee Ave", "city": "Durham", "category": "Arts & Music", "keywords": ["motorco", "rigsbee", "geer st", "music hall"]},
    {"venue_name": "Ponysaurus Brewing Co.", "address": "219 Hood St", "city": "Durham", "category": "Food & Drink", "keywords": ["ponysaurus", "hood st", "patio", "beer"]},
    {"venue_name": "Eno River State Park (Cole Mill Access)", "address": "4390 Cole Mill Rd", "city": "Durham", "category": "Outdoor & Fitness", "keywords": ["eno river", "cole mill", "state park", "trail"]},
    # Raleigh
    {"venue_name": "Morgan Street Food Hall", "address": "411 W Morgan St", "city": "Raleigh", "category": "Food & Drink", "keywords": ["morgan st", "food hall", "downtown raleigh", "morgan street"]},
    {"venue_name": "Transfer Co. Food Hall", "address": "500 E Davie St", "city": "Raleigh", "category": "Food & Drink", "keywords": ["transfer co", "davie st", "food hall", "burial"]},
    {"venue_name": "Raleigh Beer Garden", "address": "614 Glenwood Ave", "city": "Raleigh", "category": "Food & Drink", "keywords": ["raleigh beer garden", "glenwood", "taps"]},
    {"venue_name": "Boxcar Bar + Arcade (Raleigh)", "address": "330 W Davie St", "city": "Raleigh", "category": "Social", "keywords": ["boxcar raleigh", "davie st", "arcade"]},
    {"venue_name": "NCMA Museum Park", "address": "2110 Blue Ridge Rd", "city": "Raleigh", "category": "Arts & Music", "keywords": ["ncma", "museum park", "blue ridge", "art museum"]},
    {"venue_name": "Moore Square Park", "address": "200 S Blount St", "city": "Raleigh", "category": "Social", "keywords": ["moore square", "blount st", "downtown raleigh park"]},
    {"venue_name": "Dorothea Dix Park", "address": "2105 Umstead Dr", "city": "Raleigh", "category": "Outdoor & Fitness", "keywords": ["dix park", "sunflowers", "umstead dr"]},
    {"venue_name": "Lincoln Theatre", "address": "126 E Cabarrus St", "city": "Raleigh", "category": "Arts & Music", "keywords": ["lincoln theatre", "cabarrus", "live music"]},
    {"venue_name": "Lake Johnson Park Waterfront", "address": "4601 Avent Ferry Rd", "city": "Raleigh", "category": "Outdoor & Fitness", "keywords": ["lake johnson", "avent ferry", "kayak", "boathouse"]},
    {"venue_name": "William B. Umstead State Park", "address": "8801 Glenwood Ave", "city": "Raleigh", "category": "Outdoor & Fitness", "keywords": ["umstead", "glenwood", "state park", "sycamore"]},
    # Cary
    {"venue_name": "Downtown Cary Park", "address": "327 S Academy St", "city": "Cary", "category": "Outdoor & Fitness", "keywords": ["cary park", "academy st", "downtown cary", "bark park"]},
    {"venue_name": "Fenton Square Lawn", "address": "21 Fenton Main St", "city": "Cary", "category": "Social", "keywords": ["fenton", "fenton main", "cary social"]},
    {"venue_name": "Koka Booth Amphitheatre", "address": "800 Regency Pkwy", "city": "Cary", "category": "Arts & Music", "keywords": ["koka booth", "regency", "amphitheatre", "symphony"]},
    # Chapel Hill & Carrboro
    {"venue_name": "Cat's Cradle", "address": "300 E Main St", "city": "Chapel Hill", "category": "Arts & Music", "keywords": ["cats cradle", "main st", "carrboro", "music"]},
    {"venue_name": "Weaver Street Market Lawn", "address": "101 E Weaver St", "city": "Chapel Hill", "category": "Social", "keywords": ["weaver street", "carrboro lawn", "weaver st"]},
    {"venue_name": "Epilogue Books Chocolate & Brews", "address": "109 E Franklin St", "city": "Chapel Hill", "category": "Social", "keywords": ["epilogue", "franklin st", "chapel hill books"]},
    # Morrisville
    {"venue_name": "Morrisville Community Park", "address": "1520 Morrisville Pkwy", "city": "Morrisville", "category": "Outdoor & Fitness", "keywords": ["morrisville park", "morrisville pkwy"]},
]

@router.get("/places/autocomplete", response_model=List[PlaceSuggestion])
def autocomplete_places(query: str = Query(..., min_length=1)):
    q = query.strip().lower()
    results = []

    for item in TRIANGLE_PLACES_DB:
        match = False
        if q in item["venue_name"].lower() or q in item["address"].lower() or q in item["city"].lower():
            match = True
        else:
            for kw in item["keywords"]:
                if q in kw or kw in q:
                    match = True
                    break

        if match:
            photo = resolve_venue_photo(item["venue_name"], item["city"], item["category"])
            results.append(PlaceSuggestion(
                venue_name=item["venue_name"],
                address=item["address"],
                city=item["city"],
                category=item["category"],
                image_url=photo
            ))

    return results[:8]

@router.get("/places/resolve-photo")
def resolve_photo(
    venue_name: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None)
):
    photo_url = resolve_venue_photo(venue_name, city, category)
    return {"image_url": photo_url}
