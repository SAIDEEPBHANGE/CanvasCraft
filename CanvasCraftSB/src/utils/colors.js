import { CANVAS_BACKGROUND, COLOR_PALETTE } from "./constants.js";

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(color) {
  if (typeof color !== "string" || !HEX_PATTERN.test(color)) return null;
  const hex = color.toLowerCase();
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function hslToRgb({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const sectors = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = sectors[Math.floor(h / 60) % 6];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rl, gl, bl] = [r, g, b].map((channel) => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function getContrastRatio(colorA, colorB) {
  const a = normalizeHex(colorA);
  const b = normalizeHex(colorB);
  if (!a || !b) throw new TypeError("Contrast requires valid hex colors");
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function adjustForBackground(hex, background, minContrast, direction) {
  if (getContrastRatio(hex, background) >= minContrast) return hex;
  const hsl = rgbToHsl(hexToRgb(hex));
  const step = direction === "lighten" ? 0.02 : -0.02;
  let { l } = hsl;
  let candidate = hex;
  while (
    l > 0 &&
    l < 1 &&
    getContrastRatio(candidate, background) < minContrast
  ) {
    l = Math.min(1, Math.max(0, l + step));
    candidate = rgbToHex(hslToRgb({ ...hsl, l }));
  }
  return candidate;
}

/**
 * Returns the color to display for a stored (light-mode) color in the given theme.
 * Palette colors use their hand-picked variants; other colors are adjusted only
 * as far as needed to stay readable against the canvas background.
 */
export function resolveColor(color, theme = "light", minContrast = 3) {
  const hex = normalizeHex(color);
  if (!hex) return color;

  const entry = COLOR_PALETTE.find(
    (item) => item.light === hex || item.aliases.includes(hex),
  );
  if (entry) return theme === "dark" ? entry.dark : entry.light;

  return theme === "dark"
    ? adjustForBackground(hex, CANVAS_BACKGROUND.dark, minContrast, "lighten")
    : adjustForBackground(hex, CANVAS_BACKGROUND.light, minContrast, "darken");
}
