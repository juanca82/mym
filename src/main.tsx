import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // ✅ Sin .tsx, Vite lo detecta automáticamente
import "./index.css"; // ✅ Opcional si tienes estilos globales

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);