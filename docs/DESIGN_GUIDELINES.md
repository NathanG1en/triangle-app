# Design Guidelines for the Triangle Social Events App

## 1. Design Direction

The product combines two complementary design concepts:
1. **Hinge**: Calm, intentional, human, editorial, and highly legible.
2. **Rodeo**: Energetic, social, playful, collage-like, and willing to break the grid.

The result feels like **a well-designed local culture magazine that happens to be an event-planning app**.

### Target Feeling
**Human · Social · Editorial · Playful · Intentional · Local**

> *"There are interesting people doing interesting things near me, and joining them is easy."*

---

## 2. Core Design Principles

### 2.1 People before software
The interface exists to get users **off the app and into real life**. Events, people, neighborhoods, photography, and plans dominate the experience. UI chrome recedes.

### 2.2 Editorial, not algorithmic
Treat event discovery like browsing a good local culture magazine rather than scrolling an infinite database. Use strong headlines, curated sections, large photography, varied card sizes, and short editorial descriptions.

### 2.3 Controlled imperfection
The base UI is clean off-white paper and dark ink. Personality comes from selective disruption: slightly rotated sticker labels, ticket-stub shapes, poster typography, and fine hand-drawn borders.

### 2.4 Visible social proof
"Who is going?" is core information. Event surfaces prioritize:
1. Event title & imagery
2. Time & neighborhood
3. People attending (avatar stack + human text: *"Maya, Chris + 4 are going"*)
4. Primary action button (*"I'm going"*)

---

## 3. Design System & Tokens

### 3.1 Color Palette
- **Paper (`#FFFEFD`)**: Main background (warm off-white).
- **Ink (`#1A1A1A`)**: Primary text, borders, headers (warm black).
- **Surface (`#F5F1EC`)**: Cards, secondary surfaces, pills.
- **Muted (`#77736F`)**: Secondary text, metadata.
- **Ticket Border (`#E2DDD7`)**: Card divider lines.
- **Accents**:
  - `coral`: `#D95F4B`
  - `forest`: `#075E59`
  - `aubergine`: `#67295F`
  - `lilac`: `#C8C4E8`
  - `sand`: `#E8D7CC`

*Rule: 85–90% of the UI remains neutral paper/ink/surface.*

### 3.2 Typography
- **Display / Editorial**: Warm serif (`serif`, Georgia, Playfair Display) for headlines, featured card titles, and section introductions.
- **Functional**: Clean sans-serif (`Inter`, `Geist`, sans-serif) for buttons, navigation, labels, and body text.

---

## 4. AI Agent Implementation Rules

When generating or editing UI for this repository, follow these rules in priority order:

1. **Make the user's next action obvious.**
2. **Prioritize events and people over interface chrome.**
3. **Use neutral warm paper (`#FFFEFD`) backgrounds as default.**
4. **Use serif typography for editorial titles and sans-serif for functional UI.**
5. **Expose social context ("Maya + 3 going") wherever it helps a user decide.**
6. **Use authentic local photography in discovery surfaces.**
7. **Vary discovery layouts (Featured Hero -> Social Row -> Curated Sections -> Feed) instead of identical card grids.**
8. **Add personality through controlled ticket stubs or sticker tags.**
9. **Never sacrifice readability for aesthetic experimentation.**
10. **Re-use existing design tokens (`paper`, `ink`, `surface`, `coral`, `forest`, `aubergine`).**
