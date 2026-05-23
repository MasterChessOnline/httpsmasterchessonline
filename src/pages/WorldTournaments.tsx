import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Trophy, MapPin, Calendar, Sparkles, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  title: string;
  location: string;
  dates: string;
  category: string;
  intro: string;
  storylines: string[];
}

interface ApiResp {
  ok?: boolean;
  articles?: Article[];
  generated_at?: string;
  error?: string;
}

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/world-tournaments`;
const CACHE_KEY = "world-tournaments-cache-v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h

export default function WorldTournaments() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { ts: number; data: ApiResp };
          if (Date.now() - parsed.ts < CACHE_TTL_MS && parsed.data.articles?.length) {
            setArticles(parsed.data.articles);
            setGeneratedAt(parsed.data.generated_at ?? null);
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore cache errors */ }
    }

    force ? setRefreshing(true) : setLoading(true);
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      if (!sessionRes?.session) {
        toast({ title: "Sign in required", description: "Please log in to load world tournaments." });
        return;
      }
      const { data, error } = await supabase.functions.invoke<ApiResp>("world-tournaments", {
        body: {},
      });
      if (error || !data || data.error || !data.articles?.length) {
        toast({ title: "Couldn't load tournaments", description: data?.error ?? error?.message ?? "Try again in a moment." });
        return;
      }
      setArticles(data.articles);
      setGeneratedAt(data.generated_at ?? null);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      console.error(e);
      toast({ title: "Network error", description: "Check your connection." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="World Chess Tournaments — Upcoming Events & Storylines"
        description="Fresh briefings on upcoming major chess tournaments around the world — Candidates, World Cup, Grand Swiss, Tata Steel, Norway Chess and more."
        path="/world-tournaments"
        type="website"
      />
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">World <span className="text-gradient-gold">Tournaments</span></h1>
              <p className="text-sm text-muted-foreground">Upcoming and ongoing events across the chess world</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {generatedAt && (
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                Updated {new Date(generatedAt).toLocaleString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing || loading} className="gap-2">
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Fetching the chess calendar…</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {articles.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="glass-4d border-primary/15 p-5 h-full flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary/30">
                      <Sparkles className="w-3 h-3 mr-1" />{a.category}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-display font-bold leading-tight">{a.title}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{a.location}</span>
                    <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{a.dates}</span>
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed">{a.intro}</p>
                  {a.storylines?.length > 0 && (
                    <div className="mt-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Storylines to follow</p>
                      <ul className="space-y-1">
                        {a.storylines.map((s, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary/70 mt-1">▸</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
