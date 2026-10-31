import assert from "node:assert/strict";
import test from "node:test";
import { createId } from "./id.js";

test("creates unique ids even when called in the same millisecond", () => {
  const ids = new Set(Array.from({ length: 1000 }, () => createId()));
  assert.equal(ids.size, 1000);
});

test("creates non-empty string ids", () => {
  const id = createId();
  assert.equal(typeof id, "string");
  assert.ok(id.length > 0);
});
