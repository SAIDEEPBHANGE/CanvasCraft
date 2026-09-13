import LeftHeader from "./HeaderComponents/LeftHeader";
import RightHeader from "./HeaderComponents/RightHeader";

function Header() {
  return (
    <header className="flex shrink-0 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
      <LeftHeader />
      <RightHeader />
    </header>
  );
}

export default Header;
