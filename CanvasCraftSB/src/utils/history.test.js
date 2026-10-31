import assert from "node:assert/strict";
import test from "node:test";
import { appendHistory, navigateHistory } from "./history.js";

test("appends a new state to history", () => {
  const initial = [];
  const created = [{ id: "shape-1" }];

  assert.deepEqual(appendHistory([initial], 0, created), {
    history: [initial, created],
    historyStep: 1,
  });
});

test("committing after undo discards the redo branch", () => {
  const initial = [];
  const firstEdit = [{ id: "shape-1" }];
  const undoneEdit = [{ id: "shape-2" }];

  assert.deepEqual(
    appendHistory([initial, firstEdit, undoneEdit], 1, [{ id: "shape-3" }]),
    {
      history: [initial, firstEdit, [{ id: "shape-3" }]],
      historyStep: 2,
    },
  );
});

test("navigates backward and forward through history", () => {
  const initial = [];
  const edited = [{ id: "shape-1" }];
  const history = [initial, edited];

  assert.deepEqual(navigateHistory(history, 1, "undo"), {
    historyStep: 0,
    elements: initial,
  });
  assert.deepEqual(navigateHistory(history, 0, "redo"), {
    historyStep: 1,
    elements: edited,
  });
});

test("returns null when undo or redo is unavailable", () => {
  const history = [[]];

  assert.equal(navigateHistory(history, 0, "undo"), null);
  assert.equal(navigateHistory(history, 0, "redo"), null);
});

test("rejects unsupported navigation directions", () => {
  assert.throws(() => navigateHistory([[]], 0, "jump"), RangeError);
});
