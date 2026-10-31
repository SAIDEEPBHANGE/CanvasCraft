import { useState, useEffect, useRef, useCallback } from "react";
import { TOOLS, ZOOM_CONFIG } from "../utils/constants";
import { appendHistory, navigateHistory } from "../utils/history";
import { reorderElement } from "../utils/layering";
import {
  readJson,
  sanitizeElements,
  sanitizePreferences,
  sanitizeViewport,
  writeJson,
} from "../utils/persistence";
import { CanvasContext } from "./canvasContextValue";
const STORAGE_KEYS = {
  ELEMENTS: "canvascraft_elements",
  VIEWPORT: "canvascraft_viewport",
  PREFERENCES: "canvascraft_prefs",
};
const loadInitialState = () => ({
  elements: sanitizeElements(readJson(STORAGE_KEYS.ELEMENTS, [])),
  viewport: sanitizeViewport(readJson(STORAGE_KEYS.VIEWPORT, null)),
  prefs: sanitizePreferences(readJson(STORAGE_KEYS.PREFERENCES, null)),
});
export function CanvasProvider({ children }) {
  // 1. Initial state is read (and validated) once, not on every render
  const [initial] = useState(loadInitialState);
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [strokeColor, setStrokeColor] = useState(initial.prefs.strokeColor);
  const [strokeWidth, setStrokeWidth] = useState(initial.prefs.strokeWidth);
  const [zoom, setZoom] = useState(initial.viewport.zoom);
  const [panOffset, setPanOffset] = useState(initial.viewport.panOffset);
  const [elements, setElements] = useState(initial.elements);
  const [history, setHistory] = useState([initial.elements]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [storageError, setStorageError] = useState(false);
  const canvasRef = useRef(null);
  // Writes are debounced so freehand drawing doesn't hit storage every frame.
  // State is only set inside the timer callback, never synchronously in the effect.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!writeJson(STORAGE_KEYS.ELEMENTS, elements)) setStorageError(true);
    }, 300);
    return () => clearTimeout(handler);
  }, [elements]);
  const viewport = { zoom, panOffset };
  const prefs = { strokeColor, strokeWidth };
  const viewportKey = `${zoom}|${panOffset.x}|${panOffset.y}`;
  const prefsKey = `${strokeColor}|${strokeWidth}`;
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!writeJson(STORAGE_KEYS.VIEWPORT, viewport)) setStorageError(true);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportKey]);
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!writeJson(STORAGE_KEYS.PREFERENCES, prefs)) setStorageError(true);
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsKey]);
  const dismissStorageError = () => setStorageError(false);
  // Commits a new element list as one undoable history step
  const commitElements = useCallback(
    (newElements) => {
      setElements(newElements);
      const next = appendHistory(history, historyStep, newElements);
      setHistory(next.history);
      setHistoryStep(next.historyStep);
    },
    [history, historyStep],
  );
  // Layering (undoable)
  const moveLayer = (id, direction) => {
    const reordered = reorderElement(elements, id, direction);
    if (reordered !== elements) commitElements(reordered);
  };
  const bringForward = (id) => moveLayer(id, "forward");
  const sendBackward = (id) => moveLayer(id, "backward");
  // History & Undo / Redo
  const undo = () => {
    const previous = navigateHistory(history, historyStep, "undo");
    if (!previous) return;
    setHistoryStep(previous.historyStep);
    setElements(previous.elements);
    setSelectedId(null);
  };
  const redo = () => {
    const next = navigateHistory(history, historyStep, "redo");
    if (!next) return;
    setHistoryStep(next.historyStep);
    setElements(next.elements);
    setSelectedId(null);
  };
  // Clear Canvas also resets local storage clean
  const clearCanvas = () => {
    setElements([]);
    setHistory([[]]);
    setHistoryStep(0);
    setSelectedId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ELEMENTS);
    } catch (err) {
      console.warn("Error clearing elements storage:", err);
    }
  };
  // Zoom Helpers
  const zoomIn = () => {
    setZoom((prev) =>
      Math.min(Number((prev + ZOOM_CONFIG.STEP).toFixed(2)), ZOOM_CONFIG.MAX),
    );
  };
  const zoomOut = () => {
    setZoom((prev) =>
      Math.max(Number((prev - ZOOM_CONFIG.STEP).toFixed(2)), ZOOM_CONFIG.MIN),
    );
  };
  const resetZoom = () => {
    setZoom(ZOOM_CONFIG.DEFAULT);
    setPanOffset({ x: 0, y: 0 });
  };
  return (
    <CanvasContext.Provider
      value={{
        activeTool,
        setActiveTool,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
        zoom,
        setZoom,
        panOffset,
        setPanOffset,
        elements,
        setElements,
        history,
        setHistory,
        historyStep,
        setHistoryStep,
        selectedId,
        setSelectedId,
        bringForward,
        sendBackward,
        commitElements,
        storageError,
        dismissStorageError,
        canvasRef,
        undo,
        redo,
        clearCanvas,
        zoomIn,
        zoomOut,
        resetZoom,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
