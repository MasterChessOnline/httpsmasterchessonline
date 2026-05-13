import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { bootstrapVisualSettings } from "./lib/board-themes";
import { bootstrapSoundPack } from "./lib/chess-sounds";

bootstrapVisualSettings();
bootstrapSoundPack();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
