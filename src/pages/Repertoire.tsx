import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Crown, Target, Sparkles, ChevronRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRepertoire, STYLE_INFO, type Color, type Style, type RepertoireLine } from "@/lib/repertoire-data";

const STORAGE_KEY = "masterchess.repertoire";

export default function Repertoire() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [color, setColor] = useState<Color | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { color: c, style: s } = JSON.parse(saved);
        if (c && s) {
          setColor(c); setStyle(s); setGenerated(true);
        }
      } catch {}
    }
  }, []);

  const generate = () => {
    if (!color || !style) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ color, style }));
    setGenerated(true);
  };

  const reset = () => {
    setGenerated(false);
    setColor(null);
    setStyle(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading || !user) return null;

  const rep = generated && color && style ? getRepertoire(color, style) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Opening <span className="text-gradient-gold">Repertoire</span></h1>
              <p className="text-sm text-muted-foreground">Build a personal opening plan tailored to your style.</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!generated ? (
            <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <Card className="glass-4d border-primary/20 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-primary">1.</span> Choose your color
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(["white", "black"] as Color[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        color === c
                          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                          : "border-border/40 hover:border-primary/40 bg-card/40"
                      }`}
                    >
                      <div className="text-4xl mb-2">{c === "white" ? "♔" : "♚"}</div>
                      <p className="font-semibold capitalize">{c}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c === "white" ? "Initiative, set the tone" : "React, counter-attack"}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="glass-4d border-primary/20 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-primary">2.</span> Pick your playstyle
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(Object.keys(STYLE_INFO) as Style[]).map((s) => {
                    const info = STYLE_INFO[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          style === s
                            ? "border-primary bg-primary/10"
                            : "border-border/40 hover:border-primary/40 bg-card/40"
                        }`}
                      >
                        <div className="text-2xl mb-1">{info.icon}</div>
                        <p className="font-semibold text-sm">{info.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{info.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <div className="flex justify-end">
                <Button size="lg" onClick={generate} disabled={!color || !style} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate My Repertoire
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary capitalize">
                    {color} · {style && STYLE_INFO[style].label}
                  </Badge>
                  <Badge variant="outline">Saved to your profile</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={reset}>Rebuild</Button>
              </div>

              {rep && (
                <>
                  <LineCard line={rep.primary} variant="primary" />
                  <LineCard line={rep.alternative} variant="alt" />
                  <Card className="glass-4d border-primary/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Target className="w-10 h-10 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold">Want a deeper plan?</p>
                      <p className="text-sm text-muted-foreground">Ask MasterCoach for typical traps, model games, or how to handle Black's sidelines.</p>
                    </div>
                    <Button onClick={() => navigate("/coach")} className="gap-2 shrink-0">
                      Ask Coach <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Card>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function LineCard({ line, variant }: { line: RepertoireLine; variant: "primary" | "alt" }) {
  const navigate = useNavigate();
  return (
    <Card className={`glass-4d p-6 ${variant === "primary" ? "border-primary/40 shadow-[0_0_40px_rgba(212,175,55,0.1)]" : "border-border/40"}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {variant === "primary" ? (
              <Crown className="w-4 h-4 text-primary" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alternative</span>
            )}
            <Badge variant="outline" className="text-[10px]">{line.eco}</Badge>
          </div>
          <h3 className="text-2xl font-display font-bold">{line.name}</h3>
        </div>
      </div>

      <div className="bg-background/60 border border-border/40 rounded-lg p-3 mb-4 font-mono text-sm">
        {line.moves}
      </div>

      <p className="text-sm mb-4 leading-relaxed">{line.idea}</p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">Your Plan</p>
          <ul className="space-y-1.5">
            {line.plan.map((p, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">Key Squares</p>
          <div className="flex flex-wrap gap-1.5">
            {line.keySquares.map((sq) => (
              <span key={sq} className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-xs font-mono text-primary">
                {sq}
              </span>
            ))}
          </div>
        </div>
      </div>

      {line.trap && (
        <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-3 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs uppercase tracking-wider text-yellow-500 font-bold mb-1">Trap to know</p>
            <p className="text-sm text-muted-foreground">{line.trap}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/openings")}>
          <BookOpen className="w-3.5 h-3.5" /> Study in Trainer
        </Button>
      </div>
    </Card>
  );
}
