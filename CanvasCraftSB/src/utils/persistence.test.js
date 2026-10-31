import assert from "node:assert/strict";
import test from "node:test";
import {
  readJson,
  sanitizeElements,
  sanitizePreferences,
  sanitizeViewport,
  writeJson,
} from "./persistence.js";

test("readJson falls back on missing, corrupt, or throwing storage", () => {
  assert.equal(readJson("k", 5, { getItem: () => null }), 5);
  assert.equal(readJson("k", 5, { getItem: () => "{bad" }), 5);
  assert.equal(
    readJson("k", 5, {
      getItem: () => {
        throw new Error("denied");
      },
    }),
    5,
  );
  assert.deepEqual(readJson("k", 5, { getItem: () => '{"a":1}' }), { a: 1 });
});

test("writeJson reports success and failure", () => {
  const store = {};
  assert.equal(
    writeJson("k", { a: 1 }, { setItem: (k, v) => (store[k] = v) }),
    true,
  );
  assert.equal(store.k, '{"a":1}');
  assert.equal(
    writeJson("k", 1, {
      setItem: () => {
        throw new Error("quota");
      },
    }),
    false,
  );
});

const box = (extra) => ({ x1: 0, y1: 0, x2: 10, y2: 10, ...extra });

test("sanitizeElements drops invalid entries and fills defaults", () => {
  const result = sanitizeElements([
    box({ id: "a", type: "rectangle" }),
    box({ id: "b", type: "bogus" }),
    box({ id: "c", type: "rectangle", x2: NaN }),
    { id: "d", type: "pencil", points: [{ x: 1, y: 1 }] },
    box({ id: "e", type: "text", text: 5 }),
    null,
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].angle, 0);
  assert.equal(result[0].strokeWidth, 3);
});

test("sanitizeElements keeps valid pencil strokes", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ];
  assert.equal(
    sanitizeElements([{ id: "p", type: "pencil", points }]).length,
    1,
  );
});

test("sanitizeElements reassigns missing and duplicate ids", () => {
  const result = sanitizeElements([
    box({ id: "a", type: "circle" }),
    box({ id: "a", type: "circle" }),
    box({ type: "circle" }),
  ]);
  assert.equal(new Set(result.map((e) => e.id)).size, 3);
  assert.equal(result[0].id, "a");
});

test("sanitizeElements handles non-arrays", () => {
  assert.deepEqual(sanitizeElements("nope"), []);
});

test("sanitizeViewport clamps zoom and validates pan", () => {
  assert.deepEqual(sanitizeViewport({ zoom: 99, panOffset: { x: 1, y: 2 } }), {
    zoom: 5,
    panOffset: { x: 1, y: 2 },
  });
  assert.deepEqual(sanitizeViewport({ zoom: "x", panOffset: { x: NaN } }), {
    zoom: 1,
    panOffset: { x: 0, y: 0 },
  });
  assert.equal(sanitizeViewport(null).zoom, 1);
});

test("sanitizePreferences validates color and width", () => {
  assert.deepEqual(
    sanitizePreferences({ strokeColor: "#ABCDEF", strokeWidth: 50 }),
    { strokeColor: "#abcdef", strokeWidth: 20 },
  );
  assert.deepEqual(
    sanitizePreferences({ strokeColor: "red", strokeWidth: "x" }),
    { strokeColor: "#000000", strokeWidth: 3 },
  );
});
