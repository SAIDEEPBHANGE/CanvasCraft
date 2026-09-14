import { useEffect, useRef, useState, useCallback } from "react";
import { useCanvas } from "../context/CanvasContext";
import { TOOLS } from "../utils/constants";
import { getCanvasCoordinates } from "../utils/coordinates";
import { renderElement } from "../utils/drawing";

function WhiteBoard() {
  const {
    activeTool,
    strokeColor,
    strokeWidth,
    zoom,
    panOffset,
    setPanOffset,
    elements,
    setElements,
    setHistory,
    setHistoryStep,
    canvasRef,
  } = useCanvas();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Commit changes to undo/redo history
  const commitToHistory = useCallback(
    (newElements) => {
      setElements(newElements);
      setHistory((prev) => {
        const upToCurrent = prev.slice(0, prev.length);
        const updated = [...upToCurrent, newElements];
        setHistoryStep(updated.length - 1);
        return updated;
      });
    },
    [setElements, setHistory, setHistoryStep],
  );

  // Redraw the canvas on any state update
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Reset transform to clear entire physical buffer
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply viewport camera: DPR -> Pan translation -> Zoom scaling
    ctx.setTransform(
      dpr * zoom,
      0,
      0,
      dpr * zoom,
      panOffset.x * dpr,
      panOffset.y * dpr,
    );

    // Render committed elements
    elements.forEach((element) => {
      renderElement(ctx, element);
    });

    // Render in-progress element currently being drawn
    if (currentElement) {
      renderElement(ctx, currentElement);
    }
  }, [canvasRef, elements, currentElement, zoom, panOffset]);

  // Sync canvas dimensions with viewport & DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      redrawCanvas();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, redrawCanvas]);

  // Redraw whenever elements, zoom, pan, or in-progress elements change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer Down
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pan mode (or middle mouse click)
    if (activeTool === TOOLS.PAN || e.button === 1) {
      setIsDrawing(true);
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      };
      return;
    }

    if (e.button !== 0) return; // Only process left clicks

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);
    setIsDrawing(true);

    if (activeTool === TOOLS.PENCIL) {
      const newElement = {
        id: Date.now(),
        type: TOOLS.PENCIL,
        points: [coords],
        strokeColor,
        strokeWidth,
      };
      setCurrentElement(newElement);
    } else if (
      [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.ARROW].includes(
        activeTool,
      )
    ) {
      const newElement = {
        id: Date.now(),
        type: activeTool,
        x1: coords.x,
        y1: coords.y,
        x2: coords.x,
        y2: coords.y,
        strokeColor,
        strokeWidth,
      };
      setCurrentElement(newElement);
    } else if (activeTool === TOOLS.ERASER) {
      // Direct element eraser hit check
      eraseAtPoint(coords);
    }
  };

  // Pointer Move
  const handlePointerMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pan movement
    if (activeTool === TOOLS.PAN || e.buttons === 4) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);

    if (activeTool === TOOLS.PENCIL && currentElement) {
      setCurrentElement((prev) => ({
        ...prev,
        points: [...prev.points, coords],
      }));
    } else if (
      [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.ARROW].includes(
        activeTool,
      ) &&
      currentElement
    ) {
      setCurrentElement((prev) => ({
        ...prev,
        x2: coords.x,
        y2: coords.y,
      }));
    } else if (activeTool === TOOLS.ERASER) {
      eraseAtPoint(coords);
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentElement) {
      const updated = [...elements, currentElement];
      commitToHistory(updated);
      setCurrentElement(null);
    }
  };

  // Simple bounding distance hit detection for the eraser
  const eraseAtPoint = (point) => {
    const tolerance = 12 / zoom;
    const remaining = elements.filter((el) => {
      if (el.type === TOOLS.PENCIL) {
        return !el.points.some(
          (p) => Math.hypot(p.x - point.x, p.y - point.y) < tolerance,
        );
      }
      if (
        [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.ARROW].includes(
          el.type,
        )
      ) {
        const midX = (el.x1 + el.x2) / 2;
        const midY = (el.y1 + el.y2) / 2;
        const radius =
          Math.max(Math.abs(el.x2 - el.x1), Math.abs(el.y2 - el.y1)) / 2;
        return Math.hypot(midX - point.x, midY - point.y) > radius + tolerance;
      }
      return true;
    });

    if (remaining.length !== elements.length) {
      commitToHistory(remaining);
    }
  };

  // Set appropriate cursor based on tool
  const getCursorClass = () => {
    switch (activeTool) {
      case TOOLS.PAN:
        return isDrawing ? "cursor-grabbing" : "cursor-grab";
      case TOOLS.SELECT:
        return "cursor-default";
      case TOOLS.ERASER:
        return "cursor-pointer";
      default:
        return "cursor-crosshair";
    }
  };

  return (
    <div
      aria-label="Canvas Workspace"
      className={`absolute inset-0 h-full w-full touch-none overflow-hidden bg-[#fdfdfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[#121212] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] ${getCursorClass()}`}
    >
      <canvas
        id="whiteboard"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="block h-full w-full touch-none"
      />
    </div>
  );
}

export default WhiteBoard;
