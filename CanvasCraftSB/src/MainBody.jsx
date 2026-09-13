import DrawingTools from "./MainBodyComponents/DrawingTools";
import PropertiesBar from "./MainBodyComponents/PropertiesBar";
import WhiteBoard from "./MainBodyComponents/WhiteBoard";
import ZoomFunctions from "./MainBodyComponents/ZoomFunctions";

function MainBody() {
  return (
    <main className="relative flex h-full w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700">
      <DrawingTools />
      <PropertiesBar />
      <WhiteBoard />
      <ZoomFunctions />
    </main>
  );
}

export default MainBody;
