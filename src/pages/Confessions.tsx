import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Send, Lock, Globe } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface ConfessionRow {
  id: string;
  body: string;
  handle: string;
  created_at: string;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const Confessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feed, setFeed] = useState<ConfessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [showHandle, setShowHandle] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data, error } = await (supabase.rpc as any)("public_confessions", { p_limit: 50 });
    if (!error && Array.isArray(data)) setFeed(data as ConfessionRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!user) {
      toast({ title: "Sign in first", description: "You need an account to confess." });
      return;
    }
    const text = body.trim();
    if (text.length < 3) return;
    if (text.length > 280) {
      toast({ title: "Too long", description: "Keep it under 280 characters." });
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).from("confessions").insert({
      user_id: user.id,
      body: text,
      is_public: isPublic,
      show_handle: showHandle,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }
    setBody("");
    toast({
      title: isPublic ? "Posted to the booth" : "Saved privately",
      description: isPublic ? "Your confession is in the feed." : "Only you can see this one.",
    });
    if (isPublic) load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Confession Booth — One sentence, no judgement"
        description="Lost the game? Drop one sentence about what went wrong. Anonymous by default. Pure human chess thoughts — no engines, no scores."
        path="/confessions"
        type="website"
      />
      <Navbar />

      <main className="container mx-auto max-w-2xl px-4 pt-24 pb-24">
        <motion.header
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
            <Heart className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Confession Booth
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            One sentence. <span className="text-gradient-gold">No judgement.</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Just lost a game? Played a move you regret? Tell the booth.
            Anonymous by default. No engine review, no rating change — just honesty.
          </p>
        </motion.header>

        {/* Compose */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur p-5 mb-10 shadow-xl"
        >
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 280))}
            placeholder={
              user
                ? "I blundered a knight on move 12 and never recovered…"
                : "Sign in to drop a confession."
            }
            disabled={!user}
            rows={3}
            className="resize-none bg-background/60 border-border/50 focus-visible:ring-primary/40"
          />
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>{body.length}/280</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={!user}
                />
                <Label htmlFor="public" className="flex items-center gap-1 cursor-pointer">
                  {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {isPublic ? "Public" : "Private"}
                </Label>
              </div>
              {isPublic && user && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="handle"
                    checked={showHandle}
                    onCheckedChange={setShowHandle}
                  />
                  <Label htmlFor="handle" className="cursor-pointer">
                    Show my name
                  </Label>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            {user ? (
              <Button
                onClick={submit}
                disabled={submitting || body.trim().length < 3}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Posting…" : "Confess"}
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline">Sign in to confess</Button>
              </Link>
            )}
          </div>
        </motion.section>

        {/* Feed */}
        <section>
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-border/40" />
            Recent confessions
            <span className="h-px flex-1 bg-border/40" />
          </h2>

          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
          ) : feed.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              The booth is empty. Be the first to confess.
            </p>
          ) : (
            <ul className="space-y-3">
              {feed.map((c, i) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
                  className="rounded-xl border border-border/30 bg-card/40 backdrop-blur p-4"
                >
                  <p className="text-sm text-foreground leading-relaxed">"{c.body}"</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>— {c.handle}</span>
                    <span>{timeAgo(c.created_at)}</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Confessions;
