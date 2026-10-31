import assert from "node:assert/strict";
import test from "node:test";
import {
  applyStyle,
  getElementsInRect,
  getGroupElement,
  getSelectionBounds,
  moveElements,
  resizeBox,
  rotateElements,
  scaleElements,
  toggleId,
} from "./selection.js";

const rect = (id, x1, y1, x2, y2, extra = {}) => ({
  id,
  type: "rectangle",
  x1,
  y1,
  x2,
  y2,
  strokeColor: "#000000",
  strokeWidth: 3,
  ...extra,
});
const stroke = {
  id: "p",
  type: "pencil",
  points: [
    { x: 0, y: 0 },
    { x: 20, y: 40 },
  ],
};
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} !~ ${b}`);

test("toggleId adds and removes ids", () => {
  assert.deepEqual(toggleId(["a"], "b"), ["a", "b"]);
  assert.deepEqual(toggleId(["a", "b"], "a"), ["b"]);
});

test("selection bounds cover every selected element", () => {
  const els = [rect("a", 0, 0, 10, 10), rect("b", 50, 20, 80, 60), stroke];
  assert.deepEqual(getSelectionBounds(els, ["a", "b"]), {
    x1: 0,
    y1: 0,
    x2: 80,
    y2: 60,
  });
  assert.equal(getSelectionBounds(els, []), null);
  assert.equal(getGroupElement(els, ["a", "b"]).type, "rectangle");
});

test("selection bounds account for rotation", () => {
  const box = getSelectionBounds(
    [rect("a", 0, 0, 100, 20, { angle: Math.PI / 2 })],
    ["a"],
  );
  close(box.x2 - box.x1, 20);
  close(box.y2 - box.y1, 100);
});

test("marquee selects elements that intersect the rectangle", () => {
  const els = [rect("a", 0, 0, 10, 10), rect("b", 100, 100, 120, 120)];
  assert.deepEqual(
    getElementsInRect(els, { x1: 50, y1: 50, x2: -5, y2: -5 }),
    ["a"],
  );
  assert.deepEqual(getElementsInRect(els, { x1: 200, y1: 200, x2: 300, y2: 300 }), []);
});

test("moveElements moves only selected elements, pencil points included", () => {
  const els = [rect("a", 0, 0, 10, 10), rect("b", 5, 5, 15, 15), stroke];
  const moved = moveElements(els, ["a", "p"], 3, 4);
  assert.equal(moved[0].x1, 3);
  assert.equal(moved[1], els[1]);
  assert.deepEqual(moved[2].points[1], { x: 23, y: 44 });
  assert.equal(moveElements(els, ["a"], 0, 0), els);
});

test("scaleElements stretches the group relative to its box", () => {
  const els = [rect("a", 0, 0, 10, 10), rect("b", 10, 10, 20, 20)];
  const scaled = scaleElements(
    els,
    ["a", "b"],
    { x1: 0, y1: 0, x2: 20, y2: 20 },
    { x1: 0, y1: 0, x2: 40, y2: 20 },
  );
  assert.deepEqual([scaled[1].x1, scaled[1].x2, scaled[1].y1, scaled[1].y2], [20, 40, 10, 20]);
});

test("scaleElements keeps the angle of rotated elements", () => {
  const els = [rect("a", 0, 0, 10, 10, { angle: 1 })];
  const [scaled] = scaleElements(
    els,
    ["a"],
    { x1: 0, y1: 0, x2: 10, y2: 10 },
    { x1: 0, y1: 0, x2: 20, y2: 20 },
  );
  assert.equal(scaled.angle, 1);
  close(scaled.x2 - scaled.x1, 20);
});

test("rotateElements orbits elements around the group center", () => {
  const els = [rect("a", 0, 0, 10, 10), rect("b", 20, 0, 30, 10)];
  const [a, b] = rotateElements(els, ["a", "b"], { x: 15, y: 5 }, Math.PI);
  close(a.x1, 20);
  close(a.y1, 0);
  close(b.x1, 0);
  close(a.angle, Math.PI);
  close(b.angle, Math.PI);
});

test("resizeBox moves handles and refuses to collapse", () => {
  const box = { x1: 0, y1: 0, x2: 100, y2: 100 };
  assert.deepEqual(resizeBox(box, "se", 10, 20), { x1: 0, y1: 0, x2: 110, y2: 120 });
  assert.deepEqual(resizeBox(box, "nw", 10, 10), { x1: 10, y1: 10, x2: 100, y2: 100 });
  assert.equal(resizeBox(box, "e", -95, 0), box);
});

test("applyStyle updates the selection and skips stickies", () => {
  const els = [
    rect("a", 0, 0, 1, 1),
    rect("s", 0, 0, 1, 1, { type: "sticky", strokeColor: "#facc15" }),
    rect("c", 0, 0, 1, 1),
  ];
  const result = applyStyle(els, ["a", "s"], { strokeColor: "#ef4444", strokeWidth: 5 });
  assert.equal(result[0].strokeColor, "#ef4444");
  assert.equal(result[0].strokeWidth, 5);
  assert.equal(result[1], els[1]);
  assert.equal(result[2], els[2]);
  assert.equal(applyStyle(els, ["a"], { strokeColor: "#000000" }), els);
});
