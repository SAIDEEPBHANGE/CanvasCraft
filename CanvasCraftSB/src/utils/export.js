/**
 * Exports current whiteboard content as a timestamped PNG download
 */
export function exportCanvasToPNG(canvas, baseName = "canvascraft", isDarkMode = false) {
  if (!canvas) return;

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return;

  // Background matching active theme
  ctx.fillStyle = isDarkMode ? "#121212" : "#fdfdfd";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Paint drawings
  ctx.drawImage(canvas, 0, 0);

  // Generate ISO timestamp: YYYY-MM-DD_HH-MM
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const filename = `${baseName}_${dateStr}_${timeStr}.png`;

  // Trigger browser download
  const link = document.createElement("a");
  link.download = filename;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}