import { getElementBounds } from "./drawing.js";

const GROUP_ID = "__group__";

function getCorners(element) {
  const b = getElementBounds(element);
  const angle = element.angle || 0;
  const corners = [
    { x: b.x, y: b.y },
    { x: b.x + b.width, y: b.y },
    { x: b.x + b.width, y: b.y + b.height },
    { x: b.x, y: b.y + b.height },
  ];
  if (!angle) return corners;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return corners.map(({ x, y }) => ({
    x: b.cx + (x - b.cx) * cos - (y - b.cy) * sin,
    y: b.cy + (x - b.cx) * sin + (y - b.cy) * cos,
  }));
}

function getRotatedBox(element) {
  const corners = getCorners(element);
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  return {
    x1: Math.min(...xs),
    y1: Math.min(...ys),
    x2: Math.max(...xs),
    y2: Math.max(...ys),
  };
}

export function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

/** Axis-aligned box around all selected elements, including their rotation. */
export function getSelectionBounds(elements, ids) {
  const selected = new Set(ids);
  const boxes = elements.filter((el) => selected.has(el.id)).map(getRotatedBox);
  if (boxes.length === 0) return null;
  return {
    x1: Math.min(...boxes.map((b) => b.x1)),
    y1: Math.min(...boxes.map((b) => b.y1)),
    x2: Math.max(...boxes.map((b) => b.x2)),
    y2: Math.max(...boxes.map((b) => b.y2)),
  };
}

/** A rectangle-shaped stand-in so a group can reuse single-element handles. */
export function getGroupElement(elements, ids) {
  const box = getSelectionBounds(elements, ids);
  return box ? { id: GROUP_ID, type: "rectangle", angle: 0, ...box } : null;
}

export function getElementsInRect(elements, rect) {
  const minX = Math.min(rect.x1, rect.x2);
  const maxX = Math.max(rect.x1, rect.x2);
  const minY = Math.min(rect.y1, rect.y2);
  const maxY = Math.max(rect.y1, rect.y2);
  return elements
    .filter((el) => {
      const box = getRotatedBox(el);
      return (
        box.x1 <= maxX && box.x2 >= minX && box.y1 <= maxY && box.y2 >= minY
      );
    })
    .map((el) => el.id);
}

function translateElement(element, dx, dy) {
  if (element.type === "pencil") {
    return {
      ...element,
      points: element.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
    };
  }
  return {
    ...element,
    x1: element.x1 + dx,
    y1: element.y1 + dy,
    x2: element.x2 + dx,
    y2: element.y2 + dy,
  };
}

function mapSelected(elements, ids, transform) {
  const selected = new Set(ids);
  return elements.map((el) => (selected.has(el.id) ? transform(el) : el));
}

export function moveElements(elements, ids, dx, dy) {
  if (ids.length === 0 || (dx === 0 && dy === 0)) return elements;
  return mapSelected(elements, ids, (el) => translateElement(el, dx, dy));
}

/** Scales the selected elements so `from` becomes `to`. */
export function scaleElements(elements, ids, from, to) {
  const fromWidth = from.x2 - from.x1;
  const fromHeight = from.y2 - from.y1;
  const sx = fromWidth > 0 ? (to.x2 - to.x1) / fromWidth : 1;
  const sy = fromHeight > 0 ? (to.y2 - to.y1) / fromHeight : 1;
  const mapX = (x) => to.x1 + (x - from.x1) * sx;
  const mapY = (y) => to.y1 + (y - from.y1) * sy;

  return mapSelected(elements, ids, (el) => {
    if (el.type === "pencil") {
      return {
        ...el,
        points: el.points.map((p) => ({ x: mapX(p.x), y: mapY(p.y) })),
      };
    }
    if (!el.angle) {
      return { ...el, x1: mapX(el.x1), y1: mapY(el.y1), x2: mapX(el.x2), y2: mapY(el.y2) };
    }
    // Rotated elements keep their angle: move the center and scale the local size.
    const cx = mapX((el.x1 + el.x2) / 2);
    const cy = mapY((el.y1 + el.y2) / 2);
    const halfW = (Math.abs(el.x2 - el.x1) * Math.abs(sx)) / 2;
    const halfH = (Math.abs(el.y2 - el.y1) * Math.abs(sy)) / 2;
    return { ...el, x1: cx - halfW, y1: cy - halfH, x2: cx + halfW, y2: cy + halfH };
  });
}

/** Rotates the selected elements around `center` by `delta` radians. */
export function rotateElements(elements, ids, center, delta) {
  if (ids.length === 0 || delta === 0) return elements;
  const cos = Math.cos(delta);
  const sin = Math.sin(delta);
  return mapSelected(elements, ids, (el) => {
    const b = getElementBounds(el);
    const dx = b.cx - center.x;
    const dy = b.cy - center.y;
    const rotated = translateElement(
      el,
      center.x + dx * cos - dy * sin - b.cx,
      center.y + dx * sin + dy * cos - b.cy,
    );
    return { ...rotated, angle: (el.angle || 0) + delta };
  });
}

/** Moves a resize handle by (dx, dy); returns the original box if it would get too small. */
export function resizeBox(box, handle, dx, dy, minSize = 20) {
  const next = { ...box };
  if (handle.includes("e")) next.x2 += dx;
  if (handle.includes("w")) next.x1 += dx;
  if (handle.includes("s")) next.y2 += dy;
  if (handle.includes("n")) next.y1 += dy;
  if (next.x2 - next.x1 < minSize || next.y2 - next.y1 < minSize) return box;
  return next;
}

/** Applies color / stroke width to the selection; stickies keep their own look. */
export function applyStyle(elements, ids, style) {
  const selected = new Set(ids);
  let changed = false;
  const result = elements.map((el) => {
    if (!selected.has(el.id) || el.type === "sticky") return el;
    const next = { ...el };
    if (style.strokeColor !== undefined && el.strokeColor !== style.strokeColor) {
      next.strokeColor = style.strokeColor;
      changed = true;
    }
    if (
      style.strokeWidth !== undefined &&
      el.type !== "text" &&
      el.strokeWidth !== style.strokeWidth
    ) {
      next.strokeWidth = style.strokeWidth;
      changed = true;
    }
    return next;
  });
  return changed ? result : elements;
}
