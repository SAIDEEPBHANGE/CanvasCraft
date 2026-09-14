import { createContext, useContext, useState, useRef } from "react";
import { TOOLS, STROKE_CONFIG, ZOOM_CONFIG } from "../utils/constants";

const CanvasContext = createContext();

export function CanvasProvider({ children }) {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [strokeColor, setStrokeColor] = useState(STROKE_CONFIG.DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_CONFIG.DEFAULT_WIDTH);

  const [zoom, setZoom] = useState(ZOOM_CONFIG.DEFAULT);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);

  // Selected element ID
  const [selectedId, setSelectedId] = useState(null);

  const canvasRef = useRef(null);

  // Layering: Bring Forward
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

  // Layering: Send Backward
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

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep((prev) => prev - 1);
      setElements(history[historyStep - 1] || []);
      setSelectedId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep((prev) => prev + 1);
      setElements(history[historyStep + 1] || []);
      setSelectedId(null);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setHistory([]);
    setHistoryStep(0);
    setSelectedId(null);
  };

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
