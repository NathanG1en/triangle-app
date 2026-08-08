# Triangle App Design Guidelines for Agents

All UI changes in this codebase must adhere to the design system in [docs/DESIGN_GUIDELINES.md](file:///Users/nathanglen/.gemini/antigravity/scratch/triangle-app/docs/DESIGN_GUIDELINES.md).

## Critical Directives:
- **Typography System**: Playful Grotesk (`Bricolage Grotesque` display + `Outfit` body/metadata).
- **Alt-Weekly City Guide**: Design like a local alt-weekly culture publication rebuilt as a social app (NOT a SaaS component library).
- **No Pill Spam**: Pills are ONLY for interactive filters (`This Weekend`, `Today`, `Free`, `Filters`). All event metadata is plain text (`FOOD & DRINK · DURHAM`).
- **No Nested Containers & Zero Emoji**: Separate content using fine horizontal rules (`───`) and whitespace. Do NOT use decorative emoji (`⚡`, `⚙`, `📍`, `📅`, `🏢`).
- **Elevate Photography**: Large 16:9 local photos on featured events and clean thumbnails on editorial list items.
- **Asymmetric Social Module**: Human social story ("*Jordan + 3 others are headed to Durham Night Market Saturday*") with overlapping avatars.
- **Publication Headlines**: Editorial section titles (*"12 things worth doing this weekend"*, *"Free stuff worth leaving the apartment for"*).
- **Strict 3 Radii**: `pill` (interactive filters), `8px` (buttons/inputs), `16px` (hero/modals).
