// In-app notification inbox in the navbar: unread counter, live updates
// and one-tap mark-as-read. Used for awards, coach recognition, etc.
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, GraduationCap, Award, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  kind: string;
  is_read: boolean;
  created_at: string;
};

const ICONS: Record<string, any> = { award: Award, coach: GraduationCap, info: Info };

export default function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_notifications")
      .select("id,title,body,link,kind,is_read,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as Notif[]) || []);
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_notifications", filter: `user_id=eq.${user.id}` },
        () => void load(),
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user?.id, load]);

  if (!user) return null;

  const unread = items.filter((i) => !i.is_read).length;

  const markAllRead = async () => {
    const ids = items.filter((i) => !i.is_read).map((i) => i.id);
    if (ids.length === 0) return;
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })));
    await supabase.from("user_notifications").update({ is_read: true }).in("id", ids);
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) void load(); }}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? `${unread} new notifications` : "Notifications"}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          )}
          {items.map((n) => {
            const Icon = ICONS[n.kind] || Info;
            const inner = (
              <div
                className={`flex gap-2 border-b border-border/60 px-3 py-3 ${
                  n.is_read ? "opacity-70" : "bg-primary/5"
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight">{n.title}</div>
                  {n.body && <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>}
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} className="block hover:bg-muted/40">{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
