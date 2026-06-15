import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link as LinkIcon, Copy, Check, Share2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIME_CONTROLS: Array<{ label: string; initial: number; increment: number }> = [
  { label: "3+0", initial: 180, increment: 0 },
  { label: "5+0", initial: 300, increment: 0 },
  { label: "10+5", initial: 600, increment: 5 },
  { label: "15+10", initial: 900, increment: 10 },
];

function randomCode(len = 6) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/**
 * Create a private share-link `/vs/{code}` and send to a friend.
 * Pure viral mechanism — no signup required for the visitor until they accept.
 */
export default function ChallengeLinkCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [tc, setTc] = useState(TIME_CONTROLS[2]);
  const [link, setLink] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<number | null>(null);

  const fullUrl = link
    ? (typeof window !== "undefined" ? `${window.location.origin}${link}` : link)
    : null;

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const create = async () => {
    if (!user) {
      toast({ title: "Sign in first", description: "Create a free account to send challenges." });
      navigate("/signup");
      return;
    }
    setCreating(true);
    try {
      let attempts = 0;
      let inserted: any = null;
      while (attempts < 5 && !inserted) {
        const newCode = randomCode();
        const { data, error } = await (supabase as any)
          .from("challenge_links")
          .insert({
            code: newCode,
            creator_id: user.id,
            time_control_label: tc.label,
            initial_time: tc.initial,
            increment: tc.increment,
            is_rated: false,
          })
          .select()
          .single();
        if (!error && data) {
          inserted = data;
          break;
        }
        attempts += 1;
      }
      if (!inserted) {
        toast({ title: "Couldn't create link", description: "Try again.", variant: "destructive" });
        return;
      }
      setCode(inserted.code);
      setLink(`/vs/${inserted.code}`);

      // Poll for claim — when a friend joins, navigate to the game
      pollRef.current = window.setInterval(async () => {
        const { data } = await (supabase as any)
          .from("challenge_links")
          .select("status, game_id")
          .eq("code", inserted.code)
          .maybeSingle();
        if (data?.status === "claimed" && data?.game_id) {
          if (pollRef.current) window.clearInterval(pollRef.current);
          navigate(`/play/online?game=${data.game_id}`);
        }
      }, 2500);
    } finally {
      setCreating(false);
    }
  };

  const cancel = async () => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    if (code) {
      await (supabase as any).from("challenge_links").delete().eq("code", code);
    }
    setCode(null);
    setLink(null);
    setOpen(false);
  };

  const copy = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const shareText = "I challenge you to a chess game on MasterChess — click to play:";
  const wa = fullUrl ? `https://wa.me/?text=${encodeURIComponent(`${shareText} ${fullUrl}`)}` : "#";
  const tg = fullUrl ? `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}` : "#";

  const nativeShare = async () => {
    if (!fullUrl) return;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: "MasterChess Challenge", text: shareText, url: fullUrl });
      } catch {}
    } else {
      copy();
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 px-4 py-2.5 text-sm font-display font-bold uppercase tracking-wider text-primary transition-colors"
      >
        <LinkIcon className="h-4 w-4" />
        Challenge a friend
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-xl p-5 space-y-4 max-w-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground">Challenge a friend</h3>
        <button onClick={cancel} className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!link ? (
        <>
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Time control</div>
            <div className="grid grid-cols-4 gap-2">
              {TIME_CONTROLS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setTc(t)}
                  className={`rounded-lg border px-2 py-2 text-sm font-display font-bold transition-colors ${
                    tc.label === t.label
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-background/50 text-foreground hover:border-primary/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={create} disabled={creating} className="w-full h-11 font-display font-bold uppercase tracking-wider">
            {creating ? "Creating…" : "Generate link"}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Unrated · 24h expiry · friend doesn't need an account to start
          </p>
        </>
      ) : (
        <>
          <div className="rounded-xl bg-background/70 border border-border/60 p-3 space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Share this link</div>
            <div className="font-mono text-sm text-foreground break-all">{fullUrl}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={copy} className="h-11">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" onClick={nativeShare} className="h-11">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-md border border-border/60 hover:bg-muted/50 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={tg}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-md border border-border/60 hover:bg-muted/50 text-sm font-medium"
            >
              <Send className="h-4 w-4" />
              Telegram
            </a>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Waiting for your friend to accept…
          </div>
        </>
      )}
    </motion.div>
  );
}
