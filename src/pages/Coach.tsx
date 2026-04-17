import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Brain, Target, BookOpen, TrendingUp, Crown, ChevronsDown, Wand2, ClipboardPaste } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };
type Level = "beginner" | "intermediate" | "advanced" | "expert";

const SUGGESTED_PROMPTS = [
  { icon: Target, label: "Analyze a position", prompt: "Analyze this position for me using the full 6-section format:\n\nFEN: rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 5\n\nWhat should White play and why?" },
  { icon: TrendingUp, label: "Endgame improvement plan", prompt: "I lose too many endgames. Give me a concrete 4-week plan to improve my endgame technique, with what to focus on each week." },
  { icon: Brain, label: "Beat the Sicilian Defense", prompt: "What should I play as White against the Sicilian Defense? Give me one clear weapon, the main plan, the typical pawn structure, and one trap to know." },
  { icon: BookOpen, label: "Recommend openings for me", prompt: "Recommend 2 openings for White and 2 for Black that suit my level and a balanced positional style. For each, explain the main plan in 2 sentences." },
];

const COACH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chess-coach`;

const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

function inferLevel(rating?: number | null): Level {
  if (!rating) return "intermediate";
  if (rating < 1000) return "beginner";
  if (rating < 1500) return "intermediate";
  if (rating < 2000) return "advanced";
  return "expert";
}

export default function Coach() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [level, setLevel] = useState<Level>("intermediate");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.rating) setLevel(inferLevel(profile.rating));
  }, [profile?.rating]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string, mode?: "deeper" | "simpler") => {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(COACH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, rating: profile?.rating, level, mode }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast({ title: "Slow down", description: "Too many requests. Try again in a moment." });
        else if (resp.status === 402) toast({ title: "Coach unavailable", description: "AI credits exhausted." });
        else toast({ title: "Coach error", description: "Could not reach the coach." });
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Connection error", description: "Check your network and try again." });
    } finally {
      setStreaming(false);
    }
  };

  const explainMode = async (mode: "deeper" | "simpler") => {
    if (streaming) return;
    const prompt = mode === "deeper"
      ? "Go deeper on your previous answer. Add more variations, alternative plans, and typical resulting structures."
      : "Re-explain your previous answer in plain, simple language. No jargon, no variations.";
    await send(prompt, mode);
  };

  const pasteFenPgn = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      const isFen = /^[rnbqkpRNBQKP1-8\/]+\s+[wb]\s/.test(text.trim());
      const wrapper = isFen
        ? `Analyze this position using the full 6-section format:\n\nFEN: ${text.trim()}`
        : `Analyze this game / line using the full 6-section format:\n\n${text.trim()}`;
      setInput(wrapper);
    } catch {
      toast({ title: "Clipboard blocked", description: "Paste your FEN or PGN into the input manually." });
    }
  };

  if (loading || !user) return null;

  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant" && !streaming;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">Master<span className="text-gradient-gold">Coach</span></h1>
                <p className="text-sm text-muted-foreground">GM-level coaching · structured explanations · level-adapted</p>
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-card/40 border border-border/40">
              {(Object.keys(LEVEL_LABEL) as Level[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                    level === l ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {LEVEL_LABEL[l]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <Card className="glass-4d border-primary/20 overflow-hidden flex flex-col h-[calc(100vh-240px)] min-h-[500px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-semibold mb-1">Ask anything about chess</h2>
                  <p className="text-sm text-muted-foreground">Paste a FEN or PGN, ask about plans, or pick a starter below. You'll get GM-style structured coaching, not engine dumps.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.prompt)}
                      className="text-left p-4 rounded-xl border border-border/40 bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <p.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-tight">{p.label}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.prompt}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary/15 text-primary border border-primary/30"
                  }`}>
                    {m.role === "user" ? (profile?.display_name?.[0] ?? "U").toUpperCase() : "♛"}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    m.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-card/60 border border-border/40"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_h3]:text-primary [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_strong]:text-foreground [&_code]:bg-primary/15 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {lastIsAssistant && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 pl-11 pt-1"
              >
                <Button size="sm" variant="outline" onClick={() => explainMode("deeper")} className="h-8 text-xs gap-1.5">
                  <ChevronsDown className="w-3.5 h-3.5" /> Explain deeper
                </Button>
                <Button size="sm" variant="outline" onClick={() => explainMode("simpler")} className="h-8 text-xs gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Simplify
                </Button>
              </motion.div>
            )}
          </div>

          <div className="border-t border-border/40 p-3 bg-background/40">
            <div className="flex gap-2 items-end">
              <Button
                onClick={pasteFenPgn}
                size="icon"
                variant="outline"
                className="h-11 w-11 shrink-0"
                disabled={streaming}
                title="Paste FEN or PGN from clipboard"
              >
                <ClipboardPaste className="w-4 h-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask the coach… paste a FEN/PGN, or ask 'What's my plan in the King's Indian?'"
                rows={1}
                className="resize-none min-h-[44px] max-h-32 bg-background/60"
                disabled={streaming}
              />
              <Button
                onClick={() => send(input)}
                disabled={!input.trim() || streaming}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
