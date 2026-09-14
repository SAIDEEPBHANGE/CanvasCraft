import { createContext, useContext, useState, useRef } from "react";
import { TOOLS, STROKE_CONFIG, ZOOM_CONFIG } from "../utils/constants";

const CanvasContext = createContext();

export function CanvasProvider({ children }) {
  // Tool & styling state
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [strokeColor, setStrokeColor] = useState(STROKE_CONFIG.DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_CONFIG.DEFAULT_WIDTH);

  // Viewport camera state
  const [zoom, setZoom] = useState(ZOOM_CONFIG.DEFAULT);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // History & drawn elements
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);

  // Reference to the underlying canvas DOM node
  const canvasRef = useRef(null);

  // Undo / Redo actions
  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep((prev) => prev - 1);
      setElements(history[historyStep - 1] || []);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep((prev) => prev + 1);
      setElements(history[historyStep + 1] || []);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setHistory([]);
    setHistoryStep(0);
  };

  // Zoom helpers
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
