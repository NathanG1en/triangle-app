# Design Guidelines for the Triangle Social Events App

## 1. Design Direction: Playful Alt-Weekly City Guide Rebuilt as a Social App

The product combines two complementary concepts:
1. **Playful Local Alt-Weekly / Culture Publication**: Energetic, casual, expressive, print-inspired, clean typography, horizontal rules, and generous whitespace.
2. **Social Intent**: Asymmetric, human social proof (*"Jordan + 3 others are headed to Durham Night Market Saturday"*).

The target feeling is **a great local alt-weekly / city guide rebuilt as a social app**, NOT an "Eventbrite clone with serif fonts" or a "generic AI SaaS dashboard."

---

## 2. Core Principles

### 2.1 60% Social Discovery / 40% Directory
Do **not** present the app as "search a database of Triangle events." Design it as "open the app and immediately see what you and your friends could do."

### 2.2 Typography System: Playful Grotesk
- **Display / Headlines**: `Bricolage Grotesque` (expressive, quirky, fun display grotesk with personality traps).
- **Body / Metadata**: `Outfit` (clean, rounded, friendly geometric sans-serif).
- **Accent / Script**: `Caveat` (warm handwritten script for badges & stamps).

### 2.3 Kill 70% of Pills & Capsules
Pills are reserved strictly for **interactive filter buttons** (`This Weekend`, `Today`, `Free`, `Filters`).
Do **NOT** wrap ordinary metadata into pill capsules. Metadata is plain text:
- **Incorrect**: `[Food & Drink] [📍 Durham] [FREE]`
- **Correct**: `FOOD & DRINK · DURHAM` -> **Durham Night Market** -> `Free · Saturday 5–10 PM`

### 2.4 Kill 50% of Containers & All Decorative Emoji
Avoid nested cards inside containers inside cards. Separate content using **horizontal rules (`───`)**, whitespace, and expressive typography.
Do **NOT** place decorative emoji in front of metadata fields (`⚡`, `⚙`, `📍`, `📅`, `🏢`). Clean typography is cleaner and more editorial.

### 2.5 Elevate Local Photography
Photography carries the visual personality. Feature large 16:9 local photos on featured events and clean thumbnails on editorial list items.

### 2.6 Asymmetric Social Story Module
Instead of a rigid carousel of identical card boxes, "YOUR PEOPLE ARE GOING" is a human social story:
> **YOUR PEOPLE ARE GOING**
>
> ### Jordan + 3 others are headed to
> ### Durham Night Market Saturday.
> [overlapping avatars] **See who's going →**
> ──────────────────────────────
> Alex + 2 → **Downtown Cary Park**
> Maya + 4 → **Raleigh Food Hall Happy Hour**

---

## 3. AI Agent Implementation Rules

When generating or editing UI for this repository:
1. **Typography**: Always use `Bricolage Grotesque` for headlines/display titles and `Outfit` for body/metadata.
2. **Kill 70% of pills**: Pills are ONLY for interactive filters (`This Weekend`, `Today`, `Free`, `Filters`).
3. **Kill nested containers**: Use fine horizontal rules (`───`) and whitespace to separate content.
4. **Zero decorative emoji**: No `⚡`, `⚙`, `📍`, `📅`, `🏢` in front of metadata.
5. **Use large 16:9 local photography on featured events.**
6. **Format standard feed items as clean alt-weekly list rows with fine rule dividers.**
7. **Make the social section an asymmetric human story ("Jordan + 3 are headed to...").**
8. **Use human alt-weekly publication headlines ("12 things worth doing this weekend").**
9. **Enforce 3 radii: `pill` (filters), `8px` (buttons/inputs), `16px` (hero/modals).**
10. **Use vector SVG icons for bottom tab navigation (Compass, Calendar, Person).**
