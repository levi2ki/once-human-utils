# Once Human Utils

Helper PWA for Once Human focused on memetic specializations and twink tech management.

Live: https://levi2ki.github.io/once-human-utils/

## Features

- Configuration tabs with per-scenario filtering
- Character lists with tiered memetic slots
- Local storage persistence
- Offline-ready PWA assets
- Local memetics icon cache

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Data updates

Scripts live in `scripts/` (folder is gitignored; add them locally if you need to refresh data).

- Memetics data and icons:
  ```bash
  node scripts/scrape-memetics.mjs
  node scripts/download-memetics-images.mjs
  ```
- Creature icons → `src/assets/creatures/`. List of filenames: `scripts/creature-icon-filenames.json`. Add new entries there and run:
  ```bash
  node scripts/download-creature-icons.mjs
  ```

Scenarios list is curated in `src/data/scenarios.json`.
