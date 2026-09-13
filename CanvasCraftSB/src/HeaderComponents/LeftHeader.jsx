import { Paintbrush } from "lucide-react";

function LeftHeader() {
  return (
    <div className="flex items-center gap-2 text-base font-bold text-indigo-600 transition-colors duration-200 dark:text-indigo-400">
      <Paintbrush className="h-5 w-5 stroke-2" />
      <span className="logo-text hidden text-[1.1rem] tracking-tight sm:inline-block">
        CanvasCraft
      </span>
    </div>
  );
}

export default LeftHeader;
