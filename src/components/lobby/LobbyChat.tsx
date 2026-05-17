import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface LobbyMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

const MAX_MESSAGES = 80;
const SEND_COOLDOWN_MS = 2000;

export default function LobbyChat({ floating = false }: { floating?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(!floating);
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const lastSentRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load + realtime subscription
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("lobby_messages")
        .select("id, user_id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(MAX_MESSAGES);
      if (error || cancelled) return;
      const ids = Array.from(new Set((data || []).map((m) => m.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const pmap = new Map(
        (profiles || []).map((p) => [p.user_id, p]),
      );
      setMessages(
        (data || [])
          .reverse()
          .map((m) => ({
            ...m,
            display_name: pmap.get(m.user_id)?.display_name,
            avatar_url: pmap.get(m.user_id)?.avatar_url,
          })),
      );
    })();

    const channel = supabase
      .channel("lobby_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lobby_messages" },
        async (payload) => {
          const raw = payload.new as LobbyMessage;
          const { data: p } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", raw.user_id)
            .maybeSingle();
          setMessages((prev) => {
            const next = [
              ...prev,
              { ...raw, display_name: p?.display_name, avatar_url: p?.avatar_url },
            ].slice(-MAX_MESSAGES);
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "lobby_messages" },
        (payload) => {
          const id = (payload.old as { id?: string })?.id;
          if (!id) return;
          setMessages((prev) => prev.filter((m) => m.id !== id));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!user || !draft.trim() || sending) return;
    const now = Date.now();
    if (now - lastSentRef.current < SEND_COOLDOWN_MS) {
      toast("Sačekaj koju sekundu pre sledeće poruke");
      return;
    }
    const content = draft.trim().slice(0, 280);
    setSending(true);
    lastSentRef.current = now;
    const { error } = await supabase
      .from("lobby_messages")
      .insert({ user_id: user.id, content });
    setSending(false);
    if (error) {
      toast.error("Poruka nije poslata");
      return;
    }
    setDraft("");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("lobby_messages").delete().eq("id", id);
    if (error) toast.error("Brisanje neuspešno");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const panel = (
    <div className="flex flex-col h-full bg-gradient-to-br from-card via-card to-emerald-500/[0.04] border border-emerald-500/25 rounded-2xl overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_hsl(150_70%_55%)]" />
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-emerald-300">
            Lobby Chat
          </h3>
          <span className="text-[10px] text-muted-foreground">
            · {messages.length} messages
          </span>
        </div>
        {floating && (
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">
            Niko nije pisao još. Budi prvi 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = user?.id === m.user_id;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex gap-2"
            >
              <Link
                to={`/profile/${m.user_id}`}
                className="shrink-0 h-7 w-7 rounded-full bg-muted overflow-hidden border border-emerald-500/20 hover:border-emerald-500/60 transition"
              >
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-emerald-300">
                    {(m.display_name || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    to={`/profile/${m.user_id}`}
                    className="text-xs font-semibold text-emerald-300 hover:underline truncate"
                  >
                    {m.display_name || "Player"}
                  </Link>
                  <span className="text-[10px] text-muted-foreground/60">
                    {formatTime(m.created_at)}
                  </span>
                  {mine && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground/90 break-words leading-snug">
                  {m.content}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-emerald-500/20 p-2 bg-card/50">
        {user ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              maxLength={280}
              placeholder="Napiši poruku…"
              className="flex-1 h-9 px-3 rounded-lg bg-background/80 border border-emerald-500/20 focus:border-emerald-500/60 outline-none text-sm placeholder:text-muted-foreground/50"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              className="h-9 bg-emerald-500 hover:bg-emerald-400 text-background"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Link
            to="/login"
            className="block text-center text-xs text-muted-foreground hover:text-emerald-300 py-2"
          >
            Prijavi se da bi pisao u lobi
          </Link>
        )}
      </div>
    </div>
  );

  if (!floating) return <div className="h-[480px]">{panel}</div>;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-4 right-4 z-[80] w-[340px] h-[480px] hidden md:block"
          >
            {panel}
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-4 right-4 z-[80] h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-background shadow-[0_0_30px_hsl(150_70%_55%/0.5)] flex items-center justify-center hidden md:flex"
          >
            <MessageCircle className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
