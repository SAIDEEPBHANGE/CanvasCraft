import { Plus } from "lucide-react";
import { useCanvas } from "../context/CanvasContext";
import { DEFAULT_COLORS, STROKE_CONFIG } from "../utils/constants";

function PropertiesBar() {
  const { strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } =
    useCanvas();

  return (
    <aside
      id="propertiesBar"
      aria-label="Properties"
      className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 shadow-md backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:absolute lg:top-16 lg:left-3 lg:flex-col lg:items-start lg:p-3"
    >
      {/* Color Palette */}
      <div className="flex items-center gap-1.5 lg:flex-col lg:items-start lg:gap-1.5">
        <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 lg:inline">
          Stroke
        </span>
        <div className="flex items-center gap-1">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setStrokeColor(color)}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              className={`h-5 w-5 shrink-0 rounded-md ring-offset-1 transition-transform hover:scale-110 active:scale-95 dark:ring-offset-slate-900 ${
                strokeColor === color ? "ring-2 ring-indigo-500" : ""
              }`}
            />
          ))}

          {/* Native Color Picker */}
          <label
            className={`relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed text-slate-500 transition-colors ${
              !DEFAULT_COLORS.includes(strokeColor)
                ? "border-indigo-500 ring-2 ring-indigo-500"
                : "border-slate-300 hover:border-slate-500 dark:border-slate-700"
            }`}
            style={{
              backgroundColor: !DEFAULT_COLORS.includes(strokeColor)
                ? strokeColor
                : "transparent",
            }}
            title="Custom Color"
          >
            <input
              type="color"
              id="customColorInput"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {DEFAULT_COLORS.includes(strokeColor) && (
              <Plus className="h-3 w-3" />
            )}
          </label>
        </div>
      </div>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 lg:my-1 lg:h-px lg:w-full" />

      {/* Stroke Slider */}
      <div className="flex items-center gap-1.5 lg:w-full lg:flex-col lg:items-start lg:gap-1.5">
        <div className="hidden items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 lg:flex lg:w-full">
          <span>Size</span>
          <span className="font-mono text-[10px]">{strokeWidth}px</span>
        </div>
        <input
          type="range"
          id="strokeWidth"
          min={STROKE_CONFIG.MIN_WIDTH}
          max={STROKE_CONFIG.MAX_WIDTH}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="h-1.5 w-14 cursor-pointer accent-indigo-600 dark:accent-indigo-400 sm:w-20 lg:w-32"
        />
      </div>
    </aside>
  );
}

export default PropertiesBar;
