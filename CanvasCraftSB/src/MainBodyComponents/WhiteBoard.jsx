import { useEffect, useRef, useState, useCallback } from "react";
import { useCanvas } from "../context/CanvasContext";
import { TOOLS } from "../utils/constants";
import { getCanvasCoordinates } from "../utils/coordinates";
import {
  renderElement,
  renderSelectionBox,
  getElementBounds,
} from "../utils/drawing";

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
    selectedId,
    setSelectedId,
    canvasRef,
  } = useCanvas();

  const [actionState, setActionState] = useState("none"); // "drawing" | "moving" | "rotating" | "panning"
  const [currentElement, setCurrentElement] = useState(null);
  const [textInput, setTextInput] = useState(null); // { id, x, y, value, type }

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const commitToHistory = useCallback(
    (newElements) => {
      setElements(newElements);
      setHistory((prev) => {
        const updated = [...prev, newElements];
        setHistoryStep(updated.length - 1);
        return updated;
      });
    },
    [setElements, setHistory, setHistoryStep],
  );

  // Redraw canvas buffer
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(
      dpr * zoom,
      0,
      0,
      dpr * zoom,
      panOffset.x * dpr,
      panOffset.y * dpr,
    );

    // 1. Render all layered elements (bottom-to-top)
    elements.forEach((element) => {
      renderElement(ctx, element);
    });

    // 2. Render element currently being drawn
    if (currentElement) {
      renderElement(ctx, currentElement);
    }

    // 3. Render selection bounding box & rotation handle
    if (selectedId && activeTool === TOOLS.SELECT) {
      const selected = elements.find((el) => el.id === selectedId);
      if (selected) {
        renderSelectionBox(ctx, selected);
      }
    }
  }, [
    canvasRef,
    elements,
    currentElement,
    selectedId,
    activeTool,
    zoom,
    panOffset,
  ]);

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
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef, redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Rotates point around center in opposite direction for accurate hit testing
  const toLocalCoords = (point, element) => {
    const bounds = getElementBounds(element);
    const angle = element.angle || 0;
    if (angle === 0) return point;

    const rad = -angle;
    const dx = point.x - bounds.cx;
    const dy = point.y - bounds.cy;

    return {
      x: bounds.cx + (dx * Math.cos(rad) - dy * Math.sin(rad)),
      y: bounds.cy + (dx * Math.sin(rad) + dy * Math.cos(rad)),
    };
  };

  // Hit test single element
  const isPointInsideElement = (point, element) => {
    const local = toLocalCoords(point, element);
    const bounds = getElementBounds(element);

    if (element.type === TOOLS.PENCIL) {
      const tolerance = 8 / zoom;
      return element.points.some(
        (p) => Math.hypot(p.x - local.x, p.y - local.y) < tolerance,
      );
    }

    return (
      local.x >= bounds.x &&
      local.x <= bounds.x + bounds.width &&
      local.y >= bounds.y &&
      local.y <= bounds.y + bounds.height
    );
  };

  // Check if click hits the rotation handle
  const isOverRotationHandle = (point, element) => {
    const local = toLocalCoords(point, element);
    const bounds = getElementBounds(element);
    const handleY = bounds.y - 6 - 22;
    const handleX = bounds.cx;
    return Math.hypot(handleX - local.x, handleY - local.y) < 10 / zoom;
  };

  // Pointer Down
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (activeTool === TOOLS.PAN || e.button === 1) {
      setActionState("panning");
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      };
      return;
    }

    if (e.button !== 0) return;

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);

    // 1. SELECT TOOL: Rotate, Drag, or Select
    if (activeTool === TOOLS.SELECT) {
      const selected = elements.find((el) => el.id === selectedId);

      if (selected && isOverRotationHandle(coords, selected)) {
        setActionState("rotating");
        return;
      }

      // Check from top-most to bottom-most layer
      const hit = [...elements]
        .reverse()
        .find((el) => isPointInsideElement(coords, el));
      if (hit) {
        setSelectedId(hit.id);
        setActionState("moving");
        dragStartRef.current = coords;
      } else {
        setSelectedId(null);
        setActionState("none");
      }
      return;
    }

    // 2. LAYER-SAFE ERASER: Only delete the topmost element at that point
    if (activeTool === TOOLS.ERASER) {
      const hit = [...elements]
        .reverse()
        .find((el) => isPointInsideElement(coords, el));
      if (hit) {
        const remaining = elements.filter((el) => el.id !== hit.id);
        commitToHistory(remaining);
      }
      return;
    }

    // 3. TEXT OR STICKY NOTE: Open inline text editor
    if (activeTool === TOOLS.TEXT || activeTool === TOOLS.STICKY) {
      const isSticky = activeTool === TOOLS.STICKY;
      const width = isSticky ? 160 : 180;
      const height = isSticky ? 140 : 40;

      setTextInput({
        id: Date.now(),
        type: activeTool,
        x: coords.x,
        y: coords.y,
        width,
        height,
        value: "",
        bgColor: isSticky ? "#fef08a" : "transparent",
      });
      return;
    }

    // 4. SHAPES & PENCIL
    setActionState("drawing");
    if (activeTool === TOOLS.PENCIL) {
      setCurrentElement({
        id: Date.now(),
        type: TOOLS.PENCIL,
        points: [coords],
        strokeColor,
        strokeWidth,
        angle: 0,
      });
    } else {
      setCurrentElement({
        id: Date.now(),
        type: activeTool,
        x1: coords.x,
        y1: coords.y,
        x2: coords.x,
        y2: coords.y,
        strokeColor,
        strokeWidth,
        angle: 0,
      });
    }
  };

  // Pointer Move
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (actionState === "panning") {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);

    // ROTATION
    if (actionState === "rotating" && selectedId) {
      const selected = elements.find((el) => el.id === selectedId);
      if (!selected) return;

      const bounds = getElementBounds(selected);
      // Calculate angle from center to mouse position
      const rad =
        Math.atan2(coords.y - bounds.cy, coords.x - bounds.cx) + Math.PI / 2;

      setElements((prev) =>
        prev.map((el) => (el.id === selectedId ? { ...el, angle: rad } : el)),
      );
      return;
    }

    // MOVE ELEMENT
    if (actionState === "moving" && selectedId) {
      const dx = coords.x - dragStartRef.current.x;
      const dy = coords.y - dragStartRef.current.y;
      dragStartRef.current = coords;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedId) return el;
          if (el.type === TOOLS.PENCIL) {
            return {
              ...el,
              points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            };
          }
          return {
            ...el,
            x1: el.x1 + dx,
            y1: el.y1 + dy,
            x2: el.x2 + dx,
            y2: el.y2 + dy,
          };
        }),
      );
      return;
    }

    // DRAWING
    if (actionState === "drawing" && currentElement) {
      if (activeTool === TOOLS.PENCIL) {
        setCurrentElement((prev) => ({
          ...prev,
          points: [...prev.points, coords],
        }));
      } else {
        setCurrentElement((prev) => ({
          ...prev,
          x2: coords.x,
          y2: coords.y,
        }));
      }
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (actionState === "drawing" && currentElement) {
      commitToHistory([...elements, currentElement]);
      setCurrentElement(null);
    } else if (actionState === "moving" || actionState === "rotating") {
      commitToHistory(elements);
    }
    setActionState("none");
  };

  // Finalize Text or Sticky Note input
  const handleTextCommit = () => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }

    const newElement = {
      id: textInput.id,
      type: textInput.type,
      x1: textInput.x,
      y1: textInput.y,
      x2: textInput.x + textInput.width,
      y2: textInput.y + textInput.height,
      text: textInput.value,
      strokeColor,
      strokeWidth,
      bgColor: textInput.bgColor,
      angle: 0,
    };

    commitToHistory([...elements, newElement]);
    setTextInput(null);
  };

  return (
    <div
      aria-label="Canvas Workspace"
      className="absolute inset-0 h-full w-full touch-none overflow-hidden bg-[#fdfdfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[#121212] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"
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

      {/* Inline Text / Sticky Note Input Overlay */}
      {textInput && (
        <div
          className="absolute z-20 pointer-events-auto"
          style={{
            left: `${textInput.x * zoom + panOffset.x}px`,
            top: `${textInput.y * zoom + panOffset.y}px`,
          }}
        >
          <textarea
            autoFocus
            rows={textInput.type === TOOLS.STICKY ? 4 : 1}
            placeholder={
              textInput.type === TOOLS.STICKY
                ? "Take a note..."
                : "Type text..."
            }
            value={textInput.value}
            onChange={(e) =>
              setTextInput((prev) => ({ ...prev, value: e.target.value }))
            }
            onBlur={handleTextCommit}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                textInput.type === TOOLS.TEXT
              ) {
                e.preventDefault();
                handleTextCommit();
              }
            }}
            className={`resize-none border outline-none p-2 font-sans shadow-md rounded-md ${
              textInput.type === TOOLS.STICKY
                ? "bg-yellow-200 text-slate-800 border-yellow-400 placeholder-yellow-700/60"
                : "bg-transparent text-slate-900 dark:text-slate-100 border-indigo-400"
            }`}
            style={{
              width: `${textInput.width}px`,
              minHeight: `${textInput.height}px`,
              fontSize: textInput.type === TOOLS.STICKY ? "14px" : "18px",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default WhiteBoard;
