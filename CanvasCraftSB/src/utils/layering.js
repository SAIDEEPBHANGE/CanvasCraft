/**
 * Moves one element a single step in the stacking order.
 * Returns the same array when nothing changes so callers can skip history.
 */
export function reorderElement(elements, id, direction) {
  const index = elements.findIndex((element) => element.id === id);
  if (index < 0) return elements;

  const target = direction === "forward" ? index + 1 : index - 1;
  if (target < 0 || target >= elements.length) return elements;

  const reordered = [...elements];
  const [item] = reordered.splice(index, 1);
  reordered.splice(target, 0, item);
  return reordered;
}
