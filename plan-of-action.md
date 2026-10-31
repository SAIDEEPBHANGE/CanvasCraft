# Plan of Action

## Status

- **Done (v2.1.0):** Node tests for coordinates and history, `npm test`, GitHub Actions (test, lint, build), shared undo/redo helpers, lint fixes, single-source app version.
- **Done (v2.2.0, v2.3.0, v2.4.0):** see [change-log.md](./change-log.md) and [completePlan.md](./completePlan.md).
- **Still to do outside the code:** enable branch protection so CI checks are required before merging.

## Requested features (reference: Excalidraw)

Reviewed [excalidraw.com](https://excalidraw.com) and its [export API docs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export) for behavior worth matching. CanvasCraft should borrow the ideas, not the code or branding.

Theme-aware colors (section A) shipped in v2.2.0; multiple selection (section B) in v2.3.0; the export dialog (section C) in v2.4.0.

### D. Other Excalidraw ideas worth considering (lower priority)

- Shift-constrained drawing (perfect squares, circles, and 45° lines) and Alt/Option-drag to duplicate.
- Arrow keys to nudge the selection, and Ctrl+D to duplicate.
- Copy/paste elements, and align/distribute for multiple selections.
- Lock elements and a "view mode" for presenting.
- Save/open board files (`.canvascraft` JSON) and drag-and-drop to import.
- Command palette or searchable tool menu, and a hand-drawn stroke style option.

## Suggested code improvements

Items are ordered by value versus risk. Each was found by inspecting the current code.

### 1. Fix correctness issues

- **PNG export only captures the visible viewport**, clipped to the screen at the current zoom and pan. Export the bounding box of all elements; see section C for the full export dialog.

### 2. Expand tests where bugs are most likely

- Add tests for `src/utils/drawing.js`: element bounds, hit testing, resize handles, and rotation geometry.
- Add tests for export bounding-box logic.
- Add a small set of component tests (Vitest + React Testing Library) for tool switching, undo/redo buttons, and keyboard shortcuts.
- Add an end-to-end smoke test (Playwright): draw a shape, undo, reload, and confirm persistence.
- Add an `npm run test:coverage` script and track coverage in CI without chasing a number.

### 3. Split up `WhiteBoard.jsx` (about 1,000 lines)

Refactor one piece at a time, only after the tests above protect behavior:

- `useCanvasRenderer` — redraw loop and resize/DPI handling.
- `useKeyboardShortcuts` — the global key handler, driven by a key-to-tool mapping table. This removes the repeated `case` blocks and lets `ShortcutsModal.jsx` and the README table share one mapping.
- `usePointerInteractions` — pointer down/move/up for drawing, moving, resizing, rotating, and panning.
- `TextEditorOverlay` — the in-canvas textarea for text and sticky notes.
- Move pure geometry (resize and rotation math) into `src/utils` so it can be unit tested.

### 4. Performance

- Batch redraws with `requestAnimationFrame` and skip redundant redraws during pointer moves.
- Large boards redraw every element each frame. Skip elements outside the viewport and consider caching committed elements to an offscreen canvas.
- Replace the separate `elements`, `history`, and `historyStep` states with one reducer (`useReducer`) so edits and history cannot get out of sync; this also keeps `commitToHistory` stable so the keyboard effect does not re-subscribe on every history change.

### 5. Accessibility and touch

- Add `aria-label` and tooltips to `ZoomFunctions.jsx` buttons.
- Verify touch behavior and pinch zoom on real mobile devices, and confirm both themes visually.

### 6. Tooling, types, and project hygiene

- Add JSDoc types (`// @ts-check`) or migrate shared modules to TypeScript gradually, starting with `constants`, `coordinates`, `history`, and element shapes.
- Add Prettier and a `format:check` step in CI.
- Add Dependabot for npm and GitHub Actions updates.
- Add `.editorconfig` and `.gitattributes` line-ending rules; Git currently warns about LF/CRLF on every diff.
- Add contributor docs (how to run checks) and a PR template.
- Add security headers for the Netlify deployment (CSP, `X-Content-Type-Options`, `Referrer-Policy`).
- Add a short release checklist: bump `package.json`, update `change-log.md`, update `completePlan.md`.

### 7. Product features (decisions, not defaults)

- Export / import board as JSON so users can back up and share boards without a backend.
- Multiple boards or named save slots before any cloud work.
- Decide on accounts, cloud saves, and real-time collaboration only after requirements are defined (access control, sync, conflict handling, retention).
- Add error monitoring or analytics only with a documented privacy position.

## Suggested next milestones

**Next:** pick from section D or the code improvements below (for example splitting up `WhiteBoard.jsx`, which is now about 1,000 lines).

For each milestone, record completed items in `change-log.md` and `completePlan.md`, and bump the version in `package.json`.

## Working principles

- Confirm findings against the current code before starting related work.
- Preserve existing behavior unless a change is intentional and documented.
- Make changes in small, reviewable steps and run tests, lint, and build after each step.
- Update this plan and [completePlan.md](./completePlan.md) as priorities change, and log changes in [change-log.md](./change-log.md).
