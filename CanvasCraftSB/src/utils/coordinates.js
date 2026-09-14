/**
 * Converts a raw pointer/touch event into true world coordinates on the canvas,
 * accounting for container offsets, pan translation, and zoom levels.
 *
 * @param {PointerEvent | MouseEvent | Touch} event - The client event
 * @param {HTMLCanvasElement} canvas - The canvas DOM node
 * @param {number} zoom - Current zoom multiplier (e.g. 1.0 = 100%)
 * @param {{x: number, y: number}} panOffset - Current pan translation
 * @returns {{x: number, y: number}} True canvas coordinate
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

  // Viewport position relative to the canvas DOM element
  const viewportX = clientX - rect.left;
  const viewportY = clientY - rect.top;

  // Convert to world coordinates accounting for camera pan & zoom
  return {
    x: (viewportX - panOffset.x) / zoom,
    y: (viewportY - panOffset.y) / zoom,
  };
}

/**
 * Calculates midpoint distance between two touch points for pinch-to-zoom
 */
export function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.hypot(dx, dy);
}

/**
 * Calculates center point between two touches for smooth pinch-zooming
 */
export function getTouchCenter(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
}
