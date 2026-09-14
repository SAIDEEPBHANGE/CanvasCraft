export function renderElement(ctx, element) {
  const { type, strokeColor, strokeWidth, angle = 0 } = element;
  const bounds = getElementBounds(element);

  ctx.save();

  if (angle !== 0) {
    ctx.translate(bounds.cx, bounds.cy);
    ctx.rotate(angle);
    ctx.translate(-bounds.cx, -bounds.cy);
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (type) {
    case "sticky": {
      // 1. Drop shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      // 2. Note body with rounded corners
      const radius = 6;
      ctx.fillStyle = element.bgColor || "#fef08a";
      ctx.beginPath();
      ctx.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, radius);
      ctx.fill();
      ctx.restore();

      // 3. Border
      ctx.strokeStyle = element.strokeColor || "#facc15";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, radius);
      ctx.stroke();

      // 4. Render text with line wrapping
      if (element.text) {
        ctx.fillStyle = "#1e293b";
        ctx.font = "14px 'Inter', sans-serif";
        ctx.textBaseline = "top";

        const padding = 10;
        const maxWidth = bounds.width - padding * 2;
        const lineHeight = 18;
        let yPos = bounds.y + padding;

        const paragraphs = element.text.split("\n");
        for (const para of paragraphs) {
          const words = para.split(" ");
          let line = "";

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              ctx.fillText(line, bounds.x + padding, yPos);
              line = words[n] + " ";
              yPos += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, bounds.x + padding, yPos);
          yPos += lineHeight;
        }
      }
      break;
    }

    case "text": {
      if (element.text) {
        ctx.fillStyle = strokeColor || "#000000";
        ctx.font = "16px 'Inter', sans-serif";
        ctx.textBaseline = "top";
        const lines = element.text.split("\n");
        lines.forEach((line, i) => {
          ctx.fillText(line, bounds.x, bounds.y + i * 20);
        });
      }
      break;
    }

    // Keep pencil, rectangle, circle, line, arrow cases as they were
    case "pencil": {
      const { points } = element;
      if (!points || points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      break;
    }

    case "rectangle": {
      ctx.beginPath();
      ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.stroke();
      break;
    }

    case "circle": {
      ctx.beginPath();
      ctx.ellipse(
        bounds.cx,
        bounds.cy,
        bounds.width / 2,
        bounds.height / 2,
        0,
        0,
        2 * Math.PI,
      );
      ctx.stroke();
      break;
    }

    case "line": {
      ctx.beginPath();
      ctx.moveTo(element.x1, element.y1);
      ctx.lineTo(element.x2, element.y2);
      ctx.stroke();
      break;
    }

    case "arrow": {
      ctx.beginPath();
      ctx.moveTo(element.x1, element.y1);
      ctx.lineTo(element.x2, element.y2);
      ctx.stroke();
      const angle = Math.atan2(
        element.y2 - element.y1,
        element.x2 - element.x1,
      );
      const headLength = 14;
      ctx.beginPath();
      ctx.moveTo(element.x2, element.y2);
      ctx.lineTo(
        element.x2 - headLength * Math.cos(angle - Math.PI / 6),
        element.y2 - headLength * Math.sin(angle - Math.PI / 6),
      );
      ctx.moveTo(element.x2, element.y2);
      ctx.lineTo(
        element.x2 - headLength * Math.cos(angle + Math.PI / 6),
        element.y2 - headLength * Math.sin(angle + Math.PI / 6),
      );
      ctx.stroke();
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
