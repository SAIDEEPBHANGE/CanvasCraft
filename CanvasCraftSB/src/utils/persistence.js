import { normalizeHex } from "./colors.js";
import { STROKE_CONFIG, ZOOM_CONFIG } from "./constants.js";
import { createId } from "./id.js";

const ELEMENT_TYPES = new Set([
  "rectangle",
  "circle",
  "arrow",
  "line",
  "pencil",
  "text",
  "sticky",
]);

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export function readJson(key, fallback, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value, storage = globalThis.localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function isValidElement(element) {
  if (!element || typeof element !== "object") return false;
  if (!ELEMENT_TYPES.has(element.type)) return false;
  if (element.type === "pencil") {
    return (
      Array.isArray(element.points) &&
      element.points.length >= 2 &&
      element.points.every(
        (p) => p && isFiniteNumber(p.x) && isFiniteNumber(p.y),
      )
    );
  }
  if (!["x1", "y1", "x2", "y2"].every((key) => isFiniteNumber(element[key]))) {
    return false;
  }
  if (element.text !== undefined && typeof element.text !== "string") {
    return false;
  }
  return true;
}

export function sanitizeElements(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  for (const element of value) {
    if (!isValidElement(element)) continue;
    const hasUsableId =
      (typeof element.id === "string" || isFiniteNumber(element.id)) &&
      !seen.has(element.id);
    const id = hasUsableId ? element.id : createId();
    seen.add(id);
    result.push({
      ...element,
      id,
      angle: isFiniteNumber(element.angle) ? element.angle : 0,
      strokeWidth: isFiniteNumber(element.strokeWidth)
        ? element.strokeWidth
        : STROKE_CONFIG.DEFAULT_WIDTH,
    });
  }
  return result;
}

export function sanitizeViewport(value) {
  const zoom =
    value && isFiniteNumber(value.zoom)
      ? Math.min(ZOOM_CONFIG.MAX, Math.max(ZOOM_CONFIG.MIN, value.zoom))
      : ZOOM_CONFIG.DEFAULT;
  const pan = value?.panOffset;
  const panOffset =
    pan && isFiniteNumber(pan.x) && isFiniteNumber(pan.y)
      ? { x: pan.x, y: pan.y }
      : { x: 0, y: 0 };
  return { zoom, panOffset };
}

export function sanitizePreferences(value) {
  const color = normalizeHex(value?.strokeColor);
  const width = value?.strokeWidth;
  return {
    strokeColor: color ?? STROKE_CONFIG.DEFAULT_COLOR,
    strokeWidth: isFiniteNumber(width)
      ? Math.min(
          STROKE_CONFIG.MAX_WIDTH,
          Math.max(STROKE_CONFIG.MIN_WIDTH, width),
        )
      : STROKE_CONFIG.DEFAULT_WIDTH,
  };
}
