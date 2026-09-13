import DrawingTools from "./MainBodyComponents/DrawingTools";
import PropertiesBar from "./MainBodyComponents/PropertiesBar";
import WhiteBoard from "./MainBodyComponents/WhiteBoard";
import ZoomFunctions from "./MainBodyComponents/ZoomFunctions";

function MainBody() {
  return (
    <main className="relative flex-1 w-full h-full overflow-hidden touch-none md:absolute md:inset-0">
      <WhiteBoard />
      <DrawingTools />
      <PropertiesBar />
      <ZoomFunctions />
    </main>
  );
}

export default MainBody;
