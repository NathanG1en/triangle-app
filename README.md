# Triangle Social Events App

Mobile-first social discovery app for new-graduate cohorts in the Research Triangle area (Cary, Morrisville, Raleigh, Durham, Chapel Hill).

## Project Architecture & Design System

- **Design Guidelines**: [docs/DESIGN_GUIDELINES.md](file:///Users/nathanglen/.gemini/antigravity/scratch/triangle-app/docs/DESIGN_GUIDELINES.md) (Hinge + Rodeo editorial magazine system)

```
triangle-app/
  docs/
    DESIGN_GUIDELINES.md
  mobile/             # Expo (React Native / Web) frontend
    App.tsx           # Main App entry point
    src/
      theme/          # Design system tokens (colors, typography)
      components/     # UI components (FeaturedEventCard, EventCard, FriendActivityRow)
      screens/        # Screen views (DiscoverScreen, MyEvents, Profile)
      services/       # API integration client
  backend/            # FastAPI Python backend
    app/
      main.py         # App initialization & router mounts
      api/v1/         # REST API endpoints
      core/           # Database engine & configs
      models/         # SQLAlchemy ORM models
      schemas/        # Pydantic data schemas
      services/       # Seed data & business logic
      ingestion/      # Source connectors, deduplication & normalization
    tests/            # Pytest integration & unit tests
  docker-compose.yml  # Local database/services orchestration
```

## Quick Start

### 1. Backend (FastAPI + SQLite/PostgreSQL)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m app.services.seed_data
uvicorn app.main:app --reload --port 8000
```
- API Documentation: http://localhost:8000/docs

### 2. Mobile App (Expo Web / Mobile)
```bash
cd mobile
npm install
npx expo start --web
```
- Open browser at http://localhost:8081
