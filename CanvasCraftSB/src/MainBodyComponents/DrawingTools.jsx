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
} from "lucide-react";
import { useCanvas } from "../context/CanvasContext";
import { TOOLS } from "../utils/constants";
function DrawingTools() {
  const { activeTool, setActiveTool } = useCanvas();
  const getToolBtnClass = (toolName) =>
    `flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border-none transition-all active:scale-95 ${
      activeTool === toolName
        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
        : "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    }`;
  const TOOLBAR_GROUPS = [
    // First segment: Navigation & Selection
    [
      { id: TOOLS.PAN, label: "Pan (Hand)", icon: Hand, shortcut: "H" },
      { id: TOOLS.SELECT, label: "Select", icon: MousePointer, shortcut: "V" },
    ],
    // Second segment: Drawing & Creation tools
    [
      { id: TOOLS.RECTANGLE, label: "Rectangle", icon: Square, shortcut: "R" },
      { id: TOOLS.CIRCLE, label: "Circle", icon: Circle, shortcut: "C" },
      { id: TOOLS.ARROW, label: "Arrow", icon: ArrowRight, shortcut: "A" },
      { id: TOOLS.LINE, label: "Line", icon: Minus, shortcut: "L" },
      { id: TOOLS.PENCIL, label: "Pencil", icon: Pencil, shortcut: "P" },
      { id: TOOLS.TEXT, label: "Text", icon: Type, shortcut: "T" },
      {
        id: TOOLS.STICKY,
        label: "Sticky Note",
        icon: StickyNote,
        shortcut: "S",
      },
    ],
    // Third segment: Deletion
    [{ id: TOOLS.ERASER, label: "Eraser", icon: Eraser, shortcut: "E" }],
  ];
  return (
    <aside
      id="toolBar"
      aria-label="Drawing Tools"
      className="pointer-events-auto flex w-full max-w-full items-center justify-start gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md no-scrollbar dark:border-slate-800 dark:bg-slate-900/95 sm:justify-center lg:absolute lg:top-3 lg:left-1/2 lg:w-auto lg:-translate-x-1/2"
    >
      {TOOLBAR_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-1 shrink-0">
          {group.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTool(item.id)}
                className={`relative ${getToolBtnClass(item.id)}`}
                title={`${item.label} (${item.shortcut})`}
              >
                <Icon className="h-4 w-4 stroke-2" />
                <span className="absolute bottom-0.5 right-1 select-none font-mono text-[9px] font-semibold leading-none opacity-60">
                  {item.shortcut}
                </span>
              </button>
            );
          })}
          {groupIndex < TOOLBAR_GROUPS.length - 1 && (
            <div className="mx-0.5 h-4 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />
          )}
        </div>
      ))}
    </aside>
  );
}
export default DrawingTools;
