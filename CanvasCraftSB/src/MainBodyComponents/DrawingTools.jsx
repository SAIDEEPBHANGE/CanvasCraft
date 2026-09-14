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

function DrawingTools() {
  const toolBtnClass =
    "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-none bg-transparent text-slate-600 transition-all hover:bg-slate-100 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 [&.active]:bg-indigo-50 [&.active]:text-indigo-600 dark:[&.active]:bg-indigo-500/20 dark:[&.active]:text-indigo-400";

  return (
    <aside
      id="toolBar"
      aria-label="Drawing Tools"
      className="pointer-events-auto flex max-w-[70vw] items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md no-scrollbar dark:border-slate-800 dark:bg-slate-900/95 sm:max-w-fit lg:absolute lg:top-3 lg:left-1/2 lg:-translate-x-1/2"
    >
      {/* Select */}
      <button
        className={`${toolBtnClass} active`}
        data-tool="select"
        title="Selection (V)"
      >
        <MousePointer className="h-4 w-4 stroke-2" />
      </button>

      {/* Hand / Pan */}
      <button className={toolBtnClass} data-tool="pan" title="Pan (H)">
        <Hand className="h-4 w-4 stroke-2" />
      </button>

      <div className="mx-0.5 h-4 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

      {/* Rectangle */}
      <button
        className={toolBtnClass}
        data-tool="rectangle"
        title="Rectangle (R)"
      >
        <Square className="h-4 w-4 stroke-2" />
      </button>

      {/* Circle */}
      <button className={toolBtnClass} data-tool="circle" title="Circle (C)">
        <Circle className="h-4 w-4 stroke-2" />
      </button>

      {/* Arrow */}
      <button className={toolBtnClass} data-tool="arrow" title="Arrow (A)">
        <ArrowRight className="h-4 w-4 stroke-2" />
      </button>

      {/* Line */}
      <button className={toolBtnClass} data-tool="line" title="Line (L)">
        <Minus className="h-4 w-4 stroke-2" />
      </button>

      {/* Pencil / Freehand */}
      <button className={toolBtnClass} data-tool="pencil" title="Draw (P)">
        <Pencil className="h-4 w-4 stroke-2" />
      </button>

      {/* Text */}
      <button className={toolBtnClass} data-tool="text" title="Text (T)">
        <Type className="h-4 w-4 stroke-2" />
      </button>

      {/* Sticky Note */}
      <button
        className={toolBtnClass}
        data-tool="sticky"
        title="Sticky Note (N)"
      >
        <StickyNote className="h-4 w-4 stroke-2" />
      </button>

      <div className="mx-0.5 h-4 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

      {/* Eraser */}
      <button className={toolBtnClass} data-tool="eraser" title="Eraser (E)">
        <Eraser className="h-4 w-4 stroke-2" />
      </button>
    </aside>
  );
}

export default DrawingTools;
