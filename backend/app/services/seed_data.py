from datetime import datetime, timedelta
from app.core.database import Base, engine, SessionLocal
from app.models.events import Event, Attendance, User

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for fresh seed
    db.query(Attendance).delete()
    db.query(Event).delete()
    db.query(User).delete()
    db.commit()

    # Create sample cohort users
    users = [
        User(id="user_1", email="alex.chen@gradcohort.org", name="Alex Chen", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", cohort_year="2026", company="Cisco"),
        User(id="user_2", email="maya.patel@gradcohort.org", name="Maya Patel", avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", cohort_year="2026", company="Lenovo"),
        User(id="user_3", email="jordan.taylor@gradcohort.org", name="Jordan Taylor", avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", cohort_year="2026", company="Fidelity"),
        User(id="user_4", email="samira.khan@gradcohort.org", name="Samira Khan", avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", cohort_year="2026", company="SAS Institute"),
        User(id="user_5", email="david.kim@gradcohort.org", name="David Kim", avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", cohort_year="2026", company="IBM"),
    ]
    for u in users:
        db.add(u)
    db.commit()

    now = datetime.utcnow()
    # Helpers for dates
    today_evening = now.replace(hour=18, minute=30, second=0, microsecond=0)
    tomorrow_afternoon = (now + timedelta(days=1)).replace(hour=14, minute=0, second=0, microsecond=0)
    this_saturday = (now + timedelta(days=(5 - now.weekday()) % 7)).replace(hour=10, minute=0, second=0, microsecond=0)
    this_sunday = (now + timedelta(days=(6 - now.weekday()) % 7)).replace(hour=16, minute=0, second=0, microsecond=0)
    next_week = (now + timedelta(days=7)).replace(hour=19, minute=0, second=0, microsecond=0)

    events_data = [
        # Cary Events
        {
            "title": "Downtown Cary Park Sunset Live Music & Picnic",
            "description": "Gather on the Great Lawn for live indie acoustic music, lawn games, food trucks, and craft beverages at Downtown Cary's landmark park.",
            "venue_name": "Downtown Cary Park",
            "address": "327 S Academy St",
            "city": "Cary",
            "start_at": today_evening,
            "end_at": today_evening + timedelta(hours=3),
            "category": "Arts & Music",
            "price_min": 0.0,
            "price_max": 0.0,
            "is_free": True,
            "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
            "source_name": "Town of Cary Events",
            "source_url": "https://www.carync.gov/recreation-enjoyment/parks-greenways-facilities/downtown-cary-park",
            "source_type": "API",
            "external_id": "cary_park_music_01"
        },
        {
            "title": "Fenton Outdoor Cinema: Retro Movie Night",
            "description": "Free outdoor screening on the lawn at Fenton. Bring blankets and chairs. Food specials from local Fenton restaurants.",
            "venue_name": "Fenton Square",
            "address": "21 Fenton Main St",
            "city": "Cary",
            "start_at": this_saturday + timedelta(hours=9),
            "end_at": this_saturday + timedelta(hours=11, minutes=30),
            "category": "Social",
            "price_min": 0.0,
            "price_max": 0.0,
            "is_free": True,
            "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
            "source_name": "Fenton District Calendar",
            "source_url": "https://fentonnc.com/events",
            "source_type": "HTML",
            "external_id": "fenton_movie_02"
        },

        # Morrisville Events
        {
            "title": "Morrisville Food Truck Rally & Board Games",
            "description": "A relaxed gathering of Triangle tech grads sampling 8+ food trucks, craft cider, and open lawn board games.",
            "venue_name": "Morrisville Town Hall Green",
            "address": "100 Town Hall Dr",
            "city": "Morrisville",
            "start_at": tomorrow_afternoon,
            "end_at": tomorrow_afternoon + timedelta(hours=4),
            "category": "Food & Drink",
            "price_min": 5.0,
            "price_max": 20.0,
            "is_free": False,
            "image_url": "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80",
            "source_name": "Morrisville Community News",
            "source_url": "https://www.morrisvillenc.gov/events",
            "source_type": "NEWSLETTER",
            "external_id": "morrisville_foodtruck_03"
        },
        {
            "title": "Lake Crabtree Kayak & Paddle Social",
            "description": "Group kayak and paddleboard session on Lake Crabtree followed by ice cream. Rental equipment available on site.",
            "venue_name": "Lake Crabtree County Park",
            "address": "1400 Aviation Pkwy",
            "city": "Morrisville",
            "start_at": this_sunday,
            "end_at": this_sunday + timedelta(hours=3),
            "category": "Outdoor & Fitness",
            "price_min": 15.0,
            "price_max": 25.0,
            "is_free": False,
            "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
            "source_name": "Triangle Outdoors Group",
            "source_url": "https://wakegov.com/parks/lakecrabtree",
            "source_type": "COMMUNITY",
            "external_id": "crabtree_kayak_04"
        },

        # Raleigh Events
        {
            "title": "Raleigh Tech Cohort Happy Hour at Morgan Street Food Hall",
            "description": "Meet fellow tech & business new grads working across RTP and Downtown Raleigh. Dedicated space reserved on the patio.",
            "venue_name": "Morgan Street Food Hall",
            "address": "411 W Morgan St",
            "city": "Raleigh",
            "start_at": today_evening + timedelta(minutes=30),
            "end_at": today_evening + timedelta(hours=3, minutes=30),
            "category": "Tech & Professional",
            "price_min": 0.0,
            "price_max": 15.0,
            "is_free": True,
            "image_url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80",
            "source_name": "Raleigh Grads Network",
            "source_url": "https://raleightechgrads.com/events/morgan-st",
            "source_type": "COMMUNITY",
            "external_id": "raleigh_happyhour_05"
        },
        {
            "title": "NC Museum of Art Sunset Hike & Sculpture Park Tour",
            "description": "Guided sunset walk through NCMA's 164-acre park showcasing large-scale outdoor installations. Perfect networking walk.",
            "venue_name": "North Carolina Museum of Art",
            "address": "2110 Blue Ridge Rd",
            "city": "Raleigh",
            "start_at": this_saturday + timedelta(hours=7),
            "end_at": this_saturday + timedelta(hours=9),
            "category": "Outdoor & Fitness",
            "price_min": 0.0,
            "price_max": 0.0,
            "is_free": True,
            "image_url": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80",
            "source_name": "NCMA Public Events",
            "source_url": "https://ncartmuseum.org/events",
            "source_type": "API",
            "external_id": "ncma_sculpture_06"
        },

        # Durham Events
        {
            "title": "Durham Night Market at American Tobacco Campus",
            "description": "Local artisans, live music, food trucks, and craft beer under the iconic water tower in downtown Durham.",
            "venue_name": "American Tobacco Campus",
            "address": "300 Blackwell St",
            "city": "Durham",
            "start_at": this_saturday,
            "end_at": this_saturday + timedelta(hours=5),
            "category": "Food & Drink",
            "price_min": 0.0,
            "price_max": 0.0,
            "is_free": True,
            "image_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
            "source_name": "Durham Lowdown Newsletter",
            "source_url": "https://durhamlowdown.com/editions/friday-night-market",
            "source_type": "NEWSLETTER",
            "external_id": "durham_market_07"
        },
        {
            "title": "Fullsteam Brewery Trivia & Food Truck Rally",
            "description": "Bring your cohort team for weekly trivia, local brews, and authentic Carolina BBQ.",
            "venue_name": "Fullsteam Brewery",
            "address": "726 Rigsbee Ave",
            "city": "Durham",
            "start_at": next_week,
            "end_at": next_week + timedelta(hours=2, minutes=30),
            "category": "Social",
            "price_min": 0.0,
            "price_max": 10.0,
            "is_free": True,
            "image_url": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&auto=format&fit=crop&q=80",
            "source_name": "Durham Lowdown Newsletter",
            "source_url": "https://durhamlowdown.com/editions/fullsteam-trivia",
            "source_type": "NEWSLETTER",
            "external_id": "durham_fullsteam_08"
        },

        # Chapel Hill Events
        {
            "title": "Franklin Street Coffee & Saturday Morning Run",
            "description": "5K casual social jog along the Bolin Creek Trail starting and finishing at Epilogue Books & Cafe on Franklin St.",
            "venue_name": "Epilogue Books Chocolate & Brews",
            "address": "109 E Franklin St",
            "city": "Chapel Hill",
            "start_at": this_saturday - timedelta(hours=2),
            "end_at": this_saturday + timedelta(hours=1),
            "category": "Outdoor & Fitness",
            "price_min": 0.0,
            "price_max": 5.0,
            "is_free": True,
            "image_url": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80",
            "source_name": "Chapel Hill Run Club",
            "source_url": "https://chapelhillrunners.org/saturday-social",
            "source_type": "COMMUNITY",
            "external_id": "chapel_hill_run_09"
        },
        {
            "title": "Morehead Planetarium Carolina Skies Star Show",
            "description": "Private cohort group viewing of the night sky stargazing show followed by drinks at Top of the Hill.",
            "venue_name": "Morehead Planetarium",
            "address": "250 E Franklin St",
            "city": "Chapel Hill",
            "start_at": this_sunday + timedelta(hours=2),
            "end_at": this_sunday + timedelta(hours=4),
            "category": "Arts & Music",
            "price_min": 10.0,
            "price_max": 10.0,
            "is_free": False,
            "image_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80",
            "source_name": "Morehead Planetarium Calendar",
            "source_url": "https://moreheadplanetarium.org/shows",
            "source_type": "API",
            "external_id": "morehead_planetarium_10"
        }
    ]

    events = []
    for ed in events_data:
        e = Event(**ed)
        db.add(e)
        events.append(e)
    db.commit()

    # Add initial social attendance
    attendances_data = [
        # Event 1: Downtown Cary Park
        Attendance(event_id=events[0].id, user_id="user_1", user_name="Alex Chen", user_avatar=users[0].avatar_url, status="GOING"),
        Attendance(event_id=events[0].id, user_id="user_2", user_name="Maya Patel", user_avatar=users[1].avatar_url, status="GOING"),
        Attendance(event_id=events[0].id, user_id="user_3", user_name="Jordan Taylor", user_avatar=users[2].avatar_url, status="INTERESTED"),

        # Event 3: Morrisville Food Truck
        Attendance(event_id=events[2].id, user_id="user_4", user_name="Samira Khan", user_avatar=users[3].avatar_url, status="GOING"),
        Attendance(event_id=events[2].id, user_id="user_5", user_name="David Kim", user_avatar=users[4].avatar_url, status="GOING"),
        Attendance(event_id=events[2].id, user_id="user_1", user_name="Alex Chen", user_avatar=users[0].avatar_url, status="INTERESTED"),

        # Event 5: Raleigh Happy Hour
        Attendance(event_id=events[4].id, user_id="user_1", user_name="Alex Chen", user_avatar=users[0].avatar_url, status="GOING"),
        Attendance(event_id=events[4].id, user_id="user_2", user_name="Maya Patel", user_avatar=users[1].avatar_url, status="GOING"),
        Attendance(event_id=events[4].id, user_id="user_3", user_name="Jordan Taylor", user_avatar=users[2].avatar_url, status="GOING"),
        Attendance(event_id=events[4].id, user_id="user_5", user_name="David Kim", user_avatar=users[4].avatar_url, status="INTERESTED"),

        # Event 7: Durham Night Market
        Attendance(event_id=events[6].id, user_id="user_3", user_name="Jordan Taylor", user_avatar=users[2].avatar_url, status="GOING"),
        Attendance(event_id=events[6].id, user_id="user_4", user_name="Samira Khan", user_avatar=users[3].avatar_url, status="INTERESTED"),
    ]

    for a in attendances_data:
        db.add(a)
    db.commit()

    print(f"Successfully seeded database with {len(events)} Triangle events and initial cohort attendances!")
    db.close()

if __name__ == "__main__":
    seed_database()
