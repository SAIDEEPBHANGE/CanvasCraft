import { useCanvas } from "../context/useCanvas";

export default function StorageNotice() {
  const { storageError, dismissStorageError } = useCanvas();
  if (!storageError) return null;

  return (
    <div
      role="status"
      className="pointer-events-auto absolute left-1/2 top-16 z-20 flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm text-amber-900 shadow dark:border-amber-500 dark:bg-amber-950 dark:text-amber-100"
    >
      <span>
        Your changes could not be saved in this browser. Export your work to
        avoid losing it.
      </span>
      <button
        type="button"
        onClick={dismissStorageError}
        className="rounded px-2 py-0.5 font-medium hover:bg-amber-200 dark:hover:bg-amber-900"
      >
        Dismiss
      </button>
    </div>
  );
}
