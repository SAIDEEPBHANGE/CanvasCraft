import DrawingTools from "./MainBodyComponents/DrawingTools";
import PropertiesBar from "./MainBodyComponents/PropertiesBar";
import WhiteBoard from "./MainBodyComponents/WhiteBoard";
import ZoomFunctions from "./MainBodyComponents/ZoomFunctions";

function MainBody() {
  return (
    <main className="">
      <DrawingTools />
      <PropertiesBar />
      <WhiteBoard />
      <ZoomFunctions />
    </main>
  );
}
export default MainBody;
