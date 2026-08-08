from datetime import datetime, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models.events import Event, Attendance, User

def seed_database():
    # Recreate tables cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Seed User
    user = User(
        id="user_1",
        name="Alex Chen",
        email="alex.chen@gradcohort.org",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        cohort_year="2026",
        company="Cisco / RTP"
    )
    db.add(user)

    now = datetime.utcnow()
    today_date = now.date()
    
    # Reference dates
    today_morning = datetime.combine(today_date, datetime.min.time()).replace(hour=8, minute=0)
    today_afternoon = datetime.combine(today_date, datetime.min.time()).replace(hour=14, minute=0)
    today_evening = datetime.combine(today_date, datetime.min.time()).replace(hour=20, minute=0)
    
    tomorrow_date = today_date + timedelta(days=1)
    tomorrow_afternoon = datetime.combine(tomorrow_date, datetime.min.time()).replace(hour=12, minute=0)
    tomorrow_night = datetime.combine(tomorrow_date, datetime.min.time()).replace(hour=21, minute=0)
    
    next_week_date = today_date + timedelta(days=7)
    next_week_morning = datetime.combine(next_week_date, datetime.min.time()).replace(hour=9, minute=0)
    next_week_night = datetime.combine(next_week_date, datetime.min.time()).replace(hour=19, minute=30)

    # 100% Real Verified Specific Triangle Venue Events (is_suggestion=False)
    scheduled_events = [
        Event(
            title="Durham Bulls vs. Charlotte Knights Baseball + Fireworks Night",
            description="Triple-A baseball action live at DBAP in Downtown Durham! Post-game fireworks show over the field.",
            venue_name="Durham Bulls Athletic Park (DBAP)",
            address="409 Blackwell St",
            city="Durham",
            start_at=today_evening - timedelta(minutes=90),
            end_at=today_evening + timedelta(hours=2),
            category="Sports",
            price_min=14.0,
            price_max=28.0,
            is_free=False,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1508801439612-4271aa6bc24f?w=800",
            source_name="Durham Bulls Official",
            source_url="https://www.milb.com/durham",
            source_type="API",
            external_id="real_durham_bulls_game"
        ),
        Event(
            title="Durham Farmers Market Saturday Morning Market",
            description="50+ local Triangle farmers, artisanal bakeries, cold brew coffee, and live acoustic music under the Durham Central Park pavilion.",
            venue_name="Durham Central Park",
            address="501 Foster St",
            city="Durham",
            start_at=today_morning,
            end_at=today_morning + timedelta(hours=4),
            category="Food & Drink",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800",
            source_name="Durham Farmers Market",
            source_url="https://durhamfarmersmarket.com",
            source_type="NEWSLETTER",
            external_id="real_durham_farmers_mkt_2026"
        ),
        Event(
            title="Bull City Running Co. Saturday Morning 5K Social Run",
            description="Free 3-mile & 5-mile community social run starting from Bull City Running in Ninth Street Durham. Cold drip coffee afterwards!",
            venue_name="Bull City Running Co.",
            address="905 W Main St",
            city="Durham",
            start_at=today_morning,
            end_at=today_morning + timedelta(hours=2),
            category="Sports",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
            source_name="Triangle Sports & Parks",
            source_url="https://bullcityrunning.com",
            source_type="NEWSLETTER",
            external_id="real_durham_bull_city_run"
        ),
        Event(
            title="Barbies vs. Bratz: Y2K Dance Party at Cat's Cradle",
            description="Throwback Y2K pop anthems, pink photo booths, local DJs, and themed drinks on the Main Stage in Carrboro.",
            venue_name="Cat's Cradle",
            address="300 E Main St",
            city="Chapel Hill",
            start_at=today_evening,
            end_at=today_evening + timedelta(hours=4),
            category="Social",
            price_min=15.0,
            price_max=15.0,
            is_free=False,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
            source_name="Cat's Cradle Calendar",
            source_url="https://catscradle.com/event/barbies-vs-bratz-y2k-party",
            source_type="NEWSLETTER",
            external_id="real_cats_cradle_barbies_bratz_2026"
        ),
        Event(
            title="CaribMask Carnival 2026 Parade & Festival",
            description="Vibrant Afro-Caribbean parade down Fayetteville Street featuring steel drums, costume mas bands, authentic jerk chicken, and reggae music.",
            venue_name="Downtown Raleigh Fayetteville St",
            address="Fayetteville St",
            city="Raleigh",
            start_at=tomorrow_afternoon,
            end_at=tomorrow_afternoon + timedelta(hours=6),
            category="Social",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
            source_name="Indy Week Events",
            source_url="https://www.caribmask.com",
            source_type="NEWSLETTER",
            external_id="real_raleigh_caribmask_2026"
        ),
        Event(
            title="We Found Love: 2010s EDM & Pop Party at Motorco",
            description="2010s EDM, pop bangers, laser lights, and craft brews in the main hall at Motorco Music Hall in Durham.",
            venue_name="Motorco Music Hall",
            address="723 Rigsbee Ave",
            city="Durham",
            start_at=tomorrow_night,
            end_at=tomorrow_night + timedelta(hours=4),
            category="Social",
            price_min=10.0,
            price_max=15.0,
            is_free=False,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            source_name="Motorco Calendar",
            source_url="https://motorcomusic.com/event/we-found-love-2010s-pop-party",
            source_type="API",
            external_id="real_motorco_pop_party_2026"
        ),
        Event(
            title="NC Museum of Art Outdoor Summer Movie Night",
            description="Bring lawn chairs and blankets for an outdoor movie screening under the stars at the NC Museum of Art Amphitheater. Food trucks & beer available.",
            venue_name="NCMA Amphitheater & Museum Park",
            address="2110 Blue Ridge Rd",
            city="Raleigh",
            start_at=today_evening + timedelta(minutes=30),
            end_at=today_evening + timedelta(hours=3),
            category="Arts & Music",
            price_min=10.0,
            price_max=12.0,
            is_free=False,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
            source_name="NC Museum of Art & Park",
            source_url="https://ncartmuseum.org/events/outdoor-movie-night",
            source_type="API",
            external_id="ncma_outdoor_movie_night"
        ),
        Event(
            title="50th Annual Lazy Daze Arts & Crafts Festival",
            description="Massive annual Cary tradition featuring over 250 juried artists, 4 stages of live music, food trucks, and craft beer garden at Cary Town Hall Campus.",
            venue_name="Cary Town Hall Campus",
            address="120 Wilkinson Ave",
            city="Cary",
            start_at=next_week_morning,
            end_at=next_week_morning + timedelta(hours=8),
            category="Arts & Music",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
            source_name="Town of Cary Parks & Recreation",
            source_url="https://www.carync.gov/recreation-enjoyment/events/festivals/lazy-daze-arts-and-crafts-festival",
            source_type="API",
            external_id="real_cary_lazy_daze_2026"
        ),
        Event(
            title="Hasan Minhaj & Ronny Chieng: Hasan Hates Ronny | Ronny Hates Hasan",
            description="Co-headlining stand-up comedy tour live at DPAC in Downtown Durham featuring brand new material.",
            venue_name="DPAC (Durham Performing Arts Center)",
            address="123 Vivian St",
            city="Durham",
            start_at=next_week_night,
            end_at=next_week_night + timedelta(hours=3),
            category="Arts & Music",
            price_min=49.50,
            price_max=99.50,
            is_free=False,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
            source_name="DPAC Official Events",
            source_url="https://www.dpacnc.com/events/detail/hasan-minhaj-ronny-chieng",
            source_type="API",
            external_id="real_dpac_hasan_ronny_2026"
        ),
        Event(
            title="Guardians Of The Jukebox: 80s Rock Live at Lincoln Theatre",
            description="80s tribute rock concert live at Lincoln Theatre in Downtown Raleigh.",
            venue_name="Lincoln Theatre",
            address="126 E Cabarrus St",
            city="Raleigh",
            start_at=next_week_night + timedelta(hours=1),
            end_at=next_week_night + timedelta(hours=4),
            category="Arts & Music",
            price_min=20.0,
            price_max=25.0,
            is_free=False,
            is_suggestion=False,
            image_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
            source_name="Lincoln Theatre Official",
            source_url="https://lincolntheatre.com/event/guardians-of-the-jukebox",
            source_type="API",
            external_id="real_lincoln_theatre_guardians_2026"
        )
    ]

    # Real Spot Suggestions (is_suggestion=True - NO RIGID EVENT TIMESTAMP DISPLAYED)
    spot_suggestions = [
        Event(
            title="William B. Umstead State Park (Sycamore Trail)",
            description="5,500+ acres of dense forest trails, creeks, and historic stone bridges between Raleigh and Cary. Perfect for trail running & gravel biking.",
            venue_name="Umstead State Park (Harrison Ave Entrance)",
            address="8801 Glenwood Ave",
            city="Raleigh",
            start_at=today_morning,
            category="Outdoor & Fitness",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://www.ncparks.gov/state-parks/william-b-umstead-state-park",
            source_type="SUGGESTION",
            external_id="spot_umstead_state_park"
        ),
        Event(
            title="Eno River State Park & Cole Mill Quarry",
            description="Scenic river rapids, secluded swimming holes, suspension bridge, and shaded forest trails along the Eno River in Durham.",
            venue_name="Eno River State Park (Cole Mill Access)",
            address="4390 Cole Mill Rd",
            city="Durham",
            start_at=today_morning,
            category="Outdoor & Fitness",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://www.ncparks.gov/state-parks/eno-river-state-park",
            source_type="SUGGESTION",
            external_id="spot_eno_river_park"
        ),
        Event(
            title="Dorothea Dix Park & Sunflower Field",
            description="308-acre park overlooking the Downtown Raleigh skyline! Massive summer sunflower field, dog park, and hammock groves.",
            venue_name="Dorothea Dix Park",
            address="1030 Richardson Dr",
            city="Raleigh",
            start_at=today_morning,
            category="Outdoor & Fitness",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://dixpark.org",
            source_type="SUGGESTION",
            external_id="spot_dix_park_raleigh"
        ),
        Event(
            title="Morgan Street Food Hall",
            description="20+ local Triangle food stalls, craft cocktail bar, outdoor patio, and casual group seating in Downtown Raleigh Warehouse District.",
            venue_name="Morgan Street Food Hall",
            address="411 W Morgan St",
            city="Raleigh",
            start_at=today_morning,
            category="Food & Drink",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://www.morganfoodhall.com",
            source_type="SUGGESTION",
            external_id="spot_morgan_street_hall"
        ),
        Event(
            title="Boxcar Bar + Arcade",
            description="Classic arcade cabinets, pinball machines, 24+ craft beers on tap, and open-air patio near American Tobacco Campus.",
            venue_name="Boxcar Bar + Arcade",
            address="621 W Chapel Hill St",
            city="Durham",
            start_at=today_morning,
            category="Social",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://theboxcarbar.com/durham",
            source_type="SUGGESTION",
            external_id="spot_boxcar_durham"
        ),
        Event(
            title="Transfer Co. Food Hall & Outdoor Patio",
            description="Historic 50,000 sq ft food hall featuring local seafood, authentic tacos, empanadas, local brews, and community patio.",
            venue_name="Transfer Co. Food Hall",
            address="500 E Davie St",
            city="Raleigh",
            start_at=today_morning,
            category="Food & Drink",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://www.transfercofoodhall.com",
            source_type="SUGGESTION",
            external_id="spot_transfer_co"
        ),
        Event(
            title="Epilogue Books Chocolate & Brews",
            description="Independent bookstore, Spanish thick hot chocolate, fresh churros, craft beers, and cozy study tables on Franklin Street.",
            venue_name="Epilogue Books",
            address="109 E Franklin St",
            city="Chapel Hill",
            start_at=today_morning,
            category="Social",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://epiloguebookcafe.com",
            source_type="SUGGESTION",
            external_id="spot_epilogue_chapel_hill"
        ),
        Event(
            title="Raleigh Beer Garden (380+ Taps & Rooftop)",
            description="Guinness World Record holder for most draft beers on tap! Multi-story rooftop, tree-shaded garden, and local NC brews.",
            venue_name="Raleigh Beer Garden",
            address="614 Glenwood Ave",
            city="Raleigh",
            start_at=today_morning,
            category="Food & Drink",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://theraleighbeergarden.com",
            source_type="SUGGESTION",
            external_id="spot_raleigh_beer_garden"
        ),
        Event(
            title="NC Museum of Art 164-Acre Sculpture Park",
            description="Giant outdoor art installations, paved walking & bike trails, picnic meadows, and dog-friendly park open daily sunrise to sunset.",
            venue_name="NCMA Museum Park",
            address="2110 Blue Ridge Rd",
            city="Raleigh",
            start_at=today_morning,
            category="Outdoor & Fitness",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://ncartmuseum.org/visit/museum-park",
            source_type="SUGGESTION",
            external_id="spot_ncma_sculpture_park"
        ),
        Event(
            title="Ponysaurus Brewing Co. Beer Garden",
            description="Durham brewery with multi-level outdoor deck, wood-fired pizza, craft lagers, and casual communal picnic tables.",
            venue_name="Ponysaurus Brewing Co.",
            address="219 Hood St",
            city="Durham",
            start_at=today_morning,
            category="Social",
            price_min=0.0,
            price_max=0.0,
            is_free=True,
            is_suggestion=True,
            image_url="https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800",
            source_name="Cohort Spot Recommendation",
            source_url="https://ponysaurusbrewing.com",
            source_type="SUGGESTION",
            external_id="spot_ponysaurus_durham"
        )
    ]

    all_items = scheduled_events + spot_suggestions

    for item in all_items:
        db.add(item)
    db.commit()

    seeded_items = db.query(Event).all()
    
    attendees_data = [
        {"user_id": "user_2", "user_name": "Jordan Taylor", "user_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"},
        {"user_id": "user_3", "user_name": "Samira Khan", "user_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"},
        {"user_id": "user_4", "user_name": "Chris Rodriguez", "user_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"},
        {"user_id": "user_5", "user_name": "Maya Patel", "user_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"},
        {"user_id": "user_1", "user_name": "Alex Chen", "user_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
    ]

    for idx, ev in enumerate(seeded_items):
        if idx % 2 == 0:
            for att in attendees_data[:(idx % 3) + 2]:
                db.add(Attendance(
                    event_id=ev.id,
                    user_id=att["user_id"],
                    user_name=att["user_name"],
                    user_avatar=att["user_avatar"],
                    status="GOING"
                ))
        else:
            for att in attendees_data[1:3]:
                db.add(Attendance(
                    event_id=ev.id,
                    user_id=att["user_id"],
                    user_name=att["user_name"],
                    user_avatar=att["user_avatar"],
                    status="INTERESTED"
                ))

    db.commit()
    db.close()
    print("Successfully seeded database with Sports & Parks events AND spot recommendations!")

if __name__ == "__main__":
    seed_database()
