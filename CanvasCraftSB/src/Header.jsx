import LeftHeader from "./HeaderComponents/LeftHeader";
import RightHeader from "./HeaderComponents/RightHeader";

function Header() {
  return (
    <header className="flex">
      <LeftHeader />
      <RightHeader />
    </header>
  );
}
export default Header;
