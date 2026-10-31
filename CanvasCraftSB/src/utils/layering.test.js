import assert from "node:assert/strict";
import test from "node:test";
import { reorderElement, reorderElements } from "./layering.js";

const elements = [{ id: "a" }, { id: "b" }, { id: "c" }];

test("moves an element forward", () => {
  assert.deepEqual(reorderElement(elements, "a", "forward"), [
    { id: "b" },
    { id: "a" },
    { id: "c" },
  ]);
});

test("moves an element backward", () => {
  assert.deepEqual(reorderElement(elements, "c", "backward"), [
    { id: "a" },
    { id: "c" },
    { id: "b" },
  ]);
});

test("returns the same array at the edges or for unknown ids", () => {
  assert.equal(reorderElement(elements, "c", "forward"), elements);
  assert.equal(reorderElement(elements, "a", "backward"), elements);
  assert.equal(reorderElement(elements, "missing", "forward"), elements);
});

test("moves several elements together and keeps their order", () => {
  const five = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
  const ids = (list) => list.map((e) => e.id).join("");
  assert.equal(ids(reorderElements(five, ["a", "c"], "forward")), "badce");
  assert.equal(ids(reorderElements(five, ["c", "e"], "backward")), "acbed");
});

test("a selection already at the edge does not change", () => {
  const five = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
  assert.equal(reorderElements(five, ["d", "e"], "forward"), five);
  assert.equal(reorderElements(five, ["a", "b"], "backward"), five);
});

test("does not mutate the original array", () => {
  reorderElement(elements, "a", "forward");
  assert.deepEqual(elements, [{ id: "a" }, { id: "b" }, { id: "c" }]);
});
