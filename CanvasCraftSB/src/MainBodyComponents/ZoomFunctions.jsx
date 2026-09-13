import { ZoomIn, ZoomOut } from "lucide-react";

function ZoomFunctions() {
  return (
    <div className="">
      <button className="" id="zoomOutBtn" title="Zoom Out (-)">
        <ZoomOut />
      </button>
      <span id="zoomLevel">100%</span>
      <button className="" id="zoomInBtn" title="Zoom In (+)">
        <ZoomIn />
      </button>
      <button className="" id="zoomResetBtn" title="Reset Zoom">
        Reset
      </button>
    </div>
  );
}
export default ZoomFunctions;
