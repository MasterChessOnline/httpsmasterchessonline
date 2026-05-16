import { useEffect, useState } from "react";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * PWA push notifications opt-in.
 * Uses the browser Notification API + service worker for local notifications
 * (move played, your turn, tournament starting, friend invite, etc.).
 */
export default function PushNotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { status, busy, enable, disable, supported, refresh } = usePushSubscription();
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const enabled = status === "subscribed";

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, [status]);

  const handleEnable = async () => {
    if (!supported) {
      toast.error("Vaš pretraživač ne podržava push obaveštenja.");
      return;
    }
    const ok = await enable();
    if (typeof window !== "undefined" && "Notification" in window) setPermission(Notification.permission);
    if (ok) {
      toast.success("Obaveštenja uključena.");
      refresh();
    } else if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
      toast.error("Dozvola za obaveštenja nije data.");
    } else {
      toast.error("Nije moguće uključiti obaveštenja.");
    }
  };

  const handleDisable = async () => {
    const ok = await disable();
    if (ok) toast.success("Obaveštenja isključena.");
    else toast.error("Nije moguće isključiti obaveštenja.");
  };

  const handleTest = async () => {
    if (!user) {
      toast.error("Morate biti prijavljeni.");
      return;
    }
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("push-send", {
        body: {
          user_ids: [user.id],
          type: "system",
          payload: {
            title: "MasterChess test",
            body: "Push obaveštenja rade! ♟️",
            url: "/",
          },
        },
      });
      if (error) throw error;
      const sent = (data as any)?.sent ?? 0;
      if (sent > 0) toast.success(`Test poslat (${sent}). Proveri notifikacije.`);
      else toast.error("Nije poslato — proveri da je uređaj pretplaćen.");
    } catch (err: any) {
      console.error(err);
      toast.error("Greška pri slanju testa.");
    } finally {
      setTesting(false);
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
            <Button
              type="button"
              size="sm"
              variant={enabled ? "outline" : "default"}
              disabled={busy || !supported || status === "denied"}
              onClick={enabled ? handleDisable : handleEnable}
              className="shrink-0"
            >
              {busy ? "Loading..." : enabled ? "Disable" : "Enable"}
            </Button>
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
