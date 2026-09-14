import {
  MousePointer,
  Hand,
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  StickyNote,
  Eraser,
} from "lucide-react";
import { useCanvas } from "../context/CanvasContext";
import { TOOLS } from "../utils/constants";

function DrawingTools() {
  const { activeTool, setActiveTool } = useCanvas();

  const getToolBtnClass = (toolName) =>
    `flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-none transition-all active:scale-95 ${
      activeTool === toolName
        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
        : "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    }`;

  return (
    <aside
      id="toolBar"
      aria-label="Drawing Tools"
      className="pointer-events-auto flex w-full max-w-full items-center justify-start gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md no-scrollbar dark:border-slate-800 dark:bg-slate-900/95 sm:justify-center lg:absolute lg:top-3 lg:left-1/2 lg:w-auto lg:-translate-x-1/2"
    >
      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.SELECT)}
        className={getToolBtnClass(TOOLS.SELECT)}
        title="Selection (V)"
      >
        <MousePointer className="h-4 w-4 stroke-2" />
      </button>

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.PAN)}
        className={getToolBtnClass(TOOLS.PAN)}
        title="Pan (H)"
      >
        <Hand className="h-4 w-4 stroke-2" />
      </button>

      <div className="mx-0.5 h-4 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.RECTANGLE)}
        className={getToolBtnClass(TOOLS.RECTANGLE)}
        title="Rectangle (R)"
      >
        <Square className="h-4 w-4 stroke-2" />
      </button>

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.CIRCLE)}
        className={getToolBtnClass(TOOLS.CIRCLE)}
        title="Circle (C)"
      >
        <Circle className="h-4 w-4 stroke-2" />
      </button>

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.ARROW)}
        className={getToolBtnClass(TOOLS.ARROW)}
        title="Arrow (A)"
      >
        <ArrowRight className="h-4 w-4 stroke-2" />
      </button>

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.LINE)}
        className={getToolBtnClass(TOOLS.LINE)}
        title="Line (L)"
      >
        <Minus className="h-4 w-4 stroke-2" />
      </button>

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.PENCIL)}
        className={getToolBtnClass(TOOLS.PENCIL)}
        title="Draw (P)"
      >
        <Pencil className="h-4 w-4 stroke-2" />
      </button>

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.TEXT)}
        className={getToolBtnClass(TOOLS.TEXT)}
        title="Text (T)"
      >
        <Type className="h-4 w-4 stroke-2" />
      </button>

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.STICKY)}
        className={getToolBtnClass(TOOLS.STICKY)}
        title="Sticky Note (N)"
      >
        <StickyNote className="h-4 w-4 stroke-2" />
      </button>

      <div className="mx-0.5 h-4 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

      <button
        type="button"
        onClick={() => setActiveTool(TOOLS.ERASER)}
        className={getToolBtnClass(TOOLS.ERASER)}
        title="Eraser (E)"
      >
        <Eraser className="h-4 w-4 stroke-2" />
      </button>
    </aside>
  );
}

export default DrawingTools;
