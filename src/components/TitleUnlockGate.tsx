// Title unlock popup is intentionally DISABLED.
// User requirement: titles must never trigger a popup/notification on entry
// (e.g. "Bot Hunter" showing up right after login). The hook still runs so
// `profiles.highest_title_key` keeps being persisted silently — only the
// visual popup is suppressed.

import { useTitleUnlock } from "@/hooks/use-title-unlock";

export default function TitleUnlockGate() {
  useTitleUnlock();
  return null;
}
