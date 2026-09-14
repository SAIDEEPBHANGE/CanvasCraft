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
    setActiveTool,
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
  const [editingText, setEditingText] = useState(null); // { id, x, y, width, height, text, type, isNew }

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

  // Redraw canvas
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

    // Render all elements
    elements.forEach((element) => {
      // Don't render element text on canvas if it's currently being edited in textarea
      if (
        editingText &&
        editingText.id === element.id &&
        editingText.type === TOOLS.TEXT
      ) {
        return;
      }
      renderElement(ctx, element);
    });

    // Render in-progress drawing element
    if (currentElement) {
      renderElement(ctx, currentElement);
    }

    // Render selection & rotation handle
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
    editingText,
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

  // Rotates point around center for accurate selection check
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

  const isOverRotationHandle = (point, element) => {
    const local = toLocalCoords(point, element);
    const bounds = getElementBounds(element);
    const handleY = bounds.y - 6 - 22;
    const handleX = bounds.cx;
    return Math.hypot(handleX - local.x, handleY - local.y) < 12 / zoom;
  };

  // Pointer Down
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If typing in a note and user clicks outside, finish edit first
    if (editingText) {
      finishTextEditing();
      return;
    }

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

    // 1. SELECT TOOL
    if (activeTool === TOOLS.SELECT) {
      const selected = elements.find((el) => el.id === selectedId);

      if (selected && isOverRotationHandle(coords, selected)) {
        setActionState("rotating");
        return;
      }

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

    // 2. ERASER
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

    // 3. STICKY NOTE (Instantly creates note & opens editor)
    if (activeTool === TOOLS.STICKY) {
      const noteWidth = 180;
      const noteHeight = 160;
      const newNote = {
        id: Date.now(),
        type: TOOLS.STICKY,
        x1: coords.x,
        y1: coords.y,
        x2: coords.x + noteWidth,
        y2: coords.y + noteHeight,
        text: "",
        bgColor: "#fef08a",
        strokeColor: "#facc15",
        strokeWidth: 1,
        angle: 0,
      };

      // Add to elements and immediately start editing
      const updated = [...elements, newNote];
      commitToHistory(updated);
      setSelectedId(newNote.id);

      setEditingText({
        id: newNote.id,
        x: coords.x,
        y: coords.y,
        width: noteWidth,
        height: noteHeight,
        text: "",
        type: TOOLS.STICKY,
      });

      // Switch back to select tool so dragging works right after
      setActiveTool(TOOLS.SELECT);
      return;
    }

    // 4. PLAIN TEXT
    if (activeTool === TOOLS.TEXT) {
      const textWidth = 200;
      const textHeight = 40;
      const newText = {
        id: Date.now(),
        type: TOOLS.TEXT,
        x1: coords.x,
        y1: coords.y,
        x2: coords.x + textWidth,
        y2: coords.y + textHeight,
        text: "",
        strokeColor,
        strokeWidth,
        angle: 0,
      };

      setEditingText({
        id: newText.id,
        x: coords.x,
        y: coords.y,
        width: textWidth,
        height: textHeight,
        text: "",
        type: TOOLS.TEXT,
        isNew: true,
      });

      setActiveTool(TOOLS.SELECT);
      return;
    }

    // 5. SHAPES & FREEHAND
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

    // IN-PROGRESS DRAWING
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

  // Double click to edit sticky note or text
  const handleDoubleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);
    const hit = [...elements]
      .reverse()
      .find((el) => isPointInsideElement(coords, el));

    if (hit && (hit.type === TOOLS.STICKY || hit.type === TOOLS.TEXT)) {
      const bounds = getElementBounds(hit);
      setEditingText({
        id: hit.id,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        text: hit.text || "",
        type: hit.type,
      });
    }
  };

  // Save Text / Sticky Note changes
  const finishTextEditing = () => {
    if (!editingText) return;

    if (editingText.isNew) {
      if (editingText.text.trim()) {
        const newEl = {
          id: editingText.id,
          type: editingText.type,
          x1: editingText.x,
          y1: editingText.y,
          x2: editingText.x + editingText.width,
          y2: editingText.y + editingText.height,
          text: editingText.text,
          strokeColor,
          strokeWidth,
          angle: 0,
        };
        commitToHistory([...elements, newEl]);
      }
    } else {
      const updated = elements
        .map((el) =>
          el.id === editingText.id ? { ...el, text: editingText.text } : el,
        )
        .filter((el) => el.type !== TOOLS.TEXT || el.text.trim() !== ""); // Delete blank text
      commitToHistory(updated);
    }

    setEditingText(null);
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
        onDoubleClick={handleDoubleClick}
        className="block h-full w-full touch-none"
      />

      {/* Floating Active Note Editor */}
      {editingText && (
        <div
          className="pointer-events-auto absolute z-30"
          style={{
            left: `${editingText.x * zoom + panOffset.x}px`,
            top: `${editingText.y * zoom + panOffset.y}px`,
            width: `${editingText.width * zoom}px`,
            height: `${editingText.height * zoom}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            autoFocus
            value={editingText.text}
            placeholder={
              editingText.type === TOOLS.STICKY
                ? "Write a note..."
                : "Type here..."
            }
            onChange={(e) =>
              setEditingText((prev) => ({ ...prev, text: e.target.value }))
            }
            onBlur={finishTextEditing}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                editingText.type === TOOLS.TEXT
              ) {
                e.preventDefault();
                finishTextEditing();
              }
              if (e.key === "Escape") {
                finishTextEditing();
              }
            }}
            style={{
              fontSize: `${(editingText.type === TOOLS.STICKY ? 14 : 16) * zoom}px`,
              lineHeight: 1.3,
            }}
            className={`h-full w-full resize-none rounded-lg p-2.5 outline-none transition-shadow ${
              editingText.type === TOOLS.STICKY
                ? "border border-amber-300 bg-[#fef08a] font-sans text-slate-900 shadow-xl placeholder-amber-700/50 focus:ring-2 focus:ring-amber-400"
                : "border border-indigo-400 bg-transparent font-sans text-slate-900 shadow-sm dark:text-slate-100"
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default WhiteBoard;
