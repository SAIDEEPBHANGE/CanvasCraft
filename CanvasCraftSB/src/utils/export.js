/**
 * Exports current whiteboard content as a PNG download
 */
export function exportCanvasToPNG(
  canvas,
  filename = "canvascraft.png",
  isDarkMode = false,
) {
  if (!canvas) return;

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = isDarkMode ? "#121212" : "#fdfdfd";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  ctx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.download = filename;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}
