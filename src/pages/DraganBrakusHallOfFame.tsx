// /dragan-brakus/hall-of-fame — permanent record of past DB Cup winners.
// Indexable, JSON-LD enriched, drives long-tail "Dragan Brakus Cup 2026 winner" queries.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Crown, Medal, Sparkles, Flag } from "lucide-react";

type HOF = {
  id: string;
  tournament_id: string;
  edition_year: number;
  category: string;
  display_name: string;
  country: string | null;
  details: any;
};

const CATEGORY_META: Record<string, { label: string; icon: any; tint: string }> = {
  champion:        { label: "Champion",         icon: Crown,     tint: "text-yellow-300" },
  runner_up:       { label: "Runner-up",        icon: Medal,     tint: "text-zinc-200" },
  third:           { label: "Third place",      icon: Medal,     tint: "text-amber-500" },
  brilliancy:      { label: "Brilliancy",       icon: Sparkles,  tint: "text-fuchsia-300" },
  upset:           { label: "Biggest Upset",    icon: Trophy,    tint: "text-emerald-300" },
  junior:          { label: "Best Junior (U16)",icon: Trophy,    tint: "text-cyan-300" },
  veteran:         { label: "Best Veteran 50+", icon: Trophy,    tint: "text-orange-300" },
  country:         { label: "Country Cup",      icon: Flag,      tint: "text-sky-300" },
  ambassador:      { label: "Top Ambassador",   icon: Trophy,    tint: "text-pink-300" },
  fighting_spirit: { label: "Fighting Spirit",  icon: Trophy,    tint: "text-red-300" },
};

export default function DraganBrakusHallOfFame() {
  const [rows, setRows] = useState<HOF[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("tournament_hall_of_fame")
        .select("*")
        .order("edition_year", { ascending: false })
        .order("category");
      setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const byYear: Record<number, HOF[]> = {};
  for (const r of rows) (byYear[r.edition_year] ??= []).push(r);
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  const jsonLd = rows
    .filter((r) => r.category === "champion")
    .map((r) => ({
      "@context": "https://schema.org",
      "@type": "Person",
      name: r.display_name,
      nationality: r.country || "RS",
      award: `Dragan Brakus Cup ${r.edition_year} Champion`,
    }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Dragan Brakus Cup — Hall of Fame"
        description="Permanent record of every Dragan Brakus Cup champion, runner-up, brilliancy winner and special prize laureate."
        path="/dragan-brakus/hall-of-fame"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <header className="mb-8">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 mb-3">
            Hall of Fame
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Dragan Brakus Cup — Hall of Fame
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Every champion, every brilliancy, every upset. The permanent record of
            MasterChess' most important blitz event.
          </p>
        </header>

        {loading && <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>}

        {!loading && rows.length === 0 && (
          <Card className="p-8 text-center">
            <Trophy className="h-10 w-10 text-yellow-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold">No editions have concluded yet.</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              The first edition is on 23 July 2026. Be one of the first names ever
              engraved here — register now.
            </p>
            <Button asChild className="mt-5 bg-yellow-500 text-black hover:bg-yellow-400">
              <Link to="/dragan-brakus/register">Register for DB Cup 2026</Link>
            </Button>
          </Card>
        )}

        {years.map((y) => (
          <section key={y} className="mb-8">
            <h2 className="text-2xl font-bold mb-3">Edition {y}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {byYear[y].map((r) => {
                const m = CATEGORY_META[r.category] || { label: r.category, icon: Trophy, tint: "text-muted-foreground" };
                const Icon = m.icon;
                return (
                  <Card key={r.id} className="p-4 border-yellow-500/20">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${m.tint}`} />
                      <span className={`text-xs uppercase tracking-wider ${m.tint}`}>{m.label}</span>
                    </div>
                    <div className="mt-1 text-lg font-semibold">{r.display_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.country ? `${r.country} · ` : ""}
                      {r.details?.score != null ? `${r.details.score} pts` : ""}
                      {r.details?.performance ? ` · perf ${r.details.performance}` : ""}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}

        <div className="text-center mt-10">
          <Button asChild variant="outline">
            <Link to="/dragan-brakus">Back to DB Cup</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
