# Planting Configs (as-is)

## Purpose
- Plan planting layouts across floors with group-based pots, lighting, and irrigation.

## Data sources
- Plant collection from `src/data/plants.json`, mapped in `src/data/plants.ts`.

## Core concepts
- **Planting Config**: top-level configuration with a name and auto mode flag.
- **Floor**: contains 4 groups (10 pots each) and one irrigation system.
- **Group**: one plant per group (10 pots).

## Constraints & limits
- Each floor adds 45 buildings (40 pots + 4 lights + 1 irrigation).
- Total buildings across floors cannot exceed 250.
- Only full floors and full groups are used.

## Range calculations
- **Recommended water/light range**: intersection of plant ranges on a floor with `origMin + 10` and `origMax` unchanged.
- **Original range**: same calculation with `min + 0`, shown in tooltips.
- A recommended range is valid when `origMin + 10 <= origMax`.

## Water spillover (neighbor floor)
- Only the **immediately upper floor** affects the current floor.
- If the upper floor’s recommended **water min** is higher than the current floor’s **water min**, the current floor’s min is **overwritten**.
- If overwrite makes `min > max`, the water range becomes `No overlap` and is shown as invalid.
- A warning note appears when the lower bound is overwritten.

## Auto mode
- When enabled, the app checks for global and per-floor overlaps.
- Shows global Recommended ranges (water + light) and floor-level ranges.
- Auto tag on each group header uses green/red based on global validity.
- “Growshroom gardeners” count equals number of unique plant species in the config.

## UI behavior
- Floors are displayed in reverse order (higher floors first).
- Groups use a Select with options grouped by plant group.
- Each group card shows:
  - **Recommended range** in green
  - **Original range** in secondary text
  - Order: water then light

## Persistence
- Stored locally (LocalStorage) via `src/storage/plantingStore.ts`.
