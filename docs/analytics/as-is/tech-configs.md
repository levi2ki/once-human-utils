# Tech Configs (as-is)

## Purpose
- Build and manage memetic specialization setups for Once Human characters.

## Data sources
- Memetics collection is loaded from local JSON (`src/data/memetics.json`) and mapped in `src/data/memetics.ts`.
- Perk icons are stored locally under `src/assets/memetics`.

## Core concepts
- **Tech Config**: top-level configuration with a name and optional scenario.
- **Character**: a list within a config; up to 10 characters per config.
- **Tier groups**: three level tiers (Lv. 5/10/15, Lv. 20/25/30/35, Lv. 40/45/50).
- **Level slots**: one perk per level slot.

## Functional behavior
- Create, rename, and delete configs via editable tabs.
- Create, rename, and delete characters.
- Character delete requires confirmation if any perk is selected.
- Scenario selection is per-config.
- Perk selection happens via modal; selection input stretches full width and shows selected perk preview.
- Perk tooltip shows icon, name, identity/effect category, and description.

## Constraints & validation
- Max 10 characters per config.
- **Within a character**: if a memetic is selected in any slot, it is not available in other slots.
- **Across characters** within the same config: duplicates are allowed but highlighted in yellow.
- Each level slot accepts only a perk available at that specific level.

## UI notes
- Perk cards show selected perk or “Empty”; clicking opens the selection modal.
- Duplicate or invalid selections are styled (yellow/red).
- Optional slot status: HOLD or REPLACE.
- For REPLACE slots, a wish perk can be stored as the desired replacement.
- Character counter shows `Characters: X / 10`.

## Persistence
- Stored locally (LocalStorage) via `src/storage/configStore.ts`.
