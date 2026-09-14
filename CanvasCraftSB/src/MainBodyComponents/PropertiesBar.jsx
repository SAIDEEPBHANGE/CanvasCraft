import { Plus } from "lucide-react";

function PropertiesBar() {
  const colors = ["#000000", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6"];

  return (
    <aside
      id="propertiesBar"
      aria-label="Properties"
      /* Elevated above the bottom dock on fold/mobile screens with plenty of clearance */
      className="fixed bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:absolute lg:top-16 lg:bottom-auto lg:left-3 lg:translate-x-0 lg:flex-col lg:items-start lg:p-3"
    >
      {/* Colors */}
      <div className="flex items-center gap-1.5 lg:flex-col lg:items-start lg:gap-1.5">
        <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 lg:inline">
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

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 lg:my-1 lg:h-[1px] lg:w-full" />

      {/* Slider */}
      <div className="flex items-center gap-1.5 lg:w-full lg:flex-col lg:items-start lg:gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 lg:w-full">
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
          className="h-1.5 w-16 cursor-pointer accent-indigo-600 dark:accent-indigo-400 lg:w-32"
        />
      </div>
    </aside>
  );
}

export default PropertiesBar;
