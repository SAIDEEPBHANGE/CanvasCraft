/**
 * Exports the canvas as a downloadable PNG
 */
export function exportCanvasToPNG(
  canvas,
  filename = "canvascraft.png",
  isDarkMode = false,
) {
  if (!canvas) return;

  // Create an offscreen canvas to paint background and content together
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return;

  // Draw background matching theme
  ctx.fillStyle = isDarkMode ? "#121212" : "#fdfdfd";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Draw current canvas on top
  ctx.drawImage(canvas, 0, 0);

  // Trigger download
  const link = document.createElement("a");
  link.download = filename;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}
