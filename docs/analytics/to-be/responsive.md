# Responsive improvements (to-be)

## Goal
- Ensure the UI works cleanly on tablets and phones without layout breaks.

## Scope
- Tech Configs
- Planting Configs
- Memetics Library
- Settings
- Global layout (sidebar, header, content)

## Planned work
- Define tablet and mobile breakpoints and document expected behavior.
- Reflow sidebar into a drawer or top nav on small screens.
- Adjust grids and cards for single-column layouts on mobile.
- Ensure modals, selects, and tables fit without horizontal scrolling.
- Validate touch target sizes and spacing.

## Todo
1) Adapt the global layout.
2) Adapt the navigation menu: use a burger menu on mobile.
3) Adapt Tech Configs layers (page, lists, filters, groups, cards).
4) Adapt Planting Configs layers (page, lists, filters, groups, cards).
5) Adapt Memetics Library layers (page, lists, filters, groups, cards).
6) Adapt Settings layers (page, lists, filters, groups, cards).

## Implementation details
- Use Ant Design breakpoints: `xs <576`, `sm ≥576`, `md ≥768`, `lg ≥992`, `xl ≥1200`, `xxl ≥1600`.
- Prefer `Row`/`Col` with responsive props for layouts.
- Use `Grid.useBreakpoint()` for conditional UI behavior.
