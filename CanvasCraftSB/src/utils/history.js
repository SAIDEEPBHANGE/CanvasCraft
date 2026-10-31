export const MAX_HISTORY_STEPS = 100;

export function appendHistory(history, historyStep, elements) {
  const nextHistory = [...history.slice(0, historyStep + 1), elements].slice(
    -MAX_HISTORY_STEPS,
  );
  return {
    history: nextHistory,
    historyStep: nextHistory.length - 1,
  };
}

export function navigateHistory(history, historyStep, direction) {
  const offset = direction === "undo" ? -1 : direction === "redo" ? 1 : 0;
  if (offset === 0) {
    throw new RangeError(`Unsupported history direction: ${direction}`);
  }

  const nextStep = historyStep + offset;
  if (nextStep < 0 || nextStep >= history.length) {
    return null;
  }

  return {
    historyStep: nextStep,
    elements: history[nextStep],
  };
}
