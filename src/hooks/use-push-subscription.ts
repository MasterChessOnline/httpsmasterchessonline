// Manages this device's push subscription:
// - Detects browser support
// - Requests permission with context (call enable() from a user gesture)
// - Subscribes with the server's VAPID public key
// - Upserts to push_subscriptions
// - Lets the user disable & unsubscribe

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PushStatus = "unsupported" | "denied" | "default" | "subscribed";

// VAPID public key — exposed publicly; safe in the client bundle.
// Prefer build-time VITE_VAPID_PUBLIC_KEY, otherwise fetch from the edge function.
const BUILD_VAPID_PUBLIC_KEY = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined;
let cachedVapidKey: string | undefined = BUILD_VAPID_PUBLIC_KEY;

async function getVapidPublicKey(): Promise<string | undefined> {
  if (cachedVapidKey) return cachedVapidKey;
  try {
    const { data, error } = await supabase.functions.invoke("push-public-key");
    if (error) throw error;
    cachedVapidKey = (data as any)?.publicKey || undefined;
    return cachedVapidKey;
  } catch (err) {
    console.error("failed to fetch VAPID public key", err);
    return undefined;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

function detectPlatform(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Macintosh/i.test(ua)) return "macos";
  if (/Windows/i.test(ua)) return "windows";
  return "other";
}

export function usePushSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<PushStatus>("default");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") { setStatus("denied"); return; }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "subscribed" : (perm === "default" ? "default" : "default"));
    } catch {
      setStatus("default");
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const enable = useCallback(async () => {
    if (!user || !VAPID_PUBLIC_KEY) return false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "default");
        return false;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }
      const json = sub.toJSON() as any;
      await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
          platform: detectPlatform(),
          user_agent: navigator.userAgent.slice(0, 500),
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" }
      );
      setStatus("subscribed");
      return true;
    } catch (err) {
      console.error("push enable failed", err);
      return false;
    } finally {
      setBusy(false);
    }
  }, [user]);

  const disable = useCallback(async () => {
    if (!user) return false;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("default");
      return true;
    } catch (err) {
      console.error("push disable failed", err);
      return false;
    } finally {
      setBusy(false);
    }
  }, [user]);

  return { status, busy, enable, disable, refresh, supported: status !== "unsupported" };
}
