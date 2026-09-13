import { useEffect, useRef } from "react";

function WhiteBoard() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <section
      aria-label="Canvas Workspace"
      className="relative h-full w-full touch-none overflow-hidden bg-[#fdfdfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[#121212] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"
    >
      <canvas
        id="whiteboard"
        ref={canvasRef}
        className="block h-full w-full touch-none"
      />
    </section>
  );
}

export default WhiteBoard;
