import LeftHeader from "./HeaderComponents/LeftHeader";
import RightHeader from "./HeaderComponents/RightHeader";

function Header() {
  return (
    <header className="z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:pointer-events-none md:absolute md:inset-x-0 md:top-0 md:h-auto md:border-none md:bg-transparent md:p-4 md:backdrop-blur-none">
      <div className="md:pointer-events-auto">
        <LeftHeader />
      </div>
      <div className="md:pointer-events-auto">
        <RightHeader />
      </div>
    </header>
  );
}

export default Header;
