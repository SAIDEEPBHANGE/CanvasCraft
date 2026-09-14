import WhiteBoard from "./MainBodyComponents/WhiteBoard";
import Header from "./Header";
import DrawingTools from "./MainBodyComponents/DrawingTools";
import PropertiesBar from "./MainBodyComponents/PropertiesBar";
import ZoomFunctions from "./MainBodyComponents/ZoomFunctions";

function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fdfdfd] text-slate-800 touch-none select-none dark:bg-[#121212] dark:text-slate-100">
      {/* LAYER 1: Fullscreen Canvas */}
      <WhiteBoard />

      {/* LAYER 2: Floating HUD (Clicks pass through to canvas by default) */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2.5 sm:p-3 md:p-4">
        {/* Top Section: Header & Action Buttons */}
        <Header />

        {/* Middle Section: Left Sidebar Properties Drawer */}
        <div className="flex flex-1 items-start py-2">
          <PropertiesBar />
        </div>

        {/* Bottom Section: Tool Dock & Zoom Controls */}
        <div className="flex items-end justify-between gap-2">
          <ZoomFunctions />
          <DrawingTools />
        </div>
      </div>
    </div>
  );
}

export default App;
