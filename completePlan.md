# Complete Plan — Implemented Work

A record of what has been implemented. Remaining work lives in [plan-of-action.md](./plan-of-action.md); release notes are in [change-log.md](./change-log.md).

## v2.1.0 — Quality foundation

- Node test runner (`npm test`) with tests for coordinates and history.
- GitHub Actions workflow running tests, lint, and build.
- Shared `appendHistory` / `navigateHistory` helpers used by controls and shortcuts.
- Context hooks split from providers; lint is clean.
- App version defined once in `CanvasCraftSB/package.json` and shown in the header and page title.
- README "Development Checks" section.

## v2.2.0 — Reliability and theme colors

| Area | Implementation | Tests |
| :-- | :-- | :-- |
| Unique ids | `src/utils/id.js` (`createId`) used for all new elements | `id.test.js` |
| Safe persistence | `src/utils/persistence.js`: guarded read/write, `sanitizeElements`, `sanitizeViewport`, `sanitizePreferences`; context state loaded once | `persistence.test.js` |
| Save-failure notice | `StorageNotice` component driven by `storageError` in `CanvasContext` | via `writeJson` tests |
| History cap | `MAX_HISTORY_STEPS = 100` in `history.js` | `history.test.js` |
| Undoable layering | `src/utils/layering.js` + `commitElements` in the context | `layering.test.js` |
| Pointer capture | `setPointerCapture`, `onPointerCancel`, no `onPointerLeave` | manual |
| Pinch zoom | `src/utils/viewport.js` + touch pointer tracking in `WhiteBoard.jsx` | `viewport.test.js` |
| Theme-aware colors | `COLOR_PALETTE` and `CANVAS_BACKGROUND` in `constants.js`; `resolveColor` in `colors.js`; `renderElement(ctx, element, theme)`; themed swatches | `colors.test.js` (contrast checks) |
| Accessibility | ARIA labels/states, accessible shortcuts dialog, focus rings, reduced motion, Esc to deselect | manual |
| Theme storage | guarded `localStorage` and `matchMedia` in `ThemeContext.jsx` | manual |

Validation: `npm test` (37 passing), `npm run lint`, and `npm run build` all succeed; built title shows `CanvasCraft 2.2.0`.

## v2.3.0 — Multiple selection

| Area | Implementation | Tests |
| :-- | :-- | :-- |
| Selection state | `selectedIds` in `CanvasContext.jsx`; `selectedId` derived for single selection | via helpers |
| Selection helpers | `src/utils/selection.js`: `toggleId`, `getSelectionBounds`, `getElementsInRect`, `moveElements`, `scaleElements`, `rotateElements`, `resizeBox`, `applyStyle` | `selection.test.js` |
| Multi-layering | `reorderElements` in `layering.js` (order-preserving) | `layering.test.js` |
| Interaction | Shift+click, marquee, Ctrl/Cmd+A, group move/resize/rotate, multi-delete in `WhiteBoard.jsx` | manual |
| Style on selection | `changeStrokeColor`, `previewStrokeWidth`, `commitStrokeWidth` in the context; `PropertiesBar.jsx` | `selection.test.js` |
| Docs/UI | `ShortcutsModal.jsx` and README shortcut table | n/a |

Known limitation: scaling a rotated member of a group is approximate.

Validation: `npm test` (49 passing), `npm run lint`, and `npm run build` succeed; built title shows `CanvasCraft 2.3.0`.

## v2.4.0 — Export dialog

| Area | Implementation | Tests |
| :-- | :-- | :-- |
| Scene helpers | `src/utils/exportScene.js`: `getExportElements`, `getExportBounds`, `getExportSize` (size cap), `buildExportFilename`, `sanitizeExportOptions` | `exportScene.test.js` |
| PNG / preview | `renderSceneToCanvas` shared by preview, PNG, and clipboard | `exportScene.test.js` |
| SVG | `renderSceneToSVG` for every element type, escaped text, rotation | `exportScene.test.js` |
| Dialog | `RightHeaderComponents/ExportDialog.jsx`: background, dark mode, scale, preview, PNG/SVG/Copy, status messages, focus trap, Esc to close | manual |
| Preferences | last-used options stored under `exportOptions` via `readJson`/`writeJson` | `exportScene.test.js` |
| Header | Export button opens the dialog (`RightHeader.jsx`); old `export.js` removed | n/a |

Limits: max 8192px per side and 32M pixels total.

Validation: `npm test` (59 passing), `npm run lint`, and `npm run build` succeed; built title shows `CanvasCraft 2.4.0`. Not browser-tested: dialog layout, clipboard permission flow.

## v2.4.1 — SEO and Lighthouse fixes

| Area | Implementation |
| :-- | :-- |
| Metadata | `index.html`: description, robots, canonical, theme-color, Open Graph, Twitter, JSON-LD, no-JS fallback content |
| Crawler files | `public/robots.txt`, `sitemap.xml`, `llms.txt` |
| Assets | `public/favicon.svg`, `public/og-image.png` |
| Accessibility | viewport zoom allowed; slider `aria-label`; canvas wrapper `role="region"` |

Validation: tests (59), lint, and build pass; `dist` contains all the crawler files and the title shows 2.4.1. The site URL `https://canvascraftsb.netlify.app/` is hard-coded in the metadata and public files. Re-run Lighthouse after deploying to confirm scores.
