// Tiny gate component that watches for title unlocks and renders the popup.
// Lives at the app root so it's available on every page for the logged-in user.

import TitleUnlockPopup from "./TitleUnlockPopup";
import { useTitleUnlock } from "@/hooks/use-title-unlock";

export default function TitleUnlockGate() {
  const { unlockedKey, dismiss } = useTitleUnlock();
  return <TitleUnlockPopup titleKey={unlockedKey} onDismiss={dismiss} />;
}
