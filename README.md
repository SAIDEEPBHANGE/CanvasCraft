# CanvasCraft — Collaborative & Interactive Whiteboard

[CanvasCraft Web Link](https://canvascraftsb.netlify.app/)

![CanvasCraft Light Desktop](/Versions/V02/V02-CanvasCraft-Light-lg.png)
![CanvasCraft Dark Desktop](/Versions/V02/V02-CanvasCraft-Dark-lg.png)

## Overview

**CanvasCraft** is a high-performance, browser-based interactive whiteboard designed for digital sketching, visual brainstorming, and dynamic diagramming. Built with **React**, **Tailwind CSS**, and the **HTML5 2D Canvas API**, CanvasCraft features custom coordinate projection math, cursor-targeted mouse wheel zooming, responsive HUD panels, 8-point interactive object resizing, centered shape text, and debounced local storage state persistence.

## Key Features

- **Direct HTML5 Canvas Engine:** High-DPI / Retina display auto-scaling utilizing `devicePixelRatio` to keep lines, shapes, and textures crisp across all display densities.
- **Infinite Workspace (Pan & Zoom):** Viewport camera controls supporting cursor-anchored mouse wheel and trackpad zooming (10% to 500%), smooth hand panning, and HUD zoom buttons.
- **Vector & Geometric Primitives:** Freehand pencil, rectangle, circle, line, directional arrow, and a non-destructive layer-targeted eraser.
- **Interactive Text & Sticky Notes:** Live floating text inputs, post-it sticky cards with automatic text wrapping, and centered double-click text embedding inside any shape.
- **Advanced Object Manipulation:** 8-point interactive resizing handles (`nw`, `ne`, `se`, `sw`, `n`, `s`, `e`, `w`) and smooth radial rotation handles that preserve geometry.
- **Z-Index Layer Management:** Element stacking order controls with Bring Forward and Send Backward capabilities.
- **State History & Undo/Redo:** Action tracking stacks supporting unlimited undo/redo traversals through UI actions or keyboard hotkeys.
- **Debounced Local Persistence:** Automatic state synchronization to browser `localStorage` ensuring whiteboards restore reliably without frame drops.
- **Dark & Light Mode:** Theme switcher adjusting floating toolbar glassmorphism styles, canvas dot grids, and stroke contrast.
- **Global Keyboard Hotkeys:** Single-key tool swapping (<kbd>V</kbd>, <kbd>H</kbd>, <kbd>R</kbd>, <kbd>C</kbd>, <kbd>A</kbd>, <kbd>L</kbd>, <kbd>P</kbd>, <kbd>T</kbd>, <kbd>S</kbd>, <kbd>E</kbd>), selected object removal (<kbd>Delete</kbd> / <kbd>Backspace</kbd>), and history navigation (<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd>).
- **Timestamped PNG Export:** Clean, off-screen rendered PNG file downloads with auto-generated timestamps (`canvascraft_YYYY-MM-DD_HH-MM.png`).

---

## Architecture & Tech Stack

- **Framework:** React 19 (Hooks, Context API, Ref memoization)
- **Styling & HUD:** Tailwind CSS (v4) with responsive utility scaffolding
- **Rendering:** HTML5 Canvas 2D Context API with custom matrix transformations
- **Icons:** Lucide React
- **Storage:** Web Storage API (`localStorage`) with debounced I/O queues

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>V</kbd> or <kbd>1</kbd> | Selection Tool |
| <kbd>H</kbd> | Pan (Hand) Tool |
| <kbd>R</kbd> or <kbd>2</kbd> | Rectangle Tool |
| <kbd>C</kbd> or <kbd>3</kbd> | Circle Tool |
| <kbd>A</kbd> or <kbd>4</kbd> | Arrow Tool |
| <kbd>L</kbd> or <kbd>5</kbd> | Line Tool |
| <kbd>P</kbd> or <kbd>6</kbd> | Pencil (Freehand) Tool |
| <kbd>T</kbd> or <kbd>7</kbd> | Text Tool |
| <kbd>S</kbd> or <kbd>8</kbd> | Sticky Note Tool |
| <kbd>E</kbd> or <kbd>9</kbd> | Eraser Tool |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete Selected Shape |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Ctrl+Shift+Z</kbd> | Redo |
| <kbd>Mouse Wheel</kbd> / <kbd>Pinch</kbd> | Cursor-Centered Zoom |