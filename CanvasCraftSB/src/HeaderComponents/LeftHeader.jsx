import { Paintbrush } from "lucide-react";

function LeftHeader() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-3 sm:py-2">
      <Paintbrush className="h-4 w-4 text-indigo-600 dark:text-indigo-400 sm:h-5 sm:w-5" />
      <span className="hidden text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:inline-block">
        CanvasCraft
      </span>
    </div>
  );
}

export default LeftHeader;
