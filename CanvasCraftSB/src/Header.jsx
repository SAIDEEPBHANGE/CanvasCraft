import LeftHeader from "./HeaderComponents/LeftHeader";
import RightHeader from "./HeaderComponents/RightHeader";

function Header() {
  return (
    <header className="flex w-full items-center justify-between">
      <div className="pointer-events-auto">
        <LeftHeader />
      </div>
      <div className="pointer-events-auto">
        <RightHeader />
      </div>
    </header>
  );
}

export default Header;
