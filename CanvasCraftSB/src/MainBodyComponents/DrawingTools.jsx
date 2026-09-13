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
  return (
    <aside className="" id="toolBar" aria-label="Drawing Tools">
      <div className="">
        <button
          className=""
          data-tool="select"
          title="Select (V)"
          aria-label="Select Tool"
        >
          <MousePointer />
        </button>
        <button
          className=""
          data-tool="pan"
          title="Hand / Pan (H)"
          aria-label="Pan Tool"
        >
          <Hand />
        </button>
        <div className=""></div>
        <button
          className=""
          data-tool="pencil"
          title="Pencil (P)"
          aria-label="Pencil Tool"
        >
          <Pencil />
        </button>
        <div className="">
          <button
            className=""
            data-tool="shape"
            id="shapeMenuBtn"
            title="Shapes (S)"
            aria-label="Shape Selector"
          >
            <Square />
          </button>
          <div className="" id="shapeMenu">
            <button className="" data-shape="rectangle" title="Rectangle">
              <Square />
              <span>Rectangle</span>
            </button>
            <button className="" data-shape="circle" title="Circle">
              <Circle />
              <span>Circle</span>
            </button>
            <button className="" data-shape="line" title="Line">
              <Minus />
              <span>Line</span>
            </button>
            <button className="" data-shape="arrow" title="Arrow">
              <ArrowRight />
              <span>Arrow</span>
            </button>
          </div>
        </div>
        <button
          className=""
          data-tool="text"
          title="Text (T)"
          aria-label="Text Tool"
        >
          <Type />
        </button>
        <button
          className=""
          data-tool="sticky"
          title="Sticky Note (N)"
          aria-label="Sticky Note Tool"
        >
          <StickyNote />
        </button>
        <div className=""></div>
        <button
          className=""
          data-tool="eraser"
          title="Eraser (E)"
          aria-label="Eraser Tool"
        >
          <Eraser />
        </button>
      </div>
      <div className=""></div>
      <div className="" id="colorPicker" title="Color Palette">
        <span
          className=""
          // style="background: #0f172a"
          data-color="#0f172a"
        ></span>
        <span
          className=""
          // style="background: #6366f1"
          data-color="#6366f1"
        ></span>
        <span
          className=""
          // style="background: #ef4444"
          data-color="#ef4444"
        ></span>
        <span
          className=""
          // style="background: #10b981"
          data-color="#10b981"
        ></span>
        <label className="" title="Custom Color">
          <input type="color" id="customColorInput" value="#0f172a" />
          <Plus />
        </label>
      </div>
    </aside>
  );
}
export default DrawingTools;
