# Change Log

This log records notable project changes. Entries are in reverse chronological order.

## Version 2.4.1 — 2026-10-31

### Added

- SEO metadata in `index.html`: description, keywords, robots, canonical URL, theme colors, Open Graph and Twitter cards, JSON-LD `WebApplication` data, and fallback content for crawlers without JavaScript.
- `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.
- `public/favicon.svg` and `public/og-image.png` (social preview).

### Fixed (from a Lighthouse report)

- Missing meta description (SEO).
- Viewport no longer blocks zooming (`user-scalable=no` removed); the canvas still handles its own gestures.
- Stroke width slider now has an accessible name.
- Canvas workspace container has `role="region"` so its `aria-label` is valid.

## Version 2.4.0 — 2026-10-31

### Added

- Export dialog (replaces the one-click PNG button) with a live preview and output size in pixels.
- Options: include background, dark-mode colors (independent of the app theme), and scale 1x/2x/3x. Options are remembered.
- Outputs: PNG download, SVG download (built from the elements, not a bitmap), and copy PNG to clipboard.
- Exports crop to the content bounds plus padding, and use only the selection when something is selected.
- Clear messages for an empty board, boards too large for the chosen scale, and clipboard errors or missing support.
- New `src/utils/exportScene.js` with tests.

### Removed

- `src/utils/export.js` (viewport-based PNG export).

### Known limitation

- SVG text honors line breaks but does not auto-wrap long lines inside shapes like the canvas does.

## Version 2.3.0 — 2026-10-31

### Added

- Multiple selection: Shift+click to add/remove, drag a marquee on empty canvas, and Ctrl/Cmd+A to select all.
- Group bounding box with move, resize, and rotate for the whole selection.
- Delete, bring forward/send backward, stroke color, and stroke width now apply to every selected element, each as one undo step.
- "N selected" label in the properties bar.
- Shortcuts dialog and README updated; new pure helpers in `src/utils/selection.js` with tests.

### Changed

- Selection state is now `selectedIds`; `selectedId` is derived (set only for a single selection).
- Ctrl/Cmd combinations no longer trigger single-key tool shortcuts.
- Stroke width slider previews live and commits one history step on release.

## Version 2.2.0 — 2026-10-31

### Added

- Theme-aware colors: palette colors have separate light and dark variants, and custom colors are adjusted only as far as needed to stay readable. Stored colors are unchanged, so existing drawings recolor when the theme changes.
- Two-finger pinch zoom and pan on touch devices, zooming around the midpoint of the fingers.
- Escape now clears the selection.
- A dismissible notice when changes cannot be saved in the browser.
- Focus rings, reduced-motion support, and ARIA labels/states for toolbar, properties, and header controls.

### Changed

- Element ids use `crypto.randomUUID()` instead of `Date.now()`.
- Layering (bring forward / send backward) is now undoable.
- Undo history is capped at 100 steps.
- Saved elements, viewport, and preferences are validated on load; invalid data falls back to safe defaults.
- Pointer capture replaces `onPointerLeave`, so drags and drawings finish correctly outside the canvas.
- Wheel zoom uses the shared zoom limits.
- The shortcuts dialog is an accessible modal (focus trap, focus restore, Escape to close), and global shortcuts ignore keys pressed inside dialogs.
- Theme storage access is guarded for restricted browsing modes.
- The legacy green `#10b981` is replaced by `#059669` in the palette for contrast; saved `#10b981` strokes still map to the green swatch.

## Version 2.1.0 — 2026-10-31

### Quality foundation

- Added Node.js tests for coordinate conversion, touch helpers, and undo/redo history behavior.
- Centralized history append and navigation logic so canvas controls and keyboard shortcuts use the same tested helpers.
- Added the `npm test` command and GitHub Actions checks for tests, lint, and production build.
- Documented local validation commands in the README.
- Separated context hooks from provider modules and replaced effect-driven cursor state with render-synchronized state so lint checks can run cleanly.
- Made `CanvasCraftSB/package.json` the single version source for both the browser title and header label.

## Documentation setup — 2026-10-31

### Documentation

- Added [plan-of-action.md](./plan-of-action.md) with prioritized engineering improvements.
- Added [completePlan.md](./completePlan.md) with phases, acceptance criteria, and delivery guidance.
- Added this changelog to track future project changes.
