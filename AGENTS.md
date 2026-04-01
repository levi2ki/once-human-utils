# Project Agent Notes

This file is a questionnaire to fill in before we proceed step by step.

## Basics
1. What is the project's purpose and primary outcomes?
   Answer: Build small utilities for the Once Human game: character perks, planting tools, and compact item/skill collections.
2. Who is the main user or stakeholder?
   Answer: Primarily for my own use, but open to anyone else who wants to use it.
3. What is the current status (idea, prototype, in use, maintenance)?
   Answer: Published as a static site via GitHub Pages; no backend, all data handled locally.

## Scope and Constraints
4. What is in scope for the current work?
   Answer: Identify and prioritize new feature ideas now that high-priority features are done.
5. What is explicitly out of scope?
   Answer: Building calculators, a full game database, or handling data via a backend.
6. Are there hard deadlines or milestones?
   Answer: No; work is driven by inspiration or issues.
7. What constraints exist (budget, tech, platform, compliance)?
   Answer: Free tool with no budget or deadlines; the main constraint is media/content legality.

## Tech and Architecture
8. What is the current tech stack?
   Answer: React, TypeScript, Vite, Vite PWA, IndexedDB, Ant Design. No plans to change or expand the stack.
9. Are there architectural decisions already made? If yes, list them.
   Answer: Yes; documented in `docs/` (including analytics).
10. What environments are supported (local, staging, prod)?
   Answer: No classic environments; static content served locally or via GitHub Pages.

## Data and Integrations
11. What data sources are used?
   Answer: Hardcoded JSON, IndexedDB, user input, and scraped data. Open to public APIs if discovered.
12. What external services/APIs are integrated?
   Answer: None currently.
13. Are there security or privacy requirements?
   Answer: No private data collected and no authentication.

## Workflow
14. What is the preferred development workflow (branching, reviews)?
   Answer: Classic flow: feature -> to-be -> develop -> review -> test -> deploy -> as-is.
15. What is the test strategy (unit, integration, e2e)?
   Answer: TBD; currently manual testing only.
16. How is the app deployed today?
   Answer: GitHub Actions.

## Priorities
17. What are the top 3 priorities right now?
   Answer: App stability and keeping data aligned with game updates.
18. What does "done" look like for this step?
   Answer: This step is complete; no further steps planned right now.

## Notes
- Add any extra context, links, or decisions here.
