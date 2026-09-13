import { Undo2, Redo2, Sun } from "lucide-react";

function RightHeader() {
  return (
    <div className="flex items-center gap-2">
      {/* History Controls */}
      <div className="flex items-center gap-1">
        <button
          id="undoBtn"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 bg-transparent text-slate-500 transition-all duration-150 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400"
        >
          <Undo2 className="h-5.5 w-5.5 stroke-2" />
        </button>

        <button
          id="redoBtn"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 bg-transparent text-slate-500 transition-all duration-150 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400"
        >
          <Redo2 className="h-5.5 w-5.5 stroke-2" />
        </button>
      </div>

      {/* Theme Toggle Button */}
      <button
        id="themeToggle"
        title="Toggle Theme"
        aria-label="Toggle Theme"
        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 bg-transparent text-slate-500 transition-all duration-150 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400"
      >
        <Sun className="h-5.5 w-5.5 stroke-2" />
      </button>

      {/* Vertical Divider */}
      <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

      {/* Clear Button (btn-secondary) */}
      <button
        id="clearCanvas"
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-transparent px-[0.85rem] py-[0.45rem] text-[0.85rem] font-semibold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50"
      >
        Clear
      </button>

      {/* Export Button (btn-primary) */}
      <button
        id="exportBtn"
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-transparent bg-indigo-600 px-[0.85rem] py-[0.45rem] text-[0.85rem] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        Export
      </button>
    </div>
  );
}

export default RightHeader;
