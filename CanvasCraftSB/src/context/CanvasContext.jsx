import { createContext, useContext, useState, useEffect, useRef } from "react";
import { TOOLS, STROKE_CONFIG, ZOOM_CONFIG } from "../utils/constants";

const CanvasContext = createContext();

const STORAGE_KEYS = {
  ELEMENTS: "canvascraft_elements",
  VIEWPORT: "canvascraft_viewport",
  PREFERENCES: "canvascraft_prefs",
};

// Safe helper to read from localStorage
const getSavedState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

export function CanvasProvider({ children }) {
  // 1. Initial State hydrated directly from localStorage
  const savedElements = getSavedState(STORAGE_KEYS.ELEMENTS, []);
  const savedViewport = getSavedState(STORAGE_KEYS.VIEWPORT, {
    zoom: ZOOM_CONFIG.DEFAULT,
    panOffset: { x: 0, y: 0 },
  });
  const savedPrefs = getSavedState(STORAGE_KEYS.PREFERENCES, {
    strokeColor: STROKE_CONFIG.DEFAULT_COLOR,
    strokeWidth: STROKE_CONFIG.DEFAULT_WIDTH,
  });

  // State initialization
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [strokeColor, setStrokeColor] = useState(savedPrefs.strokeColor);
  const [strokeWidth, setStrokeWidth] = useState(savedPrefs.strokeWidth);

  const [zoom, setZoom] = useState(savedViewport.zoom);
  const [panOffset, setPanOffset] = useState(savedViewport.panOffset);

  const [elements, setElements] = useState(savedElements);
  const [history, setHistory] = useState([savedElements]);
  const [historyStep, setHistoryStep] = useState(0);

  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);

  // 2. Persist Elements (Debounced by 300ms so drawing freehand doesn't write to disk on every frame)
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(elements));
      } catch (err) {
        console.warn("Storage quota exceeded or error writing elements:", err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [elements]);

  // 3. Persist Viewport Camera (Debounced by 500ms during active panning/zooming)
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEYS.VIEWPORT,
          JSON.stringify({ zoom, panOffset }),
        );
      } catch (err) {
        console.warn("Error saving viewport:", err);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [zoom, panOffset]);

  // 4. Persist User Tool Preferences (Color, Size)
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({ strokeColor, strokeWidth }),
      );
    } catch (err) {
      console.warn("Error saving preferences:", err);
    }
  }, [strokeColor, strokeWidth]);

  // Layering
  const bringForward = (id) => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx < 0 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx + 1, 0, item);
      return copy;
    });
  };

  const sendBackward = (id) => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(idx - 1, 0, item);
      return copy;
    });
  };

  // History & Undo / Redo
  const undo = () => {
    if (historyStep > 0) {
      const nextStep = historyStep - 1;
      setHistoryStep(nextStep);
      setElements(history[nextStep] || []);
      setSelectedId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setElements(history[nextStep] || []);
      setSelectedId(null);
    }
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

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
