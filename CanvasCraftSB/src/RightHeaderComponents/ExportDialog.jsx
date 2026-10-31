import { useEffect, useMemo, useRef, useState } from "react";
import { X, Copy, Image as ImageIcon, FileCode } from "lucide-react";
import { useCanvas } from "../context/useCanvas";
import { useTheme } from "../context/useTheme";
import { readJson, writeJson } from "../utils/persistence";
import {
  EXPORT_SCALES,
  buildExportFilename,
  getExportBounds,
  getExportElements,
  getExportSize,
  renderSceneToCanvas,
  renderSceneToSVG,
  sanitizeExportOptions,
} from "../utils/exportScene";

const STORAGE_KEY = "exportOptions";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      "image/png",
    );
  });
}

function Toggle({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
    >
      <span>{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-indigo-600"
      />
    </label>
  );
}

function ExportDialog({ isOpen, onClose }) {
  const { elements, selectedIds } = useCanvas();
  const { theme } = useTheme();
  const dialogRef = useRef(null);
  const [options, setOptions] = useState(() => {
    const stored = readJson(STORAGE_KEY, null);
    const options = sanitizeExportOptions(stored);
    return stored ? options : { ...options, darkMode: theme === "dark" };
  });
  const [status, setStatus] = useState(null);

  const exportElements = useMemo(
    () => getExportElements(elements, selectedIds),
    [elements, selectedIds],
  );
  const isSelectionOnly =
    selectedIds.length > 0 && exportElements.length < elements.length;
  const exportTheme = options.darkMode ? "dark" : "light";
  const bounds = useMemo(
    () => getExportBounds(exportElements),
    [exportElements],
  );
  const size = bounds ? getExportSize(bounds, options.scale) : null;

  const previewUrl = useMemo(() => {
    if (!isOpen || !bounds) return null;
    const previewScale = getExportSize(bounds, 1).tooLarge ? null : 1;
    if (!previewScale) return null;
    const canvas = renderSceneToCanvas({
      elements: exportElements,
      theme: exportTheme,
      background: options.background,
      scale: previewScale,
    });
    return canvas ? canvas.toDataURL("image/png") : null;
  }, [isOpen, bounds, exportElements, exportTheme, options.background]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    const focusables = () =>
      dialogRef.current?.querySelectorAll(
        "button:not(:disabled), input, [tabindex]",
      ) ?? [];
    focusables()[0]?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab") {
        const items = [...focusables()];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateOptions = (patch) => {
    const next = { ...options, ...patch };
    setOptions(next);
    setStatus(null);
    writeJson(STORAGE_KEY, next);
  };

  const buildCanvas = () =>
    renderSceneToCanvas({
      elements: exportElements,
      theme: exportTheme,
      background: options.background,
      scale: options.scale,
    });

  const handlePng = async () => {
    try {
      const canvas = buildCanvas();
      if (!canvas) throw new Error("Nothing to export");
      downloadBlob(await canvasToBlob(canvas), buildExportFilename("png"));
      setStatus({ type: "success", message: "PNG downloaded." });
    } catch {
      setStatus({ type: "error", message: "Could not create the PNG." });
    }
  };

  const handleSvg = () => {
    const svg = renderSceneToSVG({
      elements: exportElements,
      theme: exportTheme,
      background: options.background,
    });
    if (!svg) {
      setStatus({ type: "error", message: "Could not create the SVG." });
      return;
    }
    downloadBlob(
      new Blob([svg], { type: "image/svg+xml" }),
      buildExportFilename("svg"),
    );
    setStatus({ type: "success", message: "SVG downloaded." });
  };

  const handleCopy = async () => {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      setStatus({
        type: "error",
        message: "Copying images is not supported in this browser.",
      });
      return;
    }
    try {
      const canvas = buildCanvas();
      if (!canvas) throw new Error("Nothing to export");
      const blob = await canvasToBlob(canvas);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setStatus({ type: "success", message: "Copied to clipboard." });
    } catch {
      setStatus({
        type: "error",
        message: "Clipboard access was denied or failed.",
      });
    }
  };

  const isEmpty = !bounds;
  const blocked = isEmpty || size?.tooLarge;
  const actionClass =
    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
          <h3
            id="export-title"
            className="text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base"
          >
            Export image
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex h-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-[repeating-conic-gradient(#e2e8f0_0%_25%,transparent_0%_50%)] bg-size-[16px_16px] dark:border-slate-700 dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,transparent_0%_50%)]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Export preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <p className="px-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {isEmpty
                ? "The board is empty. Draw something to export it."
                : "Preview unavailable for a board this large."}
            </p>
          )}
        </div>

        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {isEmpty
            ? "Nothing to export"
            : `${isSelectionOnly ? "Selection only" : "Whole board"} · ${size.width} × ${size.height} px`}
        </p>

        <div className="mt-3 space-y-1">
          <Toggle
            id="export-background"
            label="Include background"
            checked={options.background}
            onChange={(background) => updateOptions({ background })}
          />
          <Toggle
            id="export-dark"
            label="Dark mode colors"
            checked={options.darkMode}
            onChange={(darkMode) => updateOptions({ darkMode })}
          />
          <div
            role="group"
            aria-label="Scale"
            className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300"
          >
            <span>Scale</span>
            <div className="flex gap-1">
              {EXPORT_SCALES.map((scale) => (
                <button
                  key={scale}
                  type="button"
                  aria-pressed={options.scale === scale}
                  onClick={() => updateOptions({ scale })}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    options.scale === scale
                      ? "bg-indigo-600 text-white dark:bg-indigo-500"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {size?.tooLarge && (
          <p
            role="alert"
            className="mt-2 text-xs text-red-600 dark:text-red-400"
          >
            This board is too large at {options.scale}x. Choose a smaller scale
            or select fewer elements.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handlePng}
            disabled={blocked}
            className={`${actionClass} bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600`}
          >
            <ImageIcon className="h-4 w-4" /> PNG
          </button>
          <button
            type="button"
            onClick={handleSvg}
            disabled={isEmpty}
            className={`${actionClass} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
          >
            <FileCode className="h-4 w-4" /> SVG
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={blocked}
            className={`${actionClass} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>

        <p
          role="status"
          aria-live="polite"
          className={`mt-2 min-h-4 text-xs ${
            status?.type === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {status?.message}
        </p>
      </div>
    </div>
  );
}

export default ExportDialog;
