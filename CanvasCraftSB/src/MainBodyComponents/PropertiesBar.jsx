function PropertiesBar() {
  return (
    <div
      id="propertiesBar"
      className="absolute top-2 right-2 z-10 flex items-center gap-2.5 rounded-[10px] border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/85 dark:text-slate-400 md:top-4 md:right-4"
    >
      <label htmlFor="strokeWidth" className="cursor-pointer select-none">
        Stroke:
      </label>
      <input
        type="range"
        id="strokeWidth"
        min="1"
        max="20"
        defaultValue="3"
        className="h-1.5 w-20 cursor-pointer accent-indigo-600 dark:accent-indigo-400"
      />
      <span id="strokeWidthValue" className="min-w-7 select-none text-right">
        3px
      </span>
    </div>
  );
}

export default PropertiesBar;
