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

export const DEFAULT_COLORS = [
  "#000000",
  "#ef4444",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
];

export const ZOOM_CONFIG = {
  MIN: 0.1, // 10%
  MAX: 5.0, // 500%
  STEP: 0.1,
  DEFAULT: 1.0,
};

export const STROKE_CONFIG = {
  MIN_WIDTH: 1,
  MAX_WIDTH: 20,
  DEFAULT_WIDTH: 3,
  DEFAULT_COLOR: "#000000",
};
