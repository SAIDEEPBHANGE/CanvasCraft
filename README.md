# CanvasCraft — Collaborative & Interactive Whiteboard

![CanvasCraft Light Desktop](/Versions/V02/V02-CanvasCraft-Light-lg.png)
![CanvasCraft Dark Desktop](/Versions/V02/V02-CanvasCraft-Dark-lg.png)

## Overview

**CanvasCraft** is a high-performance, browser-based digital whiteboard designed for real-time creativity, note-taking, and visual brainstorming. Built entirely with Vanilla JavaScript and Vite without heavy external frameworks, CanvasCraft features custom HTML5 Canvas rendering, infinite pan and zoom capabilities, local state auto-persistence, customizable shape generation, dynamic text/sticky notes, and full dark/light theme adaptability.

---

## Key Features

- **Custom Canvas Rendering Engine:** High-DPI / Retina screen auto-scaling to keep strokes, shapes, and textures crisp across all display resolutions.
- **Infinite Workspace (Pan & Zoom):** Fluid canvas transformations supporting mouse-wheel zooming (10% to 500%), smooth drag panning, and footer view controls.
- **Rich Drawing & Shape Tools:** Freehand pencil, eraser, rectangle, circle, straight line, and directional arrow tools with stroke-width and custom hex color support.
- **Interactive Text & Sticky Notes:** Live-rendered dynamic text fields and post-it style sticky notes with multi-line enter-key handling.
- **Selection & Object Manipulation:** Move and resize shapes or drawings dynamically with visual bounding boxes and corner handle dragging.
- **Undo/Redo State History:** Deep action recording stack enabling full undo/redo control via header actions or keyboard shortcuts.
- **Local Auto-Persistence:** Complete state auto-saving to `localStorage` to ensure artwork is restored across browser refreshes.
- **Dark / Light Theme Engine:** Dynamic theme switcher updating UI panels, iconography (Lucide), and canvas background contrast.
- **Keyboard Navigation & Accessibility:** Power-user hotkeys for swift tool swapping (<kbd>V</kbd>, <kbd>P</kbd>, <kbd>E</kbd>, <kbd>H</kbd>, <kbd>R</kbd>, <kbd>C</kbd>, <kbd>T</kbd>, <kbd>S</kbd>) and quick element deletion (<kbd>Delete</kbd> / <kbd>Backspace</kbd>).
- **Export Capability:** One-click PNG export with auto-generated timestamps for sharing whiteboards offline.

---

## Skills Demonstrated

- **Canvas API & Mathematics:** Hand-written coordinate space transformations (`screenToCanvasCoords`), bounding box detection, high-DPI scaling (`devicePixelRatio`), and geometric rendering logic.
- **Framework-Less State Management:** Custom unidirectional state architecture, undo/redo state stacks, and browser `localStorage` synchronization without third-party libraries.
- **Complex Event Handling:** Global DOM keyboard shortcut listening, multi-touch/mouse canvas dragging, active handle detection, and mouse-wheel delta tracking.
- **Modular JavaScript Architecture:** Clean ES module division split into dedicated modules for state management, history tracking, canvas logic, UI controls, and spatial utilities.
- **Responsive & Adaptive UI:** Glassmorphism floating toolbars, mobile-first responsive bottom dock layouts, CSS variable theme toggling, and clean CSS styling.

---

## Why This Project Matters

CanvasCraft demonstrates the ability to architect complex, highly interactive web applications from scratch without leaning on heavy canvas abstractions (like Fabric.js or Konva) or UI frameworks. It highlights deep mastery of low-level web APIs, performance optimization techniques, coordinate geometry, and scalable vanilla JavaScript software design expected in senior frontend and product engineering roles.

---

## What Else Can Be Added for Frontend Excellence?

While CanvasCraft is already a standout portfolio project, here are 3 features you can implement next to take it even further:

1. **WebSockets for Multi-User Collaboration:** Connect a Node.js/Socket.io backend to stream drawing events (`mousemove`, shape placement) in real-time between multiple open client tabs.
2. **Layer Management Panel:** A floating panel allowing users to bring elements forward, send them backward, lock elements, or toggle layer visibility.
3. **Rough.js / Hand-Drawn Aesthetics:** Integrating a lightweight sketching library like Rough.js to give drawn shapes an architectural, hand-drawn look (similar to Excalidraw).
