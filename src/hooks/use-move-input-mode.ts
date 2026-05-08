// Centralized move-input mode hook.
// Default: "drag" (drag-and-drop). User can switch to "click" (tap-to-move) or "both" in Settings.
// Persisted via the chess-settings localStorage key.

import { useEffect, useState } from "react";
import { getSetting, saveSetting } from "@/lib/user-settings";

export type MoveInputMode = "drag" | "click" | "both";

const KEY = "moveInputMode";
const DEFAULT: MoveInputMode = "drag";

export function getMoveInputMode(): MoveInputMode {
  const v = getSetting(KEY as any, DEFAULT) as MoveInputMode;
  return v === "click" || v === "both" || v === "drag" ? v : DEFAULT;
}

export function setMoveInputMode(mode: MoveInputMode) {
  saveSetting(KEY as any, mode);
  // Notify other open tabs/components within the same tab
  window.dispatchEvent(new CustomEvent("mc:move-input-mode-changed", { detail: mode }));
}

export function useMoveInputMode(): [MoveInputMode, (m: MoveInputMode) => void] {
  const [mode, setMode] = useState<MoveInputMode>(() => getMoveInputMode());
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<MoveInputMode>).detail;
      if (detail) setMode(detail);
      else setMode(getMoveInputMode());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "chess-settings") setMode(getMoveInputMode());
    };
    window.addEventListener("mc:move-input-mode-changed", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("mc:move-input-mode-changed", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return [mode, (m: MoveInputMode) => { setMoveInputMode(m); setMode(m); }];
}

/** Quick helpers used by board components. */
export function dragEnabled(mode: MoveInputMode) { return mode !== "click"; }
export function clickEnabled(mode: MoveInputMode) { return mode !== "drag"; }
