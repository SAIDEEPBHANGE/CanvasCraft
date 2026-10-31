import test from "node:test";
import assert from "node:assert/strict";
import {
  buildExportFilename,
  getExportBounds,
  getExportElements,
  getExportSize,
  MAX_EXPORT_DIMENSION,
  renderSceneToCanvas,
  renderSceneToSVG,
  sanitizeExportOptions,
} from "./exportScene.js";

const rect = {
  id: "r",
  type: "rectangle",
  x1: 10,
  y1: 20,
  x2: 110,
  y2: 70,
  strokeColor: "#000000",
  strokeWidth: 4,
  angle: 0,
  text: "Hi <b>",
};

test("bounds add padding and half the stroke width", () => {
  const b = getExportBounds([rect], 10);
  assert.deepEqual(b, { x: -2, y: 8, width: 124, height: 74 });
});

test("bounds are null for an empty board", () => {
  assert.equal(getExportBounds([]), null);
});

test("export uses the selection when present", () => {
  const other = { ...rect, id: "o" };
  assert.deepEqual(getExportElements([rect, other], ["o"]), [other]);
  assert.deepEqual(getExportElements([rect, other], []), [rect, other]);
  assert.deepEqual(getExportElements([rect, other], ["missing"]), [rect, other]);
});

test("size scales and flags oversized output", () => {
  const ok = getExportSize({ width: 100, height: 50 }, 2);
  assert.deepEqual(ok, { width: 200, height: 100, tooLarge: false });
  const big = getExportSize({ width: MAX_EXPORT_DIMENSION, height: 10 }, 2);
  assert.equal(big.tooLarge, true);
  const many = getExportSize({ width: 6000, height: 6000 }, 1);
  assert.equal(many.tooLarge, true);
});

test("filename is timestamped with the extension", () => {
  const name = buildExportFilename("svg", "board", new Date(2026, 0, 5, 9, 7));
  assert.equal(name, "board_2026-01-05_09-07.svg");
});

test("options fall back to defaults when invalid", () => {
  assert.deepEqual(sanitizeExportOptions(null), {
    background: true,
    darkMode: false,
    scale: 2,
  });
  assert.deepEqual(
    sanitizeExportOptions({ background: false, darkMode: true, scale: 5 }),
    { background: false, darkMode: true, scale: 2 },
  );
});

test("SVG covers every element type and escapes text", () => {
  const elements = [
    rect,
    { ...rect, id: "c", type: "circle", text: "" },
    { ...rect, id: "l", type: "line" },
    { ...rect, id: "a", type: "arrow", angle: 0.5 },
    {
      id: "p",
      type: "pencil",
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ],
      strokeColor: "#ef4444",
      strokeWidth: 2,
    },
    { ...rect, id: "s", type: "sticky", bgColor: "#fef08a" },
    { ...rect, id: "t", type: "text" },
  ];
  const svg = renderSceneToSVG({ elements });
  for (const tag of ["<rect", "<ellipse", "<path", "<text", "rotate("]) {
    assert.ok(svg.includes(tag), `missing ${tag}`);
  }
  assert.ok(svg.includes("Hi &lt;b&gt;"));
  assert.ok(!svg.includes("<b>"));
});

test("SVG respects background and dark-mode colors", () => {
  const light = renderSceneToSVG({ elements: [rect], background: true });
  const dark = renderSceneToSVG({
    elements: [rect],
    background: true,
    theme: "dark",
  });
  const none = renderSceneToSVG({ elements: [rect], background: false });
  assert.ok(light.includes("#fdfdfd"));
  assert.ok(dark.includes("#121212"));
  assert.ok(dark.includes("#f8fafc"));
  assert.ok(!none.includes("#fdfdfd"));
  assert.equal(renderSceneToSVG({ elements: [] }), null);
});

test("canvas render uses the scaled content size", () => {
  const calls = [];
  const ctx = new Proxy(
    {},
    {
      get: (_, key) => (...args) => calls.push([key, ...args]),
      set: () => true,
    },
  );
  const canvas = { getContext: () => ctx };
  const result = renderSceneToCanvas({
    elements: [{ ...rect, text: "" }],
    scale: 2,
    padding: 10,
    createCanvas: () => canvas,
  });
  assert.equal(result, canvas);
  assert.equal(canvas.width, 248);
  assert.equal(canvas.height, 148);
  assert.ok(calls.some(([name]) => name === "fillRect"));
});

test("canvas render refuses oversized or empty scenes", () => {
  assert.equal(renderSceneToCanvas({ elements: [] }), null);
  const huge = { ...rect, x2: 20000 };
  assert.equal(
    renderSceneToCanvas({ elements: [huge], createCanvas: () => ({}) }),
    null,
  );
});
