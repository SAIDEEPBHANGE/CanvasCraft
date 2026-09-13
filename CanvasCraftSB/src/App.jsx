import Header from "./Header";
import MainBody from "./MainBody";

function App() {
  return (
    <div className="relative flex h-dvh w-screen flex-col overflow-hidden bg-[#fdfdfd] font-sans text-slate-800 select-none touch-none dark:bg-[#121212] dark:text-slate-100 md:block">
      <Header />
      <MainBody />
    </div>
  );
}

export default App;
