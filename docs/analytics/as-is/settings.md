# Settings (as-is)

## Purpose
- Manage app-wide preferences stored locally.

## Theme preference
- Options: `system`, `light`, `dark`.
- If `system` is selected:
  - Uses `prefers-color-scheme` media query.
  - Falls back to light when system value is undefined.

## Persistence
- Stored in LocalStorage via `src/storage/settingsStore.ts`.
- Key: `once-human-theme`.

## Implementation
- `ThemeProvider` wraps the app and applies Ant Design theme algorithms.
- Updates `document.body.dataset.theme` for CSS overrides.
