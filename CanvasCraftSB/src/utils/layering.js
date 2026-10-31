/**
 * Moves the given elements one step in the stacking order, keeping their
 * relative order. Returns the same array when nothing changes so callers can
 * skip history.
 */
export function reorderElements(elements, ids, direction) {
  const selected = new Set(ids);
  const result = [...elements];
  let changed = false;

  if (direction === "forward") {
    for (let i = result.length - 2; i >= 0; i--) {
      if (selected.has(result[i].id) && !selected.has(result[i + 1].id)) {
        [result[i], result[i + 1]] = [result[i + 1], result[i]];
        changed = true;
      }
    }
  } else {
    for (let i = 1; i < result.length; i++) {
      if (selected.has(result[i].id) && !selected.has(result[i - 1].id)) {
        [result[i], result[i - 1]] = [result[i - 1], result[i]];
        changed = true;
      }
    }
  }
  return changed ? result : elements;
}

export function reorderElement(elements, id, direction) {
  return reorderElements(elements, [id], direction);
}
