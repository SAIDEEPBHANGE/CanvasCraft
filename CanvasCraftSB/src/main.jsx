import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { CanvasProvider } from "./context/CanvasContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <CanvasProvider>
        <App />
      </CanvasProvider>
    </ThemeProvider>
  </StrictMode>,
);
