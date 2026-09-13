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
  Plus,
} from "lucide-react";

function DrawingTools() {
  const toolBtnClass =
    "flex h-10 w-10 items-center justify-center rounded-[10px] border-none bg-transparent text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 [&.active]:bg-indigo-50 [&.active]:text-indigo-600 dark:[&.active]:bg-indigo-500/15 dark:[&.active]:text-indigo-400";

  const dropdownItemClass =
    "flex w-full items-center gap-2 rounded-md bg-transparent px-2.5 py-1.5 text-left text-xs font-medium text-slate-500 transition-colors duration-150 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400 [&.active]:bg-indigo-50 [&.active]:text-indigo-600 dark:[&.active]:bg-indigo-500/15 dark:[&.active]:text-indigo-400";

  return (
    <aside
      id="toolBar"
      aria-label="Drawing Tools"
      className="fixed bottom-4 left-1/2 z-10 flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-row items-center gap-2 rounded-full border border-slate-200 bg-white/85 p-2 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-300 dark:border-slate-700 dark:bg-slate-800/85 dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] md:absolute md:top-4 md:bottom-auto md:left-4 md:translate-x-0 md:flex-col md:rounded-2xl md:p-2"
    >
      {/* Tool Group */}
      <div className="flex flex-row items-center gap-1 md:flex-col md:gap-1.5">
        <button
          className={toolBtnClass}
          data-tool="select"
          title="Select (V)"
          aria-label="Select Tool"
        >
          <MousePointer className="h-5 w-5 stroke-2" />
        </button>

        <button
          className={toolBtnClass}
          data-tool="pan"
          title="Hand / Pan (H)"
          aria-label="Pan Tool"
        >
          <Hand className="h-5 w-5 stroke-2" />
        </button>

        {/* Mini separator */}
        <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700 md:my-1 md:h-px md:w-6" />

        <button
          className={toolBtnClass}
          data-tool="pencil"
          title="Pencil (P)"
          aria-label="Pencil Tool"
        >
          <Pencil className="h-5 w-5 stroke-2" />
        </button>

        {/* Shape selector container + dropdown */}
        <div className="group relative">
          <button
            className={toolBtnClass}
            data-tool="shape"
            id="shapeMenuBtn"
            title="Shapes (S)"
            aria-label="Shape Selector"
          >
            <Square className="h-5 w-5 stroke-2" />
          </button>

          {/* Submenu: sits above toolbar on mobile, sits to the right on desktop */}
          <div
            id="shapeMenu"
            className="invisible absolute bottom-[calc(100%+0.75rem)] left-1/2 z-20 flex min-w-32.5 -translate-x-1/2 translate-y-2 flex-col gap-1 rounded-[10px] border border-slate-200 bg-white p-1.5 opacity-0 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] md:top-0 md:bottom-auto md:left-[calc(100%+0.5rem)] md:-translate-x-2 md:translate-y-0 md:group-hover:translate-x-0"
          >
            <button
              className={dropdownItemClass}
              data-shape="rectangle"
              title="Rectangle"
            >
              <Square className="h-4 w-4" />
              <span>Rectangle</span>
            </button>
            <button
              className={dropdownItemClass}
              data-shape="circle"
              title="Circle"
            >
              <Circle className="h-4 w-4" />
              <span>Circle</span>
            </button>
            <button
              className={dropdownItemClass}
              data-shape="line"
              title="Line"
            >
              <Minus className="h-4 w-4" />
              <span>Line</span>
            </button>
            <button
              className={dropdownItemClass}
              data-shape="arrow"
              title="Arrow"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Arrow</span>
            </button>
          </div>
        </div>

        <button
          className={toolBtnClass}
          data-tool="text"
          title="Text (T)"
          aria-label="Text Tool"
        >
          <Type className="h-5 w-5 stroke-2" />
        </button>

        <button
          className={toolBtnClass}
          data-tool="sticky"
          title="Sticky Note (N)"
          aria-label="Sticky Note Tool"
        >
          <StickyNote className="h-5 w-5 stroke-2" />
        </button>

        {/* Mini separator */}
        <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700 md:my-1 md:h-px md:w-6" />

        <button
          className={toolBtnClass}
          data-tool="eraser"
          title="Eraser (E)"
          aria-label="Eraser Tool"
        >
          <Eraser className="h-5 w-5 stroke-2" />
        </button>
      </div>

      {/* Main Toolbar Divider */}
      <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700 md:my-1 md:h-px md:w-6" />

      {/* Color Palette */}
      <div
        id="colorPicker"
        title="Color Palette"
        className="flex flex-row items-center gap-1.5 md:flex-col md:gap-1.5"
      >
        <span
          className="h-5.5 w-5.5 cursor-pointer rounded-full border border-black/10 bg-[#0f172a] transition-transform duration-150 hover:scale-115 active:outline-2 active:outline-offset-2 active:outline-indigo-600 [&.active]:outline-2 [&.active]:outline-offset-2 [&.active]:outline-indigo-600"
          data-color="#0f172a"
        />
        <span
          className="h-5.5 w-5.5 cursor-pointer rounded-full border border-black/10 bg-[#6366f1] transition-transform duration-150 hover:scale-115 active:outline-2 active:outline-offset-2 active:outline-indigo-600 [&.active]:outline-2 [&.active]:outline-offset-2 [&.active]:outline-indigo-600"
          data-color="#6366f1"
        />
        <span
          className="h-5.5 w-5.5 cursor-pointer rounded-full border border-black/10 bg-[#ef4444] transition-transform duration-150 hover:scale-115 active:outline-2 active:outline-offset-2 active:outline-indigo-600 [&.active]:outline-2 [&.active]:outline-offset-2 [&.active]:outline-indigo-600"
          data-color="#ef4444"
        />
        <span
          className="h-5.5 w-5.5 cursor-pointer rounded-full border border-black/10 bg-[#10b981] transition-transform duration-150 hover:scale-115 active:outline-2 active:outline-offset-2 active:outline-indigo-600 [&.active]:outline-2 [&.active]:outline-offset-2 [&.active]:outline-indigo-600"
          data-color="#10b981"
        />

        {/* Custom Color Input */}
        <label
          className="relative flex h-5.5 w-5.5 cursor-pointer items-center justify-center rounded-full border border-dashed border-slate-400 text-slate-500 transition-colors hover:border-slate-600 dark:border-slate-500 dark:text-slate-400"
          title="Custom Color"
        >
          <input
            type="color"
            id="customColorInput"
            defaultValue="#0f172a"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <Plus className="h-3 w-3" />
        </label>
      </div>
    </aside>
  );
}

export default DrawingTools;
