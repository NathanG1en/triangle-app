from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.v1.events import router as events_router
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

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "triangle-events-api", "version": "1.0.0"}

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
