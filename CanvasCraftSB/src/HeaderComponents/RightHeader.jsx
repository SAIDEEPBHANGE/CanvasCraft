import { Undo2, Redo2, Sun, Moon } from "lucide-react";

function RightHeader() {
  return (
    <div className="flex">
      <div className="">
        <button
          className=""
          id="undoBtn"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 />
        </button>
        <button
          className=""
          id="redoBtn"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo2 />
        </button>
      </div>
      <div className=""></div>
      <button
        className=""
        id="themeToggle"
        title="Toggle Theme"
        aria-label="Toggle Theme"
      >
        <Sun />
        <Moon />
      </button>
      <button className="" id="clearCanvas">
        Clear
      </button>
      <button className="" id="exportBtn">
        Export
      </button>
    </div>
  );
}
export default RightHeader;
