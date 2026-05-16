import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ASKED_KEY = "mc.notif.asked.v1";
const INSTALLED_KEY = "mc.install.done.v1";

/**
 * After the user installs the PWA (or runs it standalone), gently ask for
 * Notification permission. Lets us send tournament reminders, friend
 * challenges, game-start pings. Shows once — never nags again.
 */
export default function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return; // already granted/denied
    if (localStorage.getItem(ASKED_KEY) === "1") return;

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    const wasInstalled = localStorage.getItem(INSTALLED_KEY) === "1";

    // Only ask in the installed app context — never in a regular browser tab.
    if (!isStandalone && !wasInstalled) return;

    const t = setTimeout(() => setShow(true), 4500);
    return () => clearTimeout(t);
  }, []);

  const enable = async () => {
    localStorage.setItem(ASKED_KEY, "1");
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        toast.success("Notifications enabled", {
          description: "We'll ping you for tournaments, challenges and game invites.",
        });
        // Welcome shot so the user sees it actually works
        try {
          new Notification("Master Chess", {
            body: "You're all set — see you on the board!",
            icon: "/app-icon-192.png",
            badge: "/app-icon-192.png",
          });
        } catch {}
      } else {
        toast("Notifications skipped", {
          description: "You can enable them later in your device settings.",
        });
      }
    } catch {}
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem(ASKED_KEY, "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 z-[70] max-w-sm"
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <div className="relative rounded-2xl border border-amber-400/40 bg-gradient-to-br from-zinc-900/95 via-black/95 to-zinc-900/95 backdrop-blur-xl p-4 shadow-[0_20px_60px_-10px_rgba(201,168,76,0.4)]">
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_60%)] pointer-events-none" />
            <div className="relative flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 blur-md bg-amber-400/50 rounded-xl" />
                <div className="relative h-11 w-11 rounded-xl border border-amber-400/50 bg-gradient-to-br from-amber-300/30 to-amber-500/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-300" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-amber-100">Stay in the action</span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300/80" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  Tournament starts, friend challenges, your turn to move — never miss it.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={enable}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-display uppercase tracking-wider"
                  >
                    Enable
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismiss} className="text-zinc-400 hover:text-zinc-200">
                    Not now
                  </Button>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="text-zinc-500 hover:text-zinc-200 shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
