import { useEffect, useRef, useState, useCallback } from "react";
import { useCanvas } from "../context/CanvasContext";
import { TOOLS } from "../utils/constants";
import { getCanvasCoordinates } from "../utils/coordinates";
import {
  renderElement,
  renderSelectionBox,
  getElementBounds,
} from "../utils/drawing";
import { Check, X } from "lucide-react";

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

  const [actionState, setActionState] = useState("none");
  const [currentElement, setCurrentElement] = useState(null);
  const [editingElement, setEditingElement] = useState(null);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const textareaRef = useRef(null);
  const openTimeRef = useRef(0);

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

  // Focus textarea safely
  useEffect(() => {
    if (editingElement && textareaRef.current) {
      openTimeRef.current = Date.now();
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editingElement]);

  // Main canvas redraw routine
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

    // 1. Draw committed elements
    elements.forEach((element) => {
      if (editingElement && editingElement.id === element.id) {
        if (element.type === TOOLS.STICKY) {
          renderElement(ctx, { ...element, text: "" });
        }
        return;
      }
      renderElement(ctx, element);
    });

    // 2. Draw active shape preview
    if (currentElement) {
      renderElement(ctx, currentElement);
    }

    // 3. Draw selection handles
    if (selectedId && activeTool === TOOLS.SELECT && !editingElement) {
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
    editingElement,
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

  // Safe commit function
  const saveTextAndClose = () => {
    if (!editingElement) return;

    const textToSave = editingElement.text.trim();

    if (textToSave) {
      if (editingElement.isNew) {
        const newEl = {
          id: editingElement.id,
          type: editingElement.type,
          x1: editingElement.x,
          y1: editingElement.y,
          x2: editingElement.x + editingElement.width,
          y2: editingElement.y + editingElement.height,
          text: editingElement.text,
          strokeColor:
            editingElement.type === TOOLS.STICKY ? "#facc15" : strokeColor,
          strokeWidth: 1,
          bgColor: editingElement.type === TOOLS.STICKY ? "#fef08a" : undefined,
          angle: 0,
        };
        commitToHistory([...elements, newEl]);
        setSelectedId(newEl.id);
      } else {
        const updated = elements.map((el) =>
          el.id === editingElement.id
            ? { ...el, text: editingElement.text }
            : el,
        );
        commitToHistory(updated);
      }
    } else if (!editingElement.isNew) {
      // If an existing note was completely cleared, remove it
      const remaining = elements.filter((el) => el.id !== editingElement.id);
      commitToHistory(remaining);
      setSelectedId(null);
    }

    setEditingElement(null);
  };

  const cancelEditing = () => {
    setEditingElement(null);
  };

  // Pointer Down
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // If an editor is active and you tap canvas, save it
    if (editingElement) {
      saveTextAndClose();
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

    // 3. STICKY NOTE CREATION
    if (activeTool === TOOLS.STICKY) {
      setEditingElement({
        id: Date.now(),
        x: coords.x,
        y: coords.y,
        width: 180,
        height: 150,
        text: "",
        type: TOOLS.STICKY,
        isNew: true,
      });
      setActiveTool(TOOLS.SELECT);
      return;
    }

    // 4. TEXT CREATION
    if (activeTool === TOOLS.TEXT) {
      setEditingElement({
        id: Date.now(),
        x: coords.x,
        y: coords.y,
        width: 220,
        height: 48,
        text: "",
        type: TOOLS.TEXT,
        isNew: true,
      });
      setActiveTool(TOOLS.SELECT);
      return;
    }

    // 5. SHAPES & DRAWING
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

  // Double click to edit text or sticky
  const handleDoubleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);
    const hit = [...elements]
      .reverse()
      .find((el) => isPointInsideElement(coords, el));

    if (hit && (hit.type === TOOLS.STICKY || hit.type === TOOLS.TEXT)) {
      const bounds = getElementBounds(hit);
      setEditingElement({
        id: hit.id,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        text: hit.text || "",
        type: hit.type,
        isNew: false,
      });
      setSelectedId(hit.id);
    }
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

      {/* Floating Active Editor */}
      {editingElement && (
        <div
          className="pointer-events-auto absolute z-40 flex flex-col"
          style={{
            left: `${editingElement.x * zoom + panOffset.x}px`,
            top: `${editingElement.y * zoom + panOffset.y}px`,
            width: `${editingElement.width * zoom}px`,
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            ref={textareaRef}
            rows={editingElement.type === TOOLS.STICKY ? 5 : 2}
            value={editingElement.text}
            placeholder={
              editingElement.type === TOOLS.STICKY
                ? "Write a note..."
                : "Type text here..."
            }
            onChange={(e) => {
              const val = e.target.value;
              setEditingElement((prev) => ({ ...prev, text: val }));
            }}
            onBlur={() => {
              // Ignore blur that happens within the first 400ms of opening
              if (Date.now() - openTimeRef.current < 400) return;
              saveTextAndClose();
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                editingElement.type === TOOLS.TEXT
              ) {
                e.preventDefault();
                saveTextAndClose();
              }
              if (e.key === "Escape") {
                cancelEditing();
              }
            }}
            style={{
              fontSize: `${(editingElement.type === TOOLS.STICKY ? 14 : 18) * zoom}px`,
              lineHeight: 1.3,
            }}
            className={`w-full resize-none p-2.5 outline-none shadow-lg ${
              editingElement.type === TOOLS.STICKY
                ? "rounded-t-lg border-t border-x border-amber-300 bg-[#fef08a] font-sans text-slate-900 placeholder-amber-700/50 focus:ring-1 focus:ring-amber-400"
                : "rounded-t-md border-2 border-b-0 border-dashed border-indigo-500 bg-white/95 font-sans text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            }`}
          />

          {/* Explicit Save / Done Toolbar Bar */}
          <div
            className={`flex items-center justify-end gap-1.5 px-2 py-1 shadow-md ${
              editingElement.type === TOOLS.STICKY
                ? "rounded-b-lg border-b border-x border-amber-300 bg-amber-200/90"
                : "rounded-b-md border-2 border-t-0 border-dashed border-indigo-500 bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <button
              type="button"
              onClick={cancelEditing}
              title="Cancel (Esc)"
              className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-black/10 dark:text-slate-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={saveTextAndClose}
              title="Save"
              className="flex h-6 items-center gap-1 rounded bg-indigo-600 px-2 text-[11px] font-semibold text-white hover:bg-indigo-700"
            >
              <Check className="h-3 w-3" />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhiteBoard;
