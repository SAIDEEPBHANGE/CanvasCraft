/**
 * Draws an arrowhead at the tip of a line
 */
function drawArrowhead(ctx, fromX, fromY, toX, toY, headLength = 14) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

/**
 * Calculates center, width, and height of an element
 */
export function getElementBounds(element) {
  if (element.type === "pencil") {
    const xs = element.points.map((p) => p.x);
    const ys = element.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 10),
      height: Math.max(maxY - minY, 10),
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
    };
  }

  const minX = Math.min(element.x1, element.x2);
  const minY = Math.min(element.y1, element.y2);
  const width = Math.abs(element.x2 - element.x1);
  const height = Math.abs(element.y2 - element.y1);

  return {
    x: minX,
    y: minY,
    width: Math.max(width, 10),
    height: Math.max(height, 10),
    cx: minX + width / 2,
    cy: minY + height / 2,
  };
}

/**
 * Renders an individual element with rotation and styling
 */
export function renderElement(ctx, element) {
  const { type, strokeColor, strokeWidth, angle = 0 } = element;
  const bounds = getElementBounds(element);

  ctx.save();

  // Apply rotation around the element's center point
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
      drawArrowhead(ctx, element.x1, element.y1, element.x2, element.y2);
      break;
    }

    case "sticky": {
      // Soft shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Note background
      ctx.fillStyle = element.bgColor || "#fef08a"; // Default post-it yellow
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.restore();

      // Border outline
      ctx.strokeStyle = strokeColor || "#eab308";
      ctx.lineWidth = 1;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

      // Render inner text
      if (element.text) {
        ctx.fillStyle = "#1e293b";
        ctx.font = `${element.fontSize || 14}px 'Inter', sans-serif`;
        ctx.textBaseline = "top";
        const lines = element.text.split("\n");
        lines.forEach((line, i) => {
          ctx.fillText(line, bounds.x + 8, bounds.y + 8 + i * 18);
        });
      }
      break;
    }

    case "text": {
      if (element.text) {
        ctx.fillStyle = strokeColor;
        ctx.font = `${element.fontSize || 18}px 'Inter', sans-serif`;
        ctx.textBaseline = "top";
        const lines = element.text.split("\n");
        lines.forEach((line, i) => {
          ctx.fillText(line, bounds.x, bounds.y + i * 22);
        });
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Draws the bounding box and rotation handle for the selected item
 */
export function renderSelectionBox(ctx, element) {
  const bounds = getElementBounds(element);
  const angle = element.angle || 0;
  const padding = 6;

  ctx.save();
  if (angle !== 0) {
    ctx.translate(bounds.cx, bounds.cy);
    ctx.rotate(angle);
    ctx.translate(-bounds.cx, -bounds.cy);
  }

  const x = bounds.x - padding;
  const y = bounds.y - padding;
  const w = bounds.width + padding * 2;
  const h = bounds.height + padding * 2;

  // Bounding rect outline
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  // Rotation handle stem and handle node
  const handleDistance = 22;
  const handleX = x + w / 2;
  const handleY = y - handleDistance;

  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(handleX, handleY);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(handleX, handleY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
