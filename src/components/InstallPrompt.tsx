import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "mc_install_dismissed_at";
const DISMISS_DAYS = 7;

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissed && Date.now() - dismissed < DISMISS_DAYS * 86400_000) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setTimeout(() => setShow(true), 8000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && deferred && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 z-[60] max-w-sm"
        >
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-400/15 p-2">
                <Download className="h-5 w-5 text-amber-300" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-amber-100">Install MasterChess</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Quick access, offline mode, no app store.
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={install} className="bg-amber-500 hover:bg-amber-400 text-black">
                    Install
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismiss}>Later</Button>
                </div>
              </div>
              <button onClick={dismiss} className="text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
