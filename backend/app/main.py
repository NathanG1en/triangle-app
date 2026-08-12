from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.v1.events import router as events_router
from app.api.v1.ingestion import router as ingestion_router
from app.api.v1.calendar import router as calendar_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.places import router as places_router
from app.api.v1.moderation import router as moderation_router
from app.api.v1.users import router as users_router
from app.api.v1.legal import router as legal_router
from app.services.seed_data import seed_database

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Triangle Social Events API",
    description="Backend service for Triangle area cohort event discovery and social attendance",
    version="1.0.0"
)

# Enable CORS for mobile & Expo web apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events_router, prefix="/api/v1")
app.include_router(ingestion_router, prefix="/api/v1/ingestion")
app.include_router(calendar_router, prefix="/api/v1/calendar")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(places_router, prefix="/api/v1")
app.include_router(moderation_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(legal_router, prefix="")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "triangle-events-api", "version": "1.0.0"}

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Triangle Social Events API is running. Visit /docs for the API schema."}

@app.on_event("startup")
def on_startup():
    # Automatically seed initial database if empty
    from app.core.database import SessionLocal
    from app.models.events import Event
    db = SessionLocal()
    count = db.query(Event).count()
    if count == 0:
        seed_database()
    db.close()
