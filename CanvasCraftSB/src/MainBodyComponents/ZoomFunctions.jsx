import { ZoomIn, ZoomOut } from "lucide-react";

function ZoomFunctions() {
  return (
    <div className="absolute right-4 bottom-4 z-10 hidden items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white/85 px-2 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/85 dark:text-slate-50 md:flex">
      <button
        id="zoomOutBtn"
        title="Zoom Out (-)"
        aria-label="Zoom Out"
        className="flex h-7 w-7 items-center justify-center rounded-md border-none bg-transparent text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <span id="zoomLevel" className="min-w-10 text-center select-none">
        100%
      </span>

      <button
        id="zoomInBtn"
        title="Zoom In (+)"
        aria-label="Zoom In"
        className="flex h-7 w-7 items-center justify-center rounded-md border-none bg-transparent text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <button
        id="zoomResetBtn"
        title="Reset Zoom"
        className="ml-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50"
      >
        Reset
      </button>
    </div>
  );
}

export default ZoomFunctions;
