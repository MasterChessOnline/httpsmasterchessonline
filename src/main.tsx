import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapVisualSettings } from "./lib/board-themes";

bootstrapVisualSettings();

createRoot(document.getElementById("root")!).render(<App />);

