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
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-none bg-transparent text-slate-600 transition-all hover:bg-slate-100 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 [&.active]:bg-indigo-50 [&.active]:text-indigo-600 dark:[&.active]:bg-indigo-500/20 dark:[&.active]:text-indigo-400";

  return (
    <aside
      id="toolBar"
      aria-label="Drawing Tools"
      className="fixed bottom-4 inset-x-3 z-30 mx-auto flex max-w-fit items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md no-scrollbar dark:border-slate-800 dark:bg-slate-900/95 md:absolute md:top-4 md:bottom-auto md:inset-x-0"
    >
      <button
        className={`${toolBtnClass} active`}
        data-tool="select"
        title="Selection (V)"
      >
        <MousePointer className="h-4 w-4 stroke-2" />
      </button>

      <button className={toolBtnClass} data-tool="pan" title="Pan (H)">
        <Hand className="h-4 w-4 stroke-2" />
      </button>

      <div className="mx-1 h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

      <button
        className={toolBtnClass}
        data-tool="rectangle"
        title="Rectangle (R)"
      >
        <Square className="h-4 w-4 stroke-2" />
      </button>

      <button className={toolBtnClass} data-tool="circle" title="Circle (C)">
        <Circle className="h-4 w-4 stroke-2" />
      </button>

      <button className={toolBtnClass} data-tool="arrow" title="Arrow (A)">
        <ArrowRight className="h-4 w-4 stroke-2" />
      </button>

      <button className={toolBtnClass} data-tool="line" title="Line (L)">
        <Minus className="h-4 w-4 stroke-2" />
      </button>

      <button className={toolBtnClass} data-tool="pencil" title="Draw (P)">
        <Pencil className="h-4 w-4 stroke-2" />
      </button>

      <button className={toolBtnClass} data-tool="text" title="Text (T)">
        <Type className="h-4 w-4 stroke-2" />
      </button>

      <button
        className={toolBtnClass}
        data-tool="sticky"
        title="Sticky Note (N)"
      >
        <StickyNote className="h-4 w-4 stroke-2" />
      </button>

      <div className="mx-1 h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />

      <button className={toolBtnClass} data-tool="eraser" title="Eraser (E)">
        <Eraser className="h-4 w-4 stroke-2" />
      </button>
    </aside>
  );
}

export default DrawingTools;
