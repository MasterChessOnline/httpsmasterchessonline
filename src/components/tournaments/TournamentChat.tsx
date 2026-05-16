import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface TournamentMessage {
  id: string;
  tournament_id: string;
  user_id: string;
  content: string;
  created_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

const MAX_MESSAGES = 100;
const SEND_COOLDOWN_MS = 2000;

export default function TournamentChat({ tournamentId }: { tournamentId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TournamentMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const lastSentRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tournamentId) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("tournament_messages")
        .select("id, tournament_id, user_id, content, created_at")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: false })
        .limit(MAX_MESSAGES);
      if (cancelled) return;
      const ids = Array.from(new Set((data || []).map((m) => m.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
      const pmap = new Map((profiles || []).map((p) => [p.user_id, p]));
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
      .channel(`tournament_chat:${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tournament_messages",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        async (payload) => {
          const raw = payload.new as TournamentMessage;
          const { data: p } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", raw.user_id)
            .maybeSingle();
          setMessages((prev) =>
            [
              ...prev,
              { ...raw, display_name: p?.display_name, avatar_url: p?.avatar_url },
            ].slice(-MAX_MESSAGES),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tournament_messages",
          filter: `tournament_id=eq.${tournamentId}`,
        },
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
  }, [tournamentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!user || !draft.trim() || sending) return;
    const now = Date.now();
    if (now - lastSentRef.current < SEND_COOLDOWN_MS) {
      toast("Sačekaj koju sekundu");
      return;
    }
    const content = draft.trim().slice(0, 280);
    setSending(true);
    lastSentRef.current = now;
    const { error } = await supabase
      .from("tournament_messages")
      .insert({ tournament_id: tournamentId, user_id: user.id, content });
    setSending(false);
    if (error) {
      toast.error("Poruka nije poslata");
      return;
    }
    setDraft("");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tournament_messages").delete().eq("id", id);
    if (error) toast.error("Brisanje neuspešno");
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-[420px] bg-gradient-to-br from-card via-card to-amber-500/[0.04] border border-amber-500/25 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/5">
        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-amber-300">
          Tournament Chat
        </h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {messages.length} messages
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">
            Niko nije pisao u ovom turniru još.
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
                className="shrink-0 h-7 w-7 rounded-full bg-muted overflow-hidden border border-amber-500/20 hover:border-amber-500/60 transition"
              >
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-amber-300">
                    {(m.display_name || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    to={`/profile/${m.user_id}`}
                    className="text-xs font-semibold text-amber-300 hover:underline truncate"
                  >
                    {m.display_name || "Player"}
                  </Link>
                  <span className="text-[10px] text-muted-foreground/60">{fmt(m.created_at)}</span>
                  {mine && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground/90 break-words leading-snug">{m.content}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-amber-500/20 p-2 bg-card/50">
        {user ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              maxLength={280}
              placeholder="Napiši poruku…"
              className="flex-1 h-9 px-3 rounded-lg bg-background/80 border border-amber-500/20 focus:border-amber-500/60 outline-none text-sm placeholder:text-muted-foreground/50"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              className="h-9 bg-amber-500 hover:bg-amber-400 text-background"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="block text-center text-xs text-muted-foreground hover:text-amber-300 py-2"
          >
            Prijavi se da bi pisao
          </Link>
        )}
      </div>
    </div>
  );
}
