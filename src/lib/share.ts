// Web Share API + clipboard fallback.
// Use everywhere we want to share game, PGN, profile, chess card, etc.

import { toast } from "sonner";

export interface ShareInput {
  title?: string;
  text?: string;
  url?: string;
  /** Toast message override on successful clipboard fallback */
  fallbackToast?: string;
}

export function canNativeShare(data?: ShareInput): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function") return false;
  if (data && typeof navigator.canShare === "function") {
    try { return navigator.canShare(data); } catch { return true; }
  }
  return true;
}

export async function share(input: ShareInput): Promise<"native" | "clipboard" | "cancelled" | "error"> {
  const payload: ShareInput = {
    title: input.title,
    text: input.text,
    url: input.url ?? (typeof window !== "undefined" ? window.location.href : undefined),
  };

  if (canNativeShare(payload)) {
    try {
      await navigator.share(payload as ShareData);
      return "native";
    } catch (err: any) {
      // User cancelled the share sheet — silent, not an error
      if (err?.name === "AbortError") return "cancelled";
      // fallthrough to clipboard
    }
  }

  // Clipboard fallback
  const textToCopy = [payload.title, payload.text, payload.url].filter(Boolean).join(" — ");
  try {
    await navigator.clipboard.writeText(textToCopy || payload.url || "");
    toast.success(input.fallbackToast ?? "Link copied to clipboard");
    return "clipboard";
  } catch {
    toast.error("Couldn't share. Copy the link manually.");
    return "error";
  }
}

/** React hook returning the share fn — stable identity. */
export function useShare() {
  return share;
}
