export const TOOLS = {
  SELECT: "select",
  PAN: "pan",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ARROW: "arrow",
  LINE: "line",
  PENCIL: "pencil",
  TEXT: "text",
  STICKY: "sticky",
  ERASER: "eraser",
};
// Stored colors are the light-mode values; `dark` is what is shown in dark mode.
export const COLOR_PALETTE = [
  { light: "#000000", dark: "#f8fafc", aliases: [] },
  { light: "#ef4444", dark: "#f87171", aliases: [] },
  { light: "#059669", dark: "#34d399", aliases: ["#10b981"] },
  { light: "#3b82f6", dark: "#60a5fa", aliases: [] },
  { light: "#8b5cf6", dark: "#a78bfa", aliases: [] },
];
export const DEFAULT_COLORS = COLOR_PALETTE.map((entry) => entry.light);
export const CANVAS_BACKGROUND = {
  light: "#fdfdfd",
  dark: "#121212",
};
export const ZOOM_CONFIG = {
  MIN: 0.1,
  MAX: 5.0,
  STEP: 0.1,
  DEFAULT: 1.0,
};
export const STROKE_CONFIG = {
  MIN_WIDTH: 1,
  MAX_WIDTH: 20,
  DEFAULT_WIDTH: 3,
  DEFAULT_COLOR: "#000000",
};
