function PropertiesBar() {
  return (
    <div className="" id="propertiesBar">
      <label for="strokeWidth">Stroke:</label>
      <input type="range" id="strokeWidth" min="1" max="20" value="3" />
      <span id="strokeWidthValue">3px</span>
    </div>
  );
}
export default PropertiesBar;
