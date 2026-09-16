import { useEffect, useRef, useState, useCallback } from "react";
import { useCanvas } from "../context/CanvasContext";
import { TOOLS } from "../utils/constants";
import { getCanvasCoordinates } from "../utils/coordinates";
import {
  renderElement,
  renderSelectionBox,
  getElementBounds,
  getResizeHandles,
} from "../utils/drawing";
import { Check, X } from "lucide-react";

function WhiteBoard() {
  const {
    activeTool,
    setActiveTool,
    strokeColor,
    strokeWidth,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    elements,
    setElements,
    history,
    historyStep,
    setHistory,
    setHistoryStep,
    selectedId,
    setSelectedId,
    canvasRef,
  } = useCanvas();

  const [actionState, setActionState] = useState("none"); // "drawing" | "moving" | "rotating" | "resizing" | "panning"
  const [resizeHandle, setResizeHandle] = useState(null);
  const [currentElement, setCurrentElement] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [canvasCursor, setCanvasCursor] = useState("default");

  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialElementRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const textareaRef = useRef(null);
  const openTimeRef = useRef(0);

  // Commit state changes to Undo/Redo history
  const commitToHistory = useCallback(
    (newElements) => {
      setElements(newElements);
      setHistory((prev) => {
        const upToCurrent = prev.slice(0, historyStep + 1);
        const updated = [...upToCurrent, newElements];
        setHistoryStep(updated.length - 1);
        return updated;
      });
    },
    [setElements, setHistory, setHistoryStep, historyStep],
  );

  // Focus textarea when editing starts
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

  // Main canvas redraw loop
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

    // 3. Draw selection box & resize/rotation handles
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

  // Canvas resize and retina DPI sync
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

  // Global Keyboard Shortcuts (Tool switching, undo/redo, delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || editingElement) {
        return;
      }

      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          const next = historyStep + 1;
          if (next < history.length) {
            setHistoryStep(next);
            setElements(history[next] || []);
            setSelectedId(null);
          }
        } else {
          const prev = historyStep - 1;
          if (prev >= 0) {
            setHistoryStep(prev);
            setElements(history[prev] || []);
            setSelectedId(null);
          }
        }
        return;
      }

      if (isCtrlOrCmd && key === "y") {
        e.preventDefault();
        const next = historyStep + 1;
        if (next < history.length) {
          setHistoryStep(next);
          setElements(history[next] || []);
          setSelectedId(null);
        }
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        const remaining = elements.filter((el) => el.id !== selectedId);
        commitToHistory(remaining);
        setSelectedId(null);
        return;
      }

      switch (key) {
        case "v":
        case "1":
          setActiveTool(TOOLS.SELECT);
          break;
        case "h":
          setActiveTool(TOOLS.PAN);
          break;
        case "r":
        case "2":
          setActiveTool(TOOLS.RECTANGLE);
          setSelectedId(null);
          break;
        case "c":
        case "3":
          setActiveTool(TOOLS.CIRCLE);
          setSelectedId(null);
          break;
        case "a":
        case "4":
          setActiveTool(TOOLS.ARROW);
          setSelectedId(null);
          break;
        case "l":
        case "5":
          setActiveTool(TOOLS.LINE);
          setSelectedId(null);
          break;
        case "p":
        case "6":
          setActiveTool(TOOLS.PENCIL);
          setSelectedId(null);
          break;
        case "t":
        case "7":
          setActiveTool(TOOLS.TEXT);
          setSelectedId(null);
          break;
        case "s":
        case "8":
          setActiveTool(TOOLS.STICKY);
          setSelectedId(null);
          break;
        case "e":
        case "9":
          setActiveTool(TOOLS.ERASER);
          setSelectedId(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    editingElement,
    selectedId,
    elements,
    history,
    historyStep,
    commitToHistory,
    setActiveTool,
    setElements,
    setHistoryStep,
    setSelectedId,
  ]);

  // Mouse Wheel and Pinch-to-Zoom towards cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (!e.ctrlKey && (Math.abs(e.deltaX) > 0 || e.shiftKey)) {
        setPanOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
        return;
      }

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(
        Math.max(Number((zoom * zoomFactor).toFixed(3)), 0.1),
        5.0,
      );

      if (newZoom === zoom) return;

      const newPanX = mouseX - (mouseX - panOffset.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - panOffset.y) * (newZoom / zoom);

      setZoom(newZoom);
      setPanOffset({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [canvasRef, zoom, panOffset, setZoom, setPanOffset]);

  // Coordinate and hit testing helpers
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

  const getClickedResizeHandle = (point, element) => {
    const local = toLocalCoords(point, element);
    const handles = getResizeHandles(element, 6);
    const radius = 9 / zoom;

    for (const [handleKey, hPos] of Object.entries(handles)) {
      if (Math.hypot(hPos.x - local.x, hPos.y - local.y) <= radius) {
        return handleKey;
      }
    }
    return null;
  };

  // Text & Sticky Saving
  const saveTextAndClose = () => {
    if (!editingElement) return;

    const textToSave = editingElement.text.trim();

    if (editingElement.isNew) {
      if (textToSave) {
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
      }
    } else {
      const isShape =
        editingElement.type === TOOLS.RECTANGLE ||
        editingElement.type === TOOLS.CIRCLE;

      if (isShape) {
        const updated = elements.map((el) =>
          el.id === editingElement.id
            ? { ...el, text: editingElement.text }
            : el,
        );
        commitToHistory(updated);
      } else {
        if (textToSave) {
          const updated = elements.map((el) =>
            el.id === editingElement.id
              ? { ...el, text: editingElement.text }
              : el,
          );
          commitToHistory(updated);
        } else {
          const remaining = elements.filter(
            (el) => el.id !== editingElement.id,
          );
          commitToHistory(remaining);
          setSelectedId(null);
        }
      }
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

      // Check Resize Handles
      if (selected && selected.type !== TOOLS.PENCIL) {
        const handle = getClickedResizeHandle(coords, selected);
        if (handle) {
          setActionState("resizing");
          setResizeHandle(handle);
          dragStartRef.current = coords;
          initialElementRef.current = { ...selected };
          return;
        }
      }

      // Check Rotation Handle
      if (selected && isOverRotationHandle(coords, selected)) {
        setActionState("rotating");
        return;
      }

      // Hit-test element
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

    // 3. STICKY NOTE
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

    // 4. TEXT
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

    // 5. DRAWING TOOLS (Can draw anywhere, including nested within other shapes)
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

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);

    // Hover cursor feedback in SELECT mode
    if (actionState === "none" && activeTool === TOOLS.SELECT && selectedId) {
      const selected = elements.find((el) => el.id === selectedId);
      if (selected && selected.type !== TOOLS.PENCIL) {
        const handle = getClickedResizeHandle(coords, selected);
        if (handle) {
          const handles = getResizeHandles(selected);
          setCanvasCursor(handles[handle]?.cursor || "default");
          return;
        }
      }
      if (selected && isOverRotationHandle(coords, selected)) {
        setCanvasCursor("grab");
        return;
      }
      setCanvasCursor("default");
    }

    // Panning
    if (actionState === "panning") {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    // Resizing
    if (actionState === "resizing" && selectedId && initialElementRef.current) {
      const orig = initialElementRef.current;
      const angle = orig.angle || 0;

      const rad = -angle;
      const rawDx = coords.x - dragStartRef.current.x;
      const rawDy = coords.y - dragStartRef.current.y;
      const dx = rawDx * Math.cos(rad) - rawDy * Math.sin(rad);
      const dy = rawDx * Math.sin(rad) + rawDy * Math.cos(rad);

      let minX = Math.min(orig.x1, orig.x2);
      let maxX = Math.max(orig.x1, orig.x2);
      let minY = Math.min(orig.y1, orig.y2);
      let maxY = Math.max(orig.y1, orig.y2);

      if (resizeHandle.includes("e")) maxX += dx;
      if (resizeHandle.includes("s")) maxY += dy;
      if (resizeHandle.includes("w")) minX += dx;
      if (resizeHandle.includes("n")) minY += dy;

      if (maxX - minX >= 20 && maxY - minY >= 20) {
        setElements((prev) =>
          prev.map((el) =>
            el.id === selectedId
              ? {
                  ...el,
                  x1: minX,
                  y1: minY,
                  x2: maxX,
                  y2: maxY,
                }
              : el,
          ),
        );
      }
      return;
    }

    // Rotating
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

    // Moving
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

    // Drawing
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
      let isValidShape = true;

      if (currentElement.type === TOOLS.PENCIL) {
        isValidShape =
          currentElement.points && currentElement.points.length > 1;
      } else if (
        [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.ARROW].includes(
          currentElement.type,
        )
      ) {
        const dist = Math.hypot(
          currentElement.x2 - currentElement.x1,
          currentElement.y2 - currentElement.y1,
        );
        if (dist < 6) {
          isValidShape = false;
        }
      }

      if (isValidShape) {
        commitToHistory([...elements, currentElement]);
        setSelectedId(currentElement.id);
        setActiveTool(TOOLS.SELECT);
      }

      setCurrentElement(null);
    } else if (
      actionState === "moving" ||
      actionState === "rotating" ||
      actionState === "resizing"
    ) {
      commitToHistory(elements);
    }

    setActionState("none");
    setResizeHandle(null);
    initialElementRef.current = null;
  };

  // Double click to edit text or shapes
  const handleDoubleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas, zoom, panOffset);
    const hit = [...elements]
      .reverse()
      .find((el) => isPointInsideElement(coords, el));

    if (hit && hit.type !== TOOLS.PENCIL) {
      const bounds = getElementBounds(hit);
      const isShape = hit.type === TOOLS.RECTANGLE || hit.type === TOOLS.CIRCLE;
      const editorWidth = isShape
        ? Math.max(bounds.width * 0.85, 120)
        : bounds.width;
      const editorHeight = isShape
        ? Math.max(bounds.height * 0.6, 50)
        : bounds.height;

      const editorX = isShape ? bounds.cx - editorWidth / 2 : bounds.x;
      const editorY = isShape ? bounds.cy - editorHeight / 2 : bounds.y;

      setEditingElement({
        id: hit.id,
        x: editorX,
        y: editorY,
        width: editorWidth,
        height: editorHeight,
        text: hit.text || "",
        type: hit.type,
        isNew: false,
        isEmbedded: isShape,
      });
      setSelectedId(hit.id);
    }
  };

  return (
    <div
      aria-label="Canvas Workspace"
      style={{ cursor: canvasCursor }}
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

      {/* Inline Editor Overlay */}
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
              editingElement.isEmbedded
                ? "Type inside shape..."
                : editingElement.type === TOOLS.STICKY
                  ? "Write a note..."
                  : "Type text here..."
            }
            onChange={(e) => {
              const val = e.target.value;
              setEditingElement((prev) => ({ ...prev, text: val }));
            }}
            onBlur={() => {
              if (Date.now() - openTimeRef.current < 400) return;
              saveTextAndClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                cancelEditing();
              }
            }}
            style={{
              fontSize: `${(editingElement.type === TOOLS.STICKY ? 14 : 16) * zoom}px`,
              lineHeight: 1.3,
            }}
            className={`w-full resize-none p-2.5 outline-none shadow-lg ${
              editingElement.isEmbedded
                ? "rounded-t-md border-2 border-b-0 border-dashed border-indigo-400 bg-white/90 text-center font-sans text-slate-900 placeholder-slate-400 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder-slate-500"
                : editingElement.type === TOOLS.STICKY
                  ? "rounded-t-lg border-t border-x border-amber-300 bg-[#fef08a] font-sans text-slate-900 placeholder-amber-700/50 focus:ring-1 focus:ring-amber-400"
                  : "rounded-t-md border-2 border-b-0 border-dashed border-indigo-500 bg-white/95 font-sans text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            }`}
          />

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
