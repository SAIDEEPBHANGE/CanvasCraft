/**
 * Converts screen/pointer event coordinates into true canvas space,
 * taking into account pan offsets and zoom level.
 */
export function getCanvasCoordinates(
  event,
  canvas,
  zoom = 1,
  panOffset = { x: 0, y: 0 },
) {
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const clientX =
    event.clientX !== undefined
      ? event.clientX
      : event.touches?.[0]?.clientX || 0;
  const clientY =
    event.clientY !== undefined
      ? event.clientY
      : event.touches?.[0]?.clientY || 0;

  const viewportX = clientX - rect.left;
  const viewportY = clientY - rect.top;

  return {
    x: (viewportX - panOffset.x) / zoom,
    y: (viewportY - panOffset.y) / zoom,
  };
}

export function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.hypot(dx, dy);
}

export function getTouchCenter(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}
