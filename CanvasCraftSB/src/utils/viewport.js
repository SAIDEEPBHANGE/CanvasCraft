import { getTouchCenter, getTouchDistance } from "./coordinates.js";

export function getPinchSnapshot(touchA, touchB, zoom, panOffset) {
  return {
    distance: getTouchDistance(touchA, touchB),
    center: getTouchCenter(touchA, touchB),
    zoom,
    panOffset,
  };
}

/**
 * Applies a two-finger pinch/pan gesture: zooms around the fingers' midpoint
 * and follows the midpoint as it moves. Returns null if the gesture is degenerate.
 */
export function getPinchViewport({
  previous,
  touchA,
  touchB,
  rect,
  minZoom,
  maxZoom,
}) {
  const distance = getTouchDistance(touchA, touchB);
  if (!previous || previous.distance <= 0 || distance <= 0) return null;

  const center = getTouchCenter(touchA, touchB);
  const zoom = Math.min(
    maxZoom,
    Math.max(minZoom, previous.zoom * (distance / previous.distance)),
  );

  const anchorX =
    (previous.center.x - rect.left - previous.panOffset.x) / previous.zoom;
  const anchorY =
    (previous.center.y - rect.top - previous.panOffset.y) / previous.zoom;

  const panOffset = {
    x: center.x - rect.left - anchorX * zoom,
    y: center.y - rect.top - anchorY * zoom,
  };

  return { zoom, panOffset, snapshot: { distance, center, zoom, panOffset } };
}
