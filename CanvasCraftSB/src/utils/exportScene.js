import { getElementBounds, renderElement } from "./drawing.js";
import { resolveColor } from "./colors.js";
import { CANVAS_BACKGROUND } from "./constants.js";
import { getSelectionBounds } from "./selection.js";

export const EXPORT_SCALES = [1, 2, 3];
export const DEFAULT_EXPORT_OPTIONS = {
  background: true,
  darkMode: false,
  scale: 2,
};
export const DEFAULT_EXPORT_PADDING = 16;
export const MAX_EXPORT_DIMENSION = 8192;
export const MAX_EXPORT_PIXELS = 32_000_000;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const round = (n) => Math.round(n * 100) / 100;

/** Validates stored export options, falling back to defaults per field. */
export function sanitizeExportOptions(value) {
  const base = { ...DEFAULT_EXPORT_OPTIONS };
  if (!value || typeof value !== "object") return base;
  if (typeof value.background === "boolean") base.background = value.background;
  if (typeof value.darkMode === "boolean") base.darkMode = value.darkMode;
  if (EXPORT_SCALES.includes(value.scale)) base.scale = value.scale;
  return base;
}

/** Elements to export: the selection when there is one, otherwise everything. */
export function getExportElements(elements, selectedIds = []) {
  if (selectedIds.length === 0) return elements;
  const selected = new Set(selectedIds);
  const subset = elements.filter((el) => selected.has(el.id));
  return subset.length > 0 ? subset : elements;
}

/** Content box (scene coordinates) with padding and half the widest stroke. */
export function getExportBounds(elements, padding = DEFAULT_EXPORT_PADDING) {
  if (!elements || elements.length === 0) return null;
  const box = getSelectionBounds(
    elements,
    elements.map((el) => el.id),
  );
  if (!box) return null;
  const maxStroke = Math.max(...elements.map((el) => el.strokeWidth || 2));
  const margin = padding + maxStroke / 2;
  return {
    x: box.x1 - margin,
    y: box.y1 - margin,
    width: box.x2 - box.x1 + margin * 2,
    height: box.y2 - box.y1 + margin * 2,
  };
}

/** Output pixel size for a scale, flagging boards that exceed the size cap. */
export function getExportSize(bounds, scale) {
  const width = Math.max(1, Math.ceil(bounds.width * scale));
  const height = Math.max(1, Math.ceil(bounds.height * scale));
  const tooLarge =
    width > MAX_EXPORT_DIMENSION ||
    height > MAX_EXPORT_DIMENSION ||
    width * height > MAX_EXPORT_PIXELS;
  return { width, height, tooLarge };
}

export function buildExportFilename(
  extension,
  baseName = "canvascraft",
  date = new Date(),
) {
  const pad = (n) => String(n).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}-${pad(date.getMinutes())}`;
  return `${baseName}_${day}_${time}.${extension}`;
}

/** Draws the scene cropped to its content onto a new canvas. */
export function renderSceneToCanvas({
  elements,
  theme = "light",
  background = true,
  scale = 2,
  padding = DEFAULT_EXPORT_PADDING,
  createCanvas = () => document.createElement("canvas"),
}) {
  const bounds = getExportBounds(elements, padding);
  if (!bounds) return null;
  const { width, height, tooLarge } = getExportSize(bounds, scale);
  if (tooLarge) return null;
  const canvas = createCanvas();
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (background) {
    ctx.fillStyle = CANVAS_BACKGROUND[theme];
    ctx.fillRect(0, 0, width, height);
  }
  ctx.scale(width / bounds.width, height / bounds.height);
  ctx.translate(-bounds.x, -bounds.y);
  elements.forEach((el) => renderElement(ctx, el, theme));
  return canvas;
}

function wrapLines(text) {
  return String(text).split("\n");
}

function svgText(lines, { x, y, lineHeight, size, anchor, fill, baseline }) {
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${round(x)}" y="${round(y + i * lineHeight)}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  return `<text font-family="Inter, sans-serif" font-size="${size}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="${baseline}">${tspans}</text>`;
}

function shapeText(element, bounds, theme) {
  if (!element.text) return "";
  const lines = wrapLines(element.text);
  const lineHeight = 20;
  const startY = bounds.cy - (lines.length * lineHeight) / 2 + lineHeight / 2;
  return svgText(lines, {
    x: bounds.cx,
    y: startY,
    lineHeight,
    size: 15,
    anchor: "middle",
    baseline: "middle",
    fill: resolveColor(element.strokeColor || "#000000", theme, 4.5),
  });
}

function arrowHeadPath(x1, y1, x2, y2, head = 14) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a = angle - Math.PI / 6;
  const b = angle + Math.PI / 6;
  return `M${round(x2)} ${round(y2)}L${round(x2 - head * Math.cos(a))} ${round(y2 - head * Math.sin(a))}M${round(x2)} ${round(y2)}L${round(x2 - head * Math.cos(b))} ${round(y2 - head * Math.sin(b))}`;
}

function elementToSvg(element, theme) {
  const bounds = getElementBounds(element);
  const stroke = resolveColor(element.strokeColor || "#000000", theme);
  const width = element.strokeWidth || 2;
  const strokeAttrs = `fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
  let inner;

  switch (element.type) {
    case "pencil": {
      if (!element.points || element.points.length < 2) return "";
      const d = element.points
        .map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`)
        .join("");
      inner = `<path d="${d}" ${strokeAttrs}/>`;
      break;
    }
    case "rectangle":
      inner =
        `<rect x="${round(bounds.x)}" y="${round(bounds.y)}" width="${round(bounds.width)}" height="${round(bounds.height)}" ${strokeAttrs}/>` +
        shapeText(element, bounds, theme);
      break;
    case "circle":
      inner =
        `<ellipse cx="${round(bounds.cx)}" cy="${round(bounds.cy)}" rx="${round(bounds.width / 2)}" ry="${round(bounds.height / 2)}" ${strokeAttrs}/>` +
        shapeText(element, bounds, theme);
      break;
    case "line":
      inner = `<path d="M${round(element.x1)} ${round(element.y1)}L${round(element.x2)} ${round(element.y2)}" ${strokeAttrs}/>`;
      break;
    case "arrow":
      inner = `<path d="M${round(element.x1)} ${round(element.y1)}L${round(element.x2)} ${round(element.y2)}${arrowHeadPath(element.x1, element.y1, element.x2, element.y2)}" ${strokeAttrs}/>`;
      break;
    case "sticky": {
      inner = `<rect x="${round(bounds.x)}" y="${round(bounds.y)}" width="${round(bounds.width)}" height="${round(bounds.height)}" rx="6" fill="${escapeXml(element.bgColor || "#fef08a")}" stroke="${escapeXml(element.strokeColor || "#eab308")}" stroke-width="1.5"/>`;
      if (element.text) {
        inner += svgText(wrapLines(element.text), {
          x: bounds.x + 12,
          y: bounds.y + 12,
          lineHeight: 18,
          size: 14,
          anchor: "start",
          baseline: "hanging",
          fill: "#1e293b",
        });
      }
      break;
    }
    case "text": {
      if (!element.text) return "";
      inner = svgText(wrapLines(element.text), {
        x: bounds.x + 4,
        y: bounds.y + 4,
        lineHeight: 22,
        size: 18,
        anchor: "start",
        baseline: "hanging",
        fill: resolveColor(element.strokeColor || "#000000", theme, 4.5),
      });
      break;
    }
    default:
      return "";
  }

  const angle = element.angle || 0;
  if (!angle) return inner;
  const degrees = round((angle * 180) / Math.PI);
  return `<g transform="rotate(${degrees} ${round(bounds.cx)} ${round(bounds.cy)})">${inner}</g>`;
}

/** Builds a standalone SVG document from the elements (vector, not a bitmap). */
export function renderSceneToSVG({
  elements,
  theme = "light",
  background = true,
  scale = 1,
  padding = DEFAULT_EXPORT_PADDING,
}) {
  const bounds = getExportBounds(elements, padding);
  if (!bounds) return null;
  const w = round(bounds.width);
  const h = round(bounds.height);
  const body = elements
    .map((el) => elementToSvg(el, theme))
    .filter(Boolean)
    .join("");
  const bg = background
    ? `<rect x="${round(bounds.x)}" y="${round(bounds.y)}" width="${w}" height="${h}" fill="${CANVAS_BACKGROUND[theme]}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(w * scale)}" height="${round(h * scale)}" viewBox="${round(bounds.x)} ${round(bounds.y)} ${w} ${h}">${bg}${body}</svg>`;
}
