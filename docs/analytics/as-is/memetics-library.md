# Memetics Library (as-is)

## Purpose
- Browse memetic specializations with search and filtering.

## Data sources
- Memetics collection from `src/data/memetics.json` (raw API data) mapped in `src/data/memetics.ts`.
- Icons resolved to local assets in `src/assets/memetics`.

## Filters
- **Search by name** (case-insensitive).
- **Scenario filter** with alias normalization:
  - `Endless Dream` = `Deviation: Survive, Capture, Preserve` = `Way of Winter`
  - Logic centralized in `src/utils/scenarioAliases.ts`.
- **Tier filter** by tier group.

## UI behavior
- Grid of cards with icon, name, effect title, short description, and tags.
- Optional rating tag per perk (SS/S/A/B/C) when available.
- Long tags wrap inside the card.
- Long names wrap in the card title (no truncation).

## Persistence
- No user state persisted for this page.
