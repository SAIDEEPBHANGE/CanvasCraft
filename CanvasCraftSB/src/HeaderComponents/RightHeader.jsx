import { Undo2, Redo2, Sun, Trash2, Download } from "lucide-react";

function RightHeader() {
  const iconBtnClass =
    "flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800";

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:gap-1.5 sm:p-1.5">
      {/* Undo */}
      <button
        id="undoBtn"
        type="button"
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
        className={iconBtnClass}
      >
        <Undo2 className="h-4 w-4" />
      </button>

      {/* Redo */}
      <button
        id="redoBtn"
        type="button"
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
        className={iconBtnClass}
      >
        <Redo2 className="h-4 w-4" />
      </button>

      {/* Divider */}
      <div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700 sm:mx-1" />

      {/* Theme Toggle */}
      <button
        id="themeToggle"
        type="button"
        title="Toggle Theme"
        aria-label="Toggle Theme"
        className={iconBtnClass}
      >
        <Sun className="h-4 w-4" />
      </button>

      {/* Clear Button (Icon on mobile/fold, text label on sm+) */}
      <button
        id="clearCanvas"
        type="button"
        title="Clear Canvas"
        className="flex h-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 sm:px-2.5"
      >
        <Trash2 className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Clear</span>
      </button>

      {/* Export Button (Icon on mobile/fold, text label on sm+) */}
      <button
        id="exportBtn"
        type="button"
        title="Export"
        className="flex h-8 items-center justify-center rounded-lg bg-indigo-600 px-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600 sm:px-3"
      >
        <Download className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Export</span>
      </button>
    </div>
  );
}

export default RightHeader;
