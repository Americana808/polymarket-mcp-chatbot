import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// FontAwesome library registration (must be imported before any FontAwesomeIcon usage)
// FontAwesome library bootstrap removed; we import icons directly where needed

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
