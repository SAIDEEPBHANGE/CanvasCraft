import { ZoomIn, ZoomOut } from "lucide-react";

function ZoomFunctions() {
  const btnClass =
    "flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800";

  return (
    <div
      id="zoomControls"
      aria-label="Zoom Controls"
      /* Anchored to bottom-right on mobile/fold so it never hits bottom-left or center elements; shifts to bottom-left on desktop (lg:) */
      className="fixed bottom-3 right-3 z-20 flex items-center gap-0.5 rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:absolute lg:bottom-4 lg:left-4 lg:right-auto"
    >
      <button
        id="zoomOutBtn"
        type="button"
        title="Zoom Out (-)"
        aria-label="Zoom Out"
        className={btnClass}
      >
        <ZoomOut className="h-3.5 w-3.5 stroke-[2]" />
      </button>

      <span
        id="zoomLevel"
        className="min-w-[34px] select-none text-center font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300"
      >
        100%
      </span>

      <button
        id="zoomInBtn"
        type="button"
        title="Zoom In (+)"
        aria-label="Zoom In"
        className={btnClass}
      >
        <ZoomIn className="h-3.5 w-3.5 stroke-[2]" />
      </button>

      {/* Reset only appears when screen is wide enough */}
      <button
        id="zoomResetBtn"
        type="button"
        title="Reset Zoom"
        className="hidden rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 xl:inline-block"
      >
        Reset
      </button>
    </div>
  );
}

export default ZoomFunctions;
