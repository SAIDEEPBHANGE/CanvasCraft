import assert from "node:assert/strict";
import test from "node:test";
import { getPinchSnapshot, getPinchViewport } from "./viewport.js";

const rect = { left: 0, top: 0 };
const limits = { minZoom: 0.1, maxZoom: 5 };
const point = (x, y) => ({ clientX: x, clientY: y });

test("spreading fingers zooms in around the midpoint", () => {
  const previous = getPinchSnapshot(point(100, 100), point(200, 100), 1, {
    x: 0,
    y: 0,
  });
  const result = getPinchViewport({
    previous,
    touchA: point(50, 100),
    touchB: point(250, 100),
    rect,
    ...limits,
  });

  assert.equal(result.zoom, 2);
  // The canvas point under the original midpoint stays under the new midpoint.
  assert.deepEqual(result.panOffset, { x: -150, y: -100 });
});

test("moving both fingers together pans without zooming", () => {
  const previous = getPinchSnapshot(point(100, 100), point(200, 100), 1, {
    x: 10,
    y: 20,
  });
  const result = getPinchViewport({
    previous,
    touchA: point(130, 150),
    touchB: point(230, 150),
    rect,
    ...limits,
  });

  assert.equal(result.zoom, 1);
  assert.deepEqual(result.panOffset, { x: 40, y: 70 });
});

test("zoom is clamped to the configured limits", () => {
  const previous = getPinchSnapshot(point(0, 0), point(10, 0), 1, {
    x: 0,
    y: 0,
  });
  const result = getPinchViewport({
    previous,
    touchA: point(0, 0),
    touchB: point(1000, 0),
    rect,
    ...limits,
  });

  assert.equal(result.zoom, 5);
});

test("degenerate gestures are ignored", () => {
  const previous = getPinchSnapshot(point(0, 0), point(0, 0), 1, {
    x: 0,
    y: 0,
  });
  assert.equal(
    getPinchViewport({
      previous,
      touchA: point(0, 0),
      touchB: point(10, 0),
      rect,
      ...limits,
    }),
    null,
  );
});
