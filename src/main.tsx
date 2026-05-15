import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/i18n/I18nProvider";
import App from "./App.tsx";
import "./index.css";
import { bootstrapVisualSettings } from "./lib/board-themes";
import { bootstrapSoundPack } from "./lib/chess-sounds";
import { bootstrapA11y } from "./lib/accessibility";

bootstrapVisualSettings();
bootstrapSoundPack();
bootstrapA11y();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
