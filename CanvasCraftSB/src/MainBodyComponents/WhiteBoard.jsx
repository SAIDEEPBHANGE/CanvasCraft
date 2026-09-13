function WhiteBoard() {
  return (
    <section className="h-full w-full touch-none bg-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[20px_20px] dark:bg-slate-800 dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
      <canvas id="whiteboard" className="block h-full w-full"></canvas>
    </section>
  );
}

export default WhiteBoard;
