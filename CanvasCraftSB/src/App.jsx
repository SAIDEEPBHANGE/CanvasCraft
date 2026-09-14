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

      {/* LAYER 2: Floating HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2.5 sm:p-3 md:p-4">
        {/* Top: Left Brand & Right Actions */}
        <Header />

        {/* Bottom Area */}
        <div className="flex flex-col gap-2">
          {/* Row Above Tools: Property Bar (Left) + Zoom Controls (Right) */}
          <div className="flex items-center justify-between gap-2">
            <PropertiesBar />
            <ZoomFunctions />
          </div>

          {/* Very Bottom: Drawing Tool Dock */}
          <div className="flex justify-center">
            <DrawingTools />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
