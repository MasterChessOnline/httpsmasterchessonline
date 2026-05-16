import { useEffect, useState } from "react";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * PWA push notifications opt-in.
 * Uses the browser Notification API + service worker for local notifications
 * (move played, your turn, tournament starting, friend invite, etc.).
 */
export default function PushNotificationToggle() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
    try {
      setEnabled(localStorage.getItem("mc_push_enabled") === "1");
    } catch {}
  }, []);

  const toggle = async (next: boolean) => {
    if (!supported) {
      toast.error("Vaš pretraživač ne podržava push obaveštenja.");
      return;
    }
    setLoading(true);
    try {
      if (next) {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") {
          toast.error("Dozvola za obaveštenja nije data.");
          setLoading(false);
          return;
        }
        // Test notification via SW if available
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification("MasterChess obaveštenja uključena", {
            body: "Bićete obavešteni kada vas neko izazove ili kad počne turnir.",
            icon: "/app-icon-192.png",
            badge: "/app-icon-192.png",
            tag: "mc-welcome",
          });
        } catch {}
        localStorage.setItem("mc_push_enabled", "1");
        setEnabled(true);
        if (user) {
          await supabase.from("profiles").update({ push_notifications_enabled: true } as any).eq("user_id", user.id);
        }
        toast.success("Obaveštenja uključena.");
      } else {
        localStorage.setItem("mc_push_enabled", "0");
        setEnabled(false);
        if (user) {
          await supabase.from("profiles").update({ push_notifications_enabled: false } as any).eq("user_id", user.id);
        }
        toast.success("Obaveštenja isključena.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          {enabled && permission === "granted" ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Push obaveštenja</p>
              <p className="text-xs text-muted-foreground">
                Igre, izazovi, turniri — obaveštenja čak i kad je tab zatvoren.
              </p>
            </div>
            <Switch checked={enabled && permission === "granted"} disabled={loading || !supported} onCheckedChange={toggle} />
          </div>
          {!supported && (
            <p className="text-xs text-amber-500 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Pretraživač ne podržava push.
            </p>
          )}
          {supported && permission === "denied" && (
            <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Dozvola je odbijena — uključite je u podešavanjima pretraživača.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
