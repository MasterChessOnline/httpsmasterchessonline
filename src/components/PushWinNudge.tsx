// Retention nudge shown right after a game result: turn on push notifications
// so players come back when someone challenges them or a tournament starts.
// Renders nothing when push is unsupported, already enabled, denied, the user
// is signed out, or the nudge was dismissed on this device.
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePushSubscription } from "@/hooks/use-push-subscription";

const DISMISS_KEY = "mc_push_nudge_dismissed";

export default function PushWinNudge() {
  const { user } = useAuth();
  const { status, busy, enable, supported, refresh } = usePushSubscription();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!user || dismissed || !supported) return null;
  if (status === "subscribed" || status === "denied" || status === "unsupported") return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch { /* ignore quota */ }
    setDismissed(true);
  };

  const handleEnable = async () => {
    const ok = await enable();
    if (ok) {
      toast.success("Notifications on — we'll ping you when someone challenges you.");
      refresh();
      dismiss();
    } else {
      toast.error("Couldn't turn notifications on.");
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-sky-500/20 p-2 text-sky-300 shrink-0">
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-sky-100">Never miss a challenge</p>
          <p className="text-[11px] leading-snug text-sky-200/80">
            Get a ping when a friend challenges you, your turn comes up, or a tournament starts.
          </p>
          <div className="mt-2.5 flex gap-2">
            <Button size="sm" onClick={handleEnable} disabled={busy} className="h-8 text-xs">
              {busy ? "Enabling…" : "Turn on"}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss} className="h-8 text-xs text-zinc-400">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
