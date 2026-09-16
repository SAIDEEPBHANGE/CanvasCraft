import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

const SHORTCUT_GROUPS = [
  {
    category: "Tools",
    items: [
      { key: "V / 1", action: "Selection tool" },
      { key: "H", action: "Hand / Pan tool" },
      { key: "R / 2", action: "Rectangle" },
      { key: "C / 3", action: "Circle" },
      { key: "A / 4", action: "Arrow" },
      { key: "L / 5", action: "Line" },
      { key: "P / 6", action: "Pencil (Freehand)" },
      { key: "T / 7", action: "Text box" },
      { key: "S / 8", action: "Sticky note" },
      { key: "E / 9", action: "Eraser" },
    ],
  },
  {
    category: "Editing & Canvas",
    items: [
      { key: "Del / Backspace", action: "Delete selected item" },
      { key: "Ctrl + Z", action: "Undo" },
      { key: "Ctrl + Y", action: "Redo" },
      { key: "Ctrl + Shift + Z", action: "Redo" },
      { key: "Double Click", action: "Add/edit text in shape" },
      { key: "Wheel / Pinch", action: "Zoom to cursor" },
      { key: "Esc", action: "Close editor / Deselect" },
    ],
  },
];

function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Keyboard className="h-4 w-4 stroke-[2.2]" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1 no-scrollbar">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.category}
              </span>
              <div className="mt-1.5 space-y-1">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-slate-600 dark:text-slate-300">
                      {item.action}
                    </span>
                    <kbd className="min-w-6 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShortcutsModal;
