import assert from "node:assert/strict";
import test from "node:test";
import {
  getCanvasCoordinates,
  getTouchCenter,
  getTouchDistance,
} from "./coordinates.js";

const canvas = {
  getBoundingClientRect: () => ({ left: 10, top: 20 }),
};

test("converts pointer coordinates to canvas space with zoom and pan", () => {
  assert.deepEqual(
    getCanvasCoordinates({ clientX: 110, clientY: 220 }, canvas, 2, {
      x: 20,
      y: 40,
    }),
    { x: 40, y: 80 },
  );
});

test("uses touch coordinates when pointer coordinates are unavailable", () => {
  assert.deepEqual(
    getCanvasCoordinates(
      { touches: [{ clientX: 60, clientY: 90 }] },
      canvas,
    ),
    { x: 50, y: 70 },
  );
});

test("uses default zoom and pan values", () => {
  assert.deepEqual(
    getCanvasCoordinates({ clientX: 25, clientY: 35 }, canvas),
    { x: 15, y: 15 },
  );
});

test("returns the origin when the canvas is unavailable", () => {
  assert.deepEqual(getCanvasCoordinates({ clientX: 5, clientY: 8 }, null), {
    x: 0,
    y: 0,
  });
});

test("calculates touch distance and center", () => {
  const firstTouch = { clientX: 0, clientY: 0 };
  const secondTouch = { clientX: 3, clientY: 4 };

  assert.equal(getTouchDistance(firstTouch, secondTouch), 5);
  assert.deepEqual(getTouchCenter(firstTouch, secondTouch), { x: 1.5, y: 2 });
});
