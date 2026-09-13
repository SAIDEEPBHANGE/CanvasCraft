import { Plus } from "lucide-react";

function PropertiesBar() {
  const colors = ["#000000", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"];

  return (
    <aside
      id="propertiesBar"
      aria-label="Properties"
      className="fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:absolute md:top-20 md:bottom-auto md:left-4 md:translate-x-0 md:flex-col md:items-start md:p-3.5"
    >
      {/* Stroke Color */}
      <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-1.5">
        <span className="hidden text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400 md:inline">
          Stroke
        </span>
        <div className="flex items-center gap-1.5">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              data-color={color}
              style={{ backgroundColor: color }}
              className="h-5 w-5 shrink-0 rounded-md ring-offset-1 transition-transform hover:scale-110 active:ring-2 active:ring-indigo-500 dark:ring-offset-slate-900"
            />
          ))}
          <label
            className="relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-500 hover:border-slate-500 dark:border-slate-700"
            title="Custom Color"
          >
            <input
              type="color"
              id="customColorInput"
              defaultValue="#000000"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Plus className="h-3 w-3" />
          </label>
        </div>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 md:my-1 md:h-px md:w-full" />

      {/* Stroke Width Slider */}
      <div className="flex items-center gap-2 md:w-full md:flex-col md:items-start md:gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400 md:w-full">
          <label htmlFor="strokeWidth" className="cursor-pointer select-none">
            Stroke
          </label>
          <span id="strokeWidthValue" className="font-mono text-[11px]">
            3px
          </span>
        </div>
        <input
          type="range"
          id="strokeWidth"
          min="1"
          max="20"
          defaultValue="3"
          className="h-1.5 w-20 cursor-pointer accent-indigo-600 dark:accent-indigo-400 md:w-36"
        />
      </div>
    </aside>
  );
}

export default PropertiesBar;
