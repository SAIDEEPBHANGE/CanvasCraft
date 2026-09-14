/**
 * Draws an arrowhead at the tip of a line
 */
function drawArrowhead(ctx, fromX, fromY, toX, toY, headLength = 14) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

/**
 * Renders an element based on its type and coordinate data
 */
export function renderElement(ctx, element) {
  const { type, strokeColor, strokeWidth } = element;

  ctx.save();
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
      const { x1, y1, x2, y2 } = element;
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);

      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.stroke();
      break;
    }

    case "circle": {
      const { x1, y1, x2, y2 } = element;
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const radiusX = Math.abs(x2 - x1) / 2;
      const radiusY = Math.abs(y2 - y1) / 2;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
      break;
    }

    case "line": {
      const { x1, y1, x2, y2 } = element;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      break;
    }

    case "arrow": {
      const { x1, y1, x2, y2 } = element;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      drawArrowhead(ctx, x1, y1, x2, y2);
      break;
    }

    default:
      break;
  }

  ctx.restore();
}